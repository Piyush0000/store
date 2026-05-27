'use server';

import { createHash } from 'crypto';
import { PAYU_KEY, PAYU_SALT, PAYU_CALLBACK_URL } from '@/lib/env';

function generatePayUHash(hashString: string): string {
  return createHash('sha512').update(hashString).digest('hex');
}

export async function initiatePayUPayment(data: {
  orderId: string;
  amount: number;
  firstName: string;
  email: string;
  phone: string;
  productinfo: string;
}) {
  try {
    if (!PAYU_KEY || !PAYU_SALT) {
      return { success: false, message: 'PayU not configured' };
    }

    const { orderId, amount, firstName, email, phone, productinfo } = data;
    const txnid = orderId.slice(-12).toUpperCase();

    // PayU hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT
    // 17 parts total (with udf6-udf10 empty)
    const hashString = [
      PAYU_KEY,         // key
      txnid,            // txnid
      amount.toFixed(2), // amount (2 decimal places)
      productinfo,      // productinfo
      firstName,        // firstname
      email,            // email
      '',               // udf1
      '',               // udf2
      '',               // udf3
      '',               // udf4
      '',               // udf5
      '',               // udf6
      '',               // udf7
      '',               // udf8
      '',               // udf9
      '',               // udf10
      PAYU_SALT,        // SALT
    ].join('|');

    const hash = generatePayUHash(hashString);

    // Enforce production callback URL - localhost fallback is a security risk
    const callbackUrl = PAYU_CALLBACK_URL;
    if (!callbackUrl) {
      return { success: false, message: 'PAYU_CALLBACK_URL environment variable is required' };
    }

    return {
      success: true,
      data: {
        key: PAYU_KEY,
        txnid,
        amount: amount.toFixed(2),
        productinfo,
        firstname: firstName,
        email,
        phone,
        hash,
        surl: callbackUrl,
        furl: callbackUrl,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getPayUKey() {
  return { success: true, data: { key: PAYU_KEY } };
}