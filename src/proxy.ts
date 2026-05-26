import { NextResponse } from 'next/server';

export async function proxy(request: Request) {
  const hostname = request.headers.get('host') || '';
  const pathname = new URL(request.url).pathname;

  console.log('[PROXY] Request received');
  console.log('[PROXY] Host:', hostname);
  console.log('[PROXY] Path:', pathname);

  const parts = hostname.split('.');

  // Only match explicit subdomain patterns: *.evoclabs.com or *.*.localhost
  const isEvoclabsSubdomain = hostname.endsWith('.evoclabs.com');
  const isLocalSubdomain = hostname.includes('.') &&
    (hostname.endsWith('.localhost') || hostname.endsWith('.127.0.0.1'));

  console.log('[PROXY] Is evoclabs subdomain:', isEvoclabsSubdomain);
  console.log('[PROXY] Is local subdomain:', isLocalSubdomain);

  if (isEvoclabsSubdomain || isLocalSubdomain) {
    const subdomain = parts[0];
    console.log('[PROXY] Extracted subdomain:', subdomain);

    // Check if store exists via API
    try {
      const apiUrl = `https://api.evoclabs.com/api/storefront/public/${subdomain}/frontend`;
      console.log('[PROXY] Calling API:', apiUrl);

      const response = await fetch(apiUrl, { next: { revalidate: 0 } });
      const data = await response.json();

      console.log('[PROXY] API response success:', data.success);
      if (data.success) {
        console.log('[PROXY] Store found:', data.store?.name);
        console.log('[PROXY] Products count:', data.products?.length);
      } else {
        console.log('[PROXY] Store not found:', data.message);
      }

      // If store not found, redirect to error page
      if (!data.success) {
        console.log('[PROXY] Redirecting to store-error');
        return NextResponse.redirect(
          new URL(`/store-error?reason=${encodeURIComponent(data.message || 'Store not found')}`, request.url)
        );
      }

      console.log('[PROXY] ✓ Store validated, continuing to page');
      return NextResponse.next();
    } catch (error) {
      console.error('[PROXY] API call failed:', error);
      // API unavailable, continue to allow page render
      console.log('[PROXY] ⚠ API failed, continuing anyway');
      return NextResponse.next();
    }
  }

  console.log('[PROXY] Non-subdomain request, passing through');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|store-error).*)'],
};