import { NextResponse } from 'next/server';
import { getServerSubdomain } from '@/lib/server-utils';

export async function GET(request: Request) {
  try {
    const subdomain = await getServerSubdomain();
    if (!subdomain) {
      return NextResponse.json({ success: true, coupons: [], data: [] });
    }

    const apiBase = (process.env.INTERNAL_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public').replace(/\/+$/, '');
    
    // Try multiple possible endpoints for coupons
    const candidateUrls = [
      `${apiBase}/${subdomain}/coupons`,
      `${apiBase.replace('/storefront/public', '/coupons/public')}/${subdomain}`,
      `${apiBase.replace('/storefront/public', '/coupons')}/public/${subdomain}`,
      `${apiBase}/coupons/${subdomain}`,
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const json = await res.json();
          if (json && (json.success || Array.isArray(json.data) || Array.isArray(json.coupons))) {
            const coupons = json.data || json.coupons || [];
            return NextResponse.json({ success: true, coupons, data: coupons });
          }
        }
      } catch (err) {
        // continue to next candidate
      }
    }

    return NextResponse.json({ success: true, coupons: [], data: [] });
  } catch (error: any) {
    console.error('[API /storefront/public/coupons] Error:', error);
    return NextResponse.json({ success: false, coupons: [], data: [] }, { status: 500 });
  }
}
