'use server';

import { headers } from 'next/headers';
import { PAYU_CALLBACK_URL } from '@/lib/env';
import { getServerSubdomain } from '@/lib/server-utils';
import { prisma } from '@/lib/prisma';
import { confirmAndSyncOnlineOrder } from '@/actions/order-actions';

const publicApiBase = () => (process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public').replace(/\/+$/, '');

async function paymentApi(path: string, body: Record<string, unknown>) {
  const subdomain = await getServerSubdomain();
  const response = await fetch(`${publicApiBase()}/${subdomain}/payment/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `Payment request failed (HTTP ${response.status})`);
  }
  return payload.data;
}

async function getPayableOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');
  if (order.paymentStatus === 'PAID') throw new Error('Order is already paid');
  const amount = Number(order.total);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Order amount is invalid');
  return { order, amount };
}

export async function initiateRazorpayPayment(orderId: string) {
  try {
    const { amount } = await getPayableOrder(orderId);
    const data = await paymentApi('razorpay-order', { orderId, amount });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to initialize Razorpay' };
  }
}

export async function verifyRazorpayPayment(data: {
  localOrderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const verified = await paymentApi('razorpay-verify', data);
    const synced = await confirmAndSyncOnlineOrder(
      data.localOrderId,
      'RAZORPAY',
      data.razorpay_payment_id,
      verified.status,
      verified,
    );
    if (!synced.success) throw new Error(synced.message || 'Payment succeeded, but the order could not be confirmed');
    return { success: true, data: synced.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to verify Razorpay payment' };
  }
}

export async function initiateCashfreePayment(orderId: string, customer: {
  id?: string;
  name: string;
  email: string;
  phone: string;
}) {
  try {
    const { amount } = await getPayableOrder(orderId);
    const data = await paymentApi('cashfree-session', { orderId, amount, customer });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to initialize Cashfree' };
  }
}

export async function verifyCashfreePayment(localOrderId: string, cashfreeOrderId: string) {
  try {
    const verified = await paymentApi('cashfree-verify', { orderId: cashfreeOrderId, localOrderId });
    const synced = await confirmAndSyncOnlineOrder(localOrderId, 'CASHFREE', cashfreeOrderId, verified.status, verified);
    if (!synced.success) throw new Error(synced.message || 'Payment succeeded, but the order could not be confirmed');
    return { success: true, data: synced.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to verify Cashfree payment' };
  }
}

export async function initiatePayUPayment(data: {
  orderId: string;
  amount?: number;
  firstName: string;
  email: string;
  phone: string;
  productinfo: string;
}) {
  try {
    const { orderId, firstName, email, phone, productinfo } = data;
    const { order, amount } = await getPayableOrder(orderId);
    const txnid = order.payuTxnId || orderId.slice(-12).toUpperCase();

    // Dynamically build the callback URL based on request headers to support multiple domains
    const headersList = await headers();
    console.log("=== INITIATING PAYMENT SIGNATURE ===");
    console.log("Headers keys:", Array.from(headersList.keys()));
    console.log("Header Host:", headersList.get('host'));
    console.log("Header X-Forwarded-Host:", headersList.get('x-forwarded-host'));
    console.log("Header X-Forwarded-Proto:", headersList.get('x-forwarded-proto'));
    
    let host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    if (host.includes(',')) {
      host = host.split(',')[0].trim();
    }
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const callbackUrl = host ? `${protocol}://${host}/api/payu/callback` : PAYU_CALLBACK_URL;
    
    console.log("Resolved host:", host);
    console.log("Resolved protocol:", protocol);
    console.log("Resolved callbackUrl:", callbackUrl);
    console.log("=====================================");

    if (!callbackUrl) {
      return { success: false, message: 'PAYU_CALLBACK_URL is required' };
    }

    const subdomain = await getServerSubdomain();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    const hashUrl = `${apiBase}/${subdomain}/payment/payu-hash`;

    const res = await fetch(hashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txnid,
        amount: amount.toFixed(2),
        productinfo,
        firstname: firstName,
        email,
        phone,
        udf1: subdomain,
      }),
    });

    const hashData = await res.json();
    if (!hashData.success) {
      return { success: false, message: hashData.message || 'Failed to generate payment hash' };
    }

    return {
      success: true,
      data: {
        key: hashData.key,
        txnid,
        amount: amount.toFixed(2),
        productinfo,
        firstname: firstName,
        email,
        phone,
        hash: hashData.hash,
        surl: callbackUrl,
        furl: callbackUrl,
        udf1: subdomain,
        // isSandbox is set by backend; fallback to key-based detection for old deployments
        isSandbox: hashData.isSandbox ?? ['IWqFlM', 'gtKFFx', 'oZ7oo7'].includes(hashData.key),
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
