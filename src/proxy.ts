import { NextResponse } from 'next/server';

export async function proxy(request: Request) {
  const hostname = request.headers.get('host') || '';
  const cleanHostname = hostname.split(':')[0].toLowerCase();

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
      // For any non-localhost domain (except those ending with evoclabs.com subdomain),
      // show 404 without calling any API
      const isEvoclabsSubdomain = cleanHostname.endsWith('.evoclabs.com');

      if (!isEvoclabsSubdomain) {
        // Non-localhost, non-evoclabs domain → 404
        return NextResponse.redirect(new URL('/store-error?reason=Invalid+store+domain', request.url));
      }

      // Valid subdomain pattern: *.evoclabs.com → validate via API
      const parts = cleanHostname.split('.');
      subdomain = parts[0];
    }
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    const apiUrl = `${apiBase}/${subdomain}/frontend`;
    const response = await fetch(apiUrl, { next: { revalidate: 0 } });
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