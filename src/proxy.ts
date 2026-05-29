import { NextResponse } from 'next/server';

export async function proxy(request: Request) {
  const hostname = request.headers.get('host') || '';
  const pathname = new URL(request.url).pathname;

  // Allow localhost/127.0.0.1 without validation (uses fallback from env)
  const isLocalhost = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1');

  if (isLocalhost) {
    return NextResponse.next();
  }

  // For any non-localhost domain (except those ending with evoclabs.com subdomain),
  // show 404 without calling any API
  const isEvoclabsSubdomain = hostname.endsWith('.evoclabs.com');

  if (!isEvoclabsSubdomain) {
    // Non-localhost, non-evoclabs domain → 404
    return NextResponse.redirect(new URL('/store-error?reason=Invalid+store+domain', request.url));
  }

  // Valid subdomain pattern: *.evoclabs.com → validate via API
  const parts = hostname.split('.');
  const subdomain = parts[0];

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

    return NextResponse.next();
  } catch (error) {
    console.error('[PROXY] API call failed:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|store-error).*)'],
};