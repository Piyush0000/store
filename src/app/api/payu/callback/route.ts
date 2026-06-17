import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { confirmAndSyncPayUOrder } from '@/actions/order-actions';

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

    // Resolve subdomain: check udf1 (set during payment initiation) first, then headers/hostname fallback
    let subdomain = udf1 || request.headers.get('x-subdomain') || '';
    if (!subdomain) {
      let host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
      if (host.includes(',')) {
        host = host.split(',')[0].trim();
      }
      if (host) {
        const hostname = host.split(':')[0];
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          subdomain = process.env.NEXT_PUBLIC_SUBDOMAIN || '';
        } else {
          const parts = hostname.split('.');
          if (parts.length >= 2) {
            subdomain = parts[0];
          }
        }
      }
    }
    if (!subdomain) {
      subdomain = process.env.NEXT_PUBLIC_SUBDOMAIN || '';
    }

    // Verify hash BEFORE any database operations on the backend
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api/storefront/public';
    const verifyUrl = `${apiBase}/${subdomain}/payment/payu-verify`;

    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const verifyResult = await verifyRes.json();

    if (!verifyResult.success) {
      console.error("PayU callback: Hash verification failed on backend!");
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

    // Update shipping address customer name details
    const shippingAddress = order.shippingAddress as any;
    const updatedShippingAddress = {
      ...shippingAddress,
      firstName: firstname || shippingAddress.firstName,
      lastName: lastname || shippingAddress.lastName,
    };

    if (isSuccess) {
      await confirmAndSyncPayUOrder(order.id, mihpayid || txnid, status, data);
      
      // Update shipping details locally (confirmAndSyncPayUOrder handles status/paymentStatus)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shippingAddress: updatedShippingAddress,
          customerEmail: email || order.customerEmail,
        },
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shippingAddress: updatedShippingAddress,
          customerEmail: email || order.customerEmail,
          paymentStatus: "FAILED",
          status: "CANCELLED",
          payuTxnId: mihpayid || order.payuTxnId,
          payuStatus: status,
          payuResponse: data,
        },
      });
    }

    console.log(`PayU callback: Order ${order.id} processed status: ${status}`);

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