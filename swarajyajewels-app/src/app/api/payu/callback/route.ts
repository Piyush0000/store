import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const PAYU_SALT = process.env.PAYU_SALT || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    const data: Record<string, string> = {};
    body.forEach((value, key) => {
      data[key] = value.toString();
    });

    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      lastname,
      email,
      status,
      mihpayid,
      hash,
      udf1,
      udf2,
    } = data;

    // PayU response hash MUST be calculated in reverse, starting with the SALT
    // Format: SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const verificationString = [
      PAYU_SALT,
      status,
      "", // udf10
      "", // udf9
      "", // udf8
      "", // udf7
      "", // udf6
      "", // udf5
      "", // udf4
      "", // udf3
      udf2 || "",
      udf1 || "",
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
    ].join("|");

    const calculatedHash = crypto.createHash("sha512").update(verificationString).digest("hex");

    if (calculatedHash !== hash) {
      console.error("PayU callback: Hash mismatch!", { calculatedHash, receivedHash: hash });
      return NextResponse.redirect(new URL(`/checkout/failure?reason=hash_mismatch`, request.url));
    }

    // Find order by payuTxnId or by id
    let order = await prisma.order.findUnique({
      where: { payuTxnId: txnid },
    });

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id: txnid },
      });
    }

    const baseUrl = new URL(request.url).origin;

    if (!order) {
      console.warn(`PayU callback: Order ${txnid} not found`);
      return NextResponse.redirect(new URL(`/checkout/failure?reason=order_not_found`, baseUrl));
    }

    // Update order status based on payment result
    await prisma.order.update({
      where: { id: order.id },
      data: {
        firstName: firstname || order.firstName || undefined,
        lastName: lastname || order.lastName || undefined,
        email: email || order.email || undefined,
        status: status === "success" ? "PAID" : "FAILED",
        payuTxnId: mihpayid || order.payuTxnId || undefined,
        payuStatus: status,
        payuResponse: data,
      },
    });

    console.log(`PayU callback: Order ${order.id} updated to ${status}`);

    // Redirect based on payment status
    if (status === 'success') {
      return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}&txn=${mihpayid}`, baseUrl));
    } else {
      return NextResponse.redirect(new URL(`/checkout/failure?reason=${status}`, baseUrl));
    }
  } catch (error) {
    console.error("PayU callback error:", error);
    return NextResponse.redirect(new URL(`/checkout/failure?reason=error`, request.url));
  }
}