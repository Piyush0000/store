'use server';

import { getServerSubdomain } from '@/lib/server-utils';
import { fetchStorefront } from '@/lib/api';

export async function validateCouponAction(code: string, orderTotal: number) {
  try {
    const subdomain = await getServerSubdomain();
    const storefront = await fetchStorefront(subdomain);
    const storeId = storefront.store?.id;

    if (!storeId) {
      return { success: false, message: 'Store not found' };
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    let validateUrl = '';
    if (apiBase.includes('/storefront/public')) {
      validateUrl = apiBase.replace('/storefront/public', '/coupons/validate');
    } else {
      const sanitizedBase = apiBase.replace(/\/+$/, '');
      if (sanitizedBase.endsWith('/api')) {
        validateUrl = sanitizedBase + '/coupons/validate';
      } else {
        validateUrl = sanitizedBase + '/api/coupons/validate';
      }
    }

    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        storeId,
        orderTotal,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      return {
        success: false,
        message: data.message || 'Invalid coupon code',
      };
    }

    return {
      success: true,
      coupon: data.coupon,
      discount: data.discount,
      type: data.type,
    };
  } catch (error: any) {
    console.error('[validateCouponAction] Error:', error);
    return { success: false, message: error.message || 'Failed to validate coupon' };
  }
}
