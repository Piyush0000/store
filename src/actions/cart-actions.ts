'use server';

import { getServerSubdomain } from '@/lib/server-utils';
import { fetchStorefront } from '@/lib/api';

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE?.replace('/storefront/public', '') ||
  'http://127.0.0.1:5000';

const BACKEND_URL = rawBackendUrl
  .replace(/\/api\/?$/, '')
  .replace('://localhost:', '://127.0.0.1:');

// Production fallback for Shivam's store
const DEFAULT_FALLBACK_STORE_ID = 'db0de265-bd28-48ac-8bdd-b28dd0875b4e';

export interface CartItemPayload {
  productId?: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface InitCartParams {
  phoneNumber: string;
  customerName?: string;
  items: CartItemPayload[];
  cartValue: number;
  totalAmount?: number;
  userIp?: string;
  storeId?: string;
  subdomain?: string;
}

/**
 * Initializes or updates an active cart session in the backend database
 * when the shopper enters their mobile number and clicks "CONTINUE TO SHIPPING".
 */
export async function initializeCartSession(
  params: InitCartParams
): Promise<{ success: boolean; cartId?: string; error?: string }> {
  try {
    let storeId = params.storeId;
    const activeSubdomain = params.subdomain || (await getServerSubdomain().catch(() => ''));

    if (!storeId && activeSubdomain) {
      try {
        const storefront = await fetchStorefront(activeSubdomain);
        if (storefront?.store?.id && storefront.store.id !== 's-1') {
          storeId = storefront.store.id;
        }
      } catch (e) {
        console.warn('[Cart Action] Could not resolve store from subdomain:', e);
      }
    }

    if (!storeId) {
      storeId = process.env.STORE_ID || process.env.NEXT_PUBLIC_STORE_ID || DEFAULT_FALLBACK_STORE_ID;
    }

    const cleanPhone = String(params.phoneNumber).replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'Valid 10-digit mobile number required' };
    }

    const payload = {
      phoneNumber: cleanPhone,
      customerName: params.customerName || 'Customer',
      storeId,
      items: params.items || [],
      itemCount: params.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 1,
      cartValue: Number(params.cartValue || 0),
      totalAmount: Number(params.totalAmount || params.cartValue || 0),
      userIp: params.userIp || '',
    };

    const res = await fetch(`${BACKEND_URL}/api/cart/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to initialize cart' };
    }

    return { success: true, cartId: data.cartId };
  } catch (error: any) {
    console.error('[Cart Action] Error initializing cart session:', error?.message || error);
    return { success: false, error: error?.message || 'Network error' };
  }
}

/**
 * Marks an active cart as completed upon successful order placement (COD or PayU),
 * removing it from the abandoned cart funnel.
 */
export async function completeCartSession(
  cartId: string
): Promise<{ success: boolean; error?: string }> {
  if (!cartId) return { success: true };

  try {
    const res = await fetch(`${BACKEND_URL}/api/cart/${encodeURIComponent(cartId)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data.success };
  } catch (error: any) {
    console.error('[Cart Action] Error completing cart session:', error?.message || error);
    return { success: false, error: error?.message || 'Network error' };
  }
}
