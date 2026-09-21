import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getServerSubdomain, getServerStoreId } from '@/lib/server-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const querySub = searchParams.get('subdomain');
    const queryStoreId = searchParams.get('storeId');

    const headersList = await headers();
    const cookieStore = await cookies();

    const host = (headersList.get('x-forwarded-host') || headersList.get('host') || '').split(':')[0].toLowerCase().replace(/^www\./, '');
    const headerSub = headersList.get('x-subdomain');
    const cookieSub = cookieStore.get('x-store-subdomain')?.value || cookieStore.get('detected_subdomain')?.value;

    let domainOrSubdomain = querySub || headerSub || cookieSub || (await getServerSubdomain());

    // For custom domains (not ending in evoclabs.com) or apex domains, use host
    if (!domainOrSubdomain && host && host !== 'localhost' && host !== '127.0.0.1') {
      domainOrSubdomain = host;
    }
    if (!domainOrSubdomain) {
      domainOrSubdomain = process.env.NEXT_PUBLIC_SUBDOMAIN || '';
    }

    if (!domainOrSubdomain && !queryStoreId) {
      return NextResponse.json({ success: true, coupons: [], data: [] });
    }

    const apiBase = (
      process.env.INTERNAL_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE ||
      (process.env.NODE_ENV === 'production'
        ? 'https://api.evoclabs.com/api/storefront/public'
        : 'http://127.0.0.1:5000/api/storefront/public')
    ).replace(/\/+$/, '');

    const targetSub = encodeURIComponent(domainOrSubdomain || 'default');
    const storeIdParam = queryStoreId ? `&storeId=${encodeURIComponent(queryStoreId)}` : '';
    const storeIdLeadingParam = queryStoreId ? `?storeId=${encodeURIComponent(queryStoreId)}` : '';

    const candidateUrls = [
      `${apiBase}/${targetSub}/coupons${storeIdLeadingParam}`,
      `${apiBase}/coupons?subdomain=${targetSub}${storeIdParam}`,
      `${apiBase.replace('/storefront/public', '/coupons/public')}/${targetSub}${storeIdLeadingParam}`,
      `http://127.0.0.1:5000/api/storefront/public/${targetSub}/coupons${storeIdLeadingParam}`,
      `http://127.0.0.1:5001/api/storefront/public/${targetSub}/coupons${storeIdLeadingParam}`,
    ];

    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (host) {
      fetchHeaders['x-forwarded-host'] = host;
    }

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: fetchHeaders,
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const json = await res.json();
          if (json && (json.success || Array.isArray(json.data) || Array.isArray(json.coupons))) {
            const coupons = json.data || json.coupons || [];
            return NextResponse.json({ success: true, coupons, data: coupons });
          }
        }
      } catch {
        // Continue to next candidate
      }
    }

    return NextResponse.json({ success: true, coupons: [], data: [] });
  } catch (error: any) {
    console.error('[API /storefront/public/coupons] Error:', error);
    return NextResponse.json({ success: false, coupons: [], data: [] }, { status: 500 });
  }
}

