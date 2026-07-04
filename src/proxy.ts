import { NextResponse } from 'next/server';

export async function proxy(request: Request) {
  const hostname = request.headers.get('host') || '';
  let cleanHostname = hostname.split(':')[0].toLowerCase();
  if (cleanHostname.startsWith('www.')) {
    cleanHostname = cleanHostname.substring(4);
  }

  let subdomain = '';
  const requestUrl = new URL(request.url);
  const querySubdomain = requestUrl.searchParams.get('subdomain');

  if (querySubdomain) {
    subdomain = querySubdomain;
  } else {
    const isLocalhost = cleanHostname === 'localhost' ||
      cleanHostname === '127.0.0.1' ||
      cleanHostname.endsWith('.localhost');

    if (isLocalhost) {
      if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
        subdomain = process.env.NEXT_PUBLIC_SUBDOMAIN || '';
      } else {
        const parts = cleanHostname.split('.');
        subdomain = parts[0];
      }
    } else {
      const isEvoclabsSubdomain = cleanHostname.endsWith('.evoclabs.com');

      if (!isEvoclabsSubdomain) {
        // Non-localhost, non-evoclabs domain → resolve custom domain from API
        try {
          const apiBase = process.env.INTERNAL_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
          const resolveUrl = `${apiBase}/resolve?domain=${cleanHostname}`;
          let resolveRes;
          try {
            resolveRes = await fetch(resolveUrl, { next: { revalidate: 0 } });
          } catch (localErr) {
            console.warn('[PROXY] Local domain resolve failed, trying public fallback:', localErr);
            const publicApiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
            resolveRes = await fetch(`${publicApiBase}/resolve?domain=${cleanHostname}`, { next: { revalidate: 0 } });
          }
          const resolveData = await resolveRes.json();
          if (resolveData.success && resolveData.store) {
            subdomain = resolveData.store.subdomain;
          } else {
            return NextResponse.redirect(
              new URL(`/store-error?reason=${encodeURIComponent(resolveData.message || 'Invalid store domain')}`, request.url)
            );
          }
        } catch (err) {
          console.error('[PROXY] Custom domain resolve failed:', err);
          return NextResponse.redirect(new URL('/store-error?reason=Resolution+failed', request.url));
        }
      } else {
        // Valid subdomain pattern: *.evoclabs.com → validate via API
        const parts = cleanHostname.split('.');
        subdomain = parts[0];
      }
    }
  }

  try {
    const apiBase = (process.env.INTERNAL_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public').replace(/\/+$/, '');
    const apiUrl = `${apiBase}/${subdomain}/frontend`;
    let response;
    try {
      response = await fetch(apiUrl, { next: { revalidate: 0 } });
    } catch (localErr) {
      console.warn('[PROXY] Local frontend fetch failed, trying public fallback:', localErr);
      const publicApiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
      response = await fetch(`${publicApiBase}/${subdomain}/frontend`, { next: { revalidate: 0 } });
    }
    const data = await response.json();

    if (!data.success) {
      return NextResponse.redirect(
        new URL(`/store-error?reason=${encodeURIComponent(data.message || 'Store not found')}`, request.url)
      );
    }

    // Set custom header with the resolved subdomain to pass down to Server Components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('[PROXY] API call failed:', error);

    // Set custom header on error fallback
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', subdomain);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|store-error).*)'],
};