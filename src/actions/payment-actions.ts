'use server';

import { headers } from 'next/headers';
import { PAYU_CALLBACK_URL } from '@/lib/env';
import { getServerSubdomain } from '@/lib/server-utils';

export async function initiatePayUPayment(data: {
  orderId: string;
  amount: number;
  firstName: string;
  email: string;
  phone: string;
  productinfo: string;
}) {
  try {
    const { orderId, amount, firstName, email, phone, productinfo } = data;
    const txnid = orderId.slice(-12).toUpperCase();

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
        isSandbox: hashData.isSandbox ?? false,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}