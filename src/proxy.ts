import { NextResponse } from 'next/server';

function readCookie(request: Request, name: string): string {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function publicStorefrontApiBase(): string {
  if (process.env.NODE_ENV !== 'production') {
    return (
      process.env.INTERNAL_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE ||
      'http://127.0.0.1:5000/api/storefront/public'
    ).replace(/\/+$/, '');
  }
  return (
    process.env.INTERNAL_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'https://api.evoclabs.com/api/storefront/public'
  ).replace(/\/+$/, '');
}

const domainCache = new Map<string, { subdomain: string; storeId: string; expiry: number }>();
const subdomainCache = new Map<string, { subdomain: string; id: string; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function proxy(request: Request) {
  const hostname = request.headers.get('host') || '';
  let cleanHostname = hostname.split(':')[0].toLowerCase();
  if (cleanHostname.startsWith('www.')) cleanHostname = cleanHostname.substring(4);

  const requestUrl = new URL(request.url);
  if (requestUrl.pathname.startsWith('/store-error')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-storefront-error', '1');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let subdomain = requestUrl.searchParams.get('subdomain') || readCookie(request, 'x-store-subdomain');
  const queryStoreId = requestUrl.searchParams.get('storeId');
  const storeId = queryStoreId || readCookie(request, 'x-store-id');
  let resolvedFromDomain: { subdomain: string; id: string } | null = null;

  if (!subdomain) {
    const isLocalhost = cleanHostname === 'localhost' || cleanHostname === '127.0.0.1' || cleanHostname.endsWith('.localhost');
    if (isLocalhost) {
      subdomain = cleanHostname === 'localhost' || cleanHostname === '127.0.0.1'
        ? process.env.NEXT_PUBLIC_SUBDOMAIN || ''
        : cleanHostname.split('.')[0];
    } else {
      const isEvoclabsSubdomain = cleanHostname.endsWith('.evoclabs.com');
      if (!isEvoclabsSubdomain && !storeId) {
        const now = Date.now();
        const cached = domainCache.get(cleanHostname);
        if (cached && cached.expiry > now) {
          subdomain = cached.subdomain;
          resolvedFromDomain = { subdomain: cached.subdomain, id: cached.storeId };
        } else {
          try {
            const apiBase = process.env.INTERNAL_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
            const resolveRes = await fetch(`${apiBase}/resolve?domain=${cleanHostname}`, { cache: 'no-store' });
            const resolveData = await resolveRes.json();
            if (!resolveData.success || !resolveData.store) {
              return NextResponse.redirect(new URL(`/store-error?reason=${encodeURIComponent(resolveData.message || 'Invalid store domain')}`, request.url));
            }
            subdomain = resolveData.store.subdomain;
            resolvedFromDomain = { subdomain, id: resolveData.store.id };
            domainCache.set(cleanHostname, { subdomain, storeId: resolveData.store.id, expiry: now + CACHE_TTL_MS });
          } catch (error) {
            console.error('[PROXY] Custom domain resolve failed:', error);
            return NextResponse.redirect(new URL('/store-error?reason=Resolution+failed', request.url));
          }
        }
      } else if (isEvoclabsSubdomain) {
        subdomain = cleanHostname.split('.')[0];
      }
    }
  }

  try {
    let resolvedStore = resolvedFromDomain;
    const now = Date.now();

    if (!resolvedStore && subdomain && !queryStoreId) {
      const cached = subdomainCache.get(subdomain);
      if (cached && cached.expiry > now) {
        resolvedStore = cached;
      }
    }

    if (!resolvedStore || queryStoreId) {
      const apiBase = publicStorefrontApiBase();
      const apiUrl = queryStoreId || (!subdomain && storeId)
        ? `${apiBase}/${encodeURIComponent(subdomain || 'preview')}/frontend?storeId=${encodeURIComponent(storeId)}&includeProducts=false&includeLegal=false`
        : `${apiBase}/${encodeURIComponent(subdomain || 'preview')}/info`;
      const response = await fetch(apiUrl, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return NextResponse.redirect(new URL(`/store-error?reason=${encodeURIComponent(data.message || 'Store not found')}`, request.url));
      }
      resolvedStore = data.store || data.data;
      if (subdomain && resolvedStore?.id) {
        subdomainCache.set(subdomain, { subdomain, id: resolvedStore.id, expiry: now + CACHE_TTL_MS });
      }
    }

    if (resolvedStore?.subdomain) subdomain = resolvedStore.subdomain;
    const resolvedStoreId = storeId || resolvedStore?.id || '';
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);
    if (resolvedStoreId) requestHeaders.set('x-store-id', resolvedStoreId);

    const nextResponse = NextResponse.next({ request: { headers: requestHeaders } });
    if (subdomain) nextResponse.cookies.set('x-store-subdomain', subdomain, { path: '/', sameSite: 'lax' });
    if (resolvedStoreId) nextResponse.cookies.set('x-store-id', resolvedStoreId, { path: '/', sameSite: 'lax' });
    return nextResponse;
  } catch (error) {
    console.error('[PROXY] Storefront lookup failed:', error);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);
    if (storeId) requestHeaders.set('x-store-id', storeId);
    const nextResponse = NextResponse.next({ request: { headers: requestHeaders } });
    if (subdomain) nextResponse.cookies.set('x-store-subdomain', subdomain, { path: '/', sameSite: 'lax' });
    if (storeId) nextResponse.cookies.set('x-store-id', storeId, { path: '/', sameSite: 'lax' });
    return nextResponse;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
