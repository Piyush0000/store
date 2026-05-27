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

    // PayU response hash validation
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

    // Verify hash BEFORE any database operations
    if (calculatedHash !== hash) {
      console.error("PayU callback: Hash mismatch!", { calculatedHash, receivedHash: hash });
      return NextResponse.redirect(new URL(`/checkout/failure?reason=hash_mismatch`, request.url));
    }

    // Validate status value to prevent enum confusion
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus !== 'success' && normalizedStatus !== 'failure') {
      console.error("PayU callback: Invalid status value:", status);
      return NextResponse.redirect(new URL(`/checkout/failure?reason=invalid_status`, request.url));
    }

    const isSuccess = normalizedStatus === 'success';
    const baseUrl = new URL(request.url).origin;

    // Find order - PayU txnid is derived from order UUID's last 12 chars
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          // First try: match by payuTxnId (set from txnid during order creation)
          { payuTxnId: txnid },
          // Second try: match by truncated UUID (last 12 chars of order id)
          { id: { endsWith: txnid } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      console.warn(`PayU callback: Order ${txnid} not found`);
      return NextResponse.redirect(new URL(`/checkout/failure?reason=order_not_found`, baseUrl));
    }

    // Update customer name in shipping address
    const shippingAddress = order.shippingAddress as any;
    const updatedShippingAddress = {
      ...shippingAddress,
      firstName: firstname || shippingAddress.firstName,
      lastName: lastname || shippingAddress.lastName,
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingAddress: updatedShippingAddress,
        customerEmail: email || order.customerEmail,
        paymentStatus: isSuccess ? "PAID" : "FAILED",
        status: isSuccess ? "CONFIRMED" : "CANCELLED",
        payuTxnId: mihpayid || order.payuTxnId,
        payuStatus: status,
        payuResponse: data,
      },
    });

    console.log(`PayU callback: Order ${order.id} updated to ${status}`);

    // Redirect based on payment status
    if (isSuccess) {
      return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}&txn=${mihpayid}`, baseUrl));
    } else {
      return NextResponse.redirect(new URL(`/checkout/failure?reason=${status}`, baseUrl));
    }
  } catch (error) {
    console.error("PayU callback error:", error);
    return NextResponse.redirect(new URL(`/checkout/failure?reason=error`, request.url));
  }
}