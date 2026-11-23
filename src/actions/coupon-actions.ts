'use server';

import { getStoreContext } from '@/lib/store-context';
import { getServerSubdomain } from '@/lib/server-utils';

export async function validateCouponAction(code: string, orderTotal: number, cartItems: any[] = [], paymentMethod?: string) {
  try {
    const { storeId, subdomain } = await getStoreContext();

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
        paymentMethod,
        cartItems: (cartItems || []).map((i: any) => ({
          productId: i.productId || i.id,
          unitPrice: Number(i.unitPrice ?? i.price ?? 0),
          quantity: Number(i.quantity ?? 1),
        })),
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
      applicablePaymentMethods: data.coupon?.applicablePaymentMethods || data.applicablePaymentMethods || 'both',
      discount: data.discount ?? data.discountAmount ?? 0,
      discountAmount: data.discountAmount ?? data.discount ?? 0,
      freeShipping: Boolean(data.freeShipping || data.coupon?.type === 'FREE_SHIPPING'),
      freeItems: data.freeItems || [],
      type: data.type || data.coupon?.type,
      message: data.message,
      requiresAction: data.requiresAction,
      autoAddProduct: data.autoAddProduct,
      availableGiftProducts: data.availableGiftProducts,
      getsQty: data.getsQty,
      getsDiscountType: data.getsDiscountType,
      getsDiscountValue: data.getsDiscountValue,
    };
  } catch (error: any) {
    console.error('[validateCouponAction] Error:', error);
    return { success: false, message: error.message || 'Failed to validate coupon' };
  }
}

export async function listPublicCouponsAction() {
  try {
    const subdomain = await getServerSubdomain();
    if (!subdomain) return { success: true, coupons: [] };

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    let listUrl = '';
    if (apiBase.includes('/storefront/public')) {
      listUrl = `${apiBase.replace(/\/+$/, '')}/${encodeURIComponent(subdomain)}/coupons`;
    } else {
      const sanitizedBase = apiBase.replace(/\/+$/, '');
      listUrl = sanitizedBase.endsWith('/api')
        ? `${sanitizedBase}/storefront/public/${encodeURIComponent(subdomain)}/coupons`
        : `${sanitizedBase}/api/storefront/public/${encodeURIComponent(subdomain)}/coupons`;
    }

    const response = await fetch(listUrl, { cache: 'no-store' });
    const data = await response.json();
    const coupons = data.data || data.coupons || [];
    return { success: true, coupons: Array.isArray(coupons) ? coupons : [] };
  } catch (error: any) {
    console.error('[listPublicCouponsAction] Error:', error);
    return { success: true, coupons: [] };
  }
}
