'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.string(),
  flatHouse: z.string(),
  areaStreet: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function createAddress(userId: string, data: z.infer<typeof addressSchema>) {
  try {
    const address = await prisma.address.create({
      data: { ...data, userId },
    });
    return { success: true, data: address };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateAddress(id: string, data: Partial<z.infer<typeof addressSchema>>) {
  try {
    const address = await prisma.address.update({ where: { id }, data });
    return { success: true, data: address };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

const orderItemInputSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
  variant: z.string().optional(),
});

const orderInputSchema = z.object({
  userId: z.string(),
  storeId: z.string(),
  items: z.array(orderItemInputSchema),
  totalAmount: z.number(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  paymentMethod: z.enum(['COD', 'PAYU']),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  shippingAddress: z.object({
    flatHouse: z.string(),
    areaStreet: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  payuTxnId: z.string().optional(),
  couponCode: z.string().optional(),
  discountAmount: z.number().optional(),
});

function getCodFailureMessage(responseBody: string, status: number): string {
  const fallbackMessage = `Order could not be placed (HTTP ${status}).`;

  try {
    const parsed = JSON.parse(responseBody) as { message?: string };
    const message = parsed.message || responseBody || fallbackMessage;

    if (/insufficient product stock/i.test(message)) {
      return 'Sorry, this item is out of stock right now. Please reduce the quantity or choose a different item.';
    }

    return message;
  } catch {
    if (/insufficient product stock/i.test(responseBody)) {
      return 'Sorry, this item is out of stock right now. Please reduce the quantity or choose a different item.';
    }

    return responseBody || fallbackMessage;
  }
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function createOrder(data: z.infer<typeof orderInputSchema>) {
  try {
    const { shippingAddress, ...orderData } = data;

    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        storeId: orderData.storeId,
        orderNumber: generateOrderNumber(),
        customerEmail: orderData.email,
        customerName: [orderData.firstName, orderData.lastName].filter(Boolean).join(' ') || 'Customer',
        shippingAddress: {
          firstName: orderData.firstName,
          lastName: orderData.lastName || '',
          street: `${shippingAddress.flatHouse}, ${shippingAddress.areaStreet}`,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.pincode,
          phone: orderData.phone || '',
        },
        billingAddress: {
          firstName: orderData.firstName,
          lastName: orderData.lastName || '',
          street: `${shippingAddress.flatHouse}, ${shippingAddress.areaStreet}`,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.pincode,
          phone: orderData.phone || '',
        },
        subtotal: orderData.subtotal ?? orderData.totalAmount,
        tax: orderData.tax ?? 0,
        shipping: orderData.shipping ?? 0,
        total: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        status: 'PENDING',
        couponCode: orderData.couponCode,
        discountAmount: orderData.discountAmount,
        source: 'STOREFRONT',
        riskLevel: 'Low',
        payuTxnId: orderData.payuTxnId,
        items: {
          create: orderData.items.map(item => {
            let variantInfo: Prisma.InputJsonValue | undefined = undefined;
            if (item.variant) {
              variantInfo = { variant: item.variant, image: item.image } as Prisma.InputJsonValue;
            } else if (item.image) {
              variantInfo = { image: item.image } as Prisma.InputJsonValue;
            }
            return {
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price), // Ensure price is a number, not string
              variantInfo,
            };
          }),
        },
      },
    });

    return { success: true, data: order };
  } catch (error: any) {
    console.error('[createOrder] Error:', error);
    return { success: false, message: error.message };
  }
}

export async function createCodOrder(data: {
  userId: string;
  storeId?: string;
  items: { productId: string; name: string; price: number; quantity: number; image?: string }[];
  totalAmount: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: {
    flatHouse: string;
    areaStreet: string;
    city: string;
    state: string;
    pincode: string;
  };
}) {
  const storeId = data.storeId || process.env.STORE_ID;

  if (!storeId) {
    return { success: false, message: 'STORE_ID is required to validate COD stock' };
  }

  if (!data.shippingAddress) {
    return { success: false, message: 'Shipping address is required to validate COD stock' };
  }

  // Validate cart has items with valid prices
  if (!data.items || data.items.length === 0) {
    return { success: false, message: 'Cart is empty. Please add items before checkout.' };
  }

  const itemSubtotal = data.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  if (itemSubtotal <= 0) {
    return { success: false, message: 'Invalid cart total. Please refresh the page and try again.' };
  }

  // Validate total matches items + COD fee (COD_FEE = 40 on frontend)
  const COD_FEE = 40;
  const expectedTotal = itemSubtotal + COD_FEE;
  if (Math.abs(data.totalAmount - expectedTotal) > 1) {
    console.warn('[COD] Total mismatch:', { passed: data.totalAmount, calculated: expectedTotal, itemSubtotal });
  }

  const customerName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Customer';

  // Try external sync first (for stock validation)
  const externalPayload = {
    storeId,
    customerName,
    customerEmail: data.email || '',
    shippingAddress: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      street: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zipCode: data.shippingAddress.pincode,
      phone: data.phone || '',
    },
    billingAddress: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      street: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zipCode: data.shippingAddress.pincode,
      phone: data.phone || '',
    },
    subtotal: itemSubtotal,
    total: data.totalAmount,
    shipping: 0,
    tax: 0,
    source: 'STOREFRONT',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    items: data.items.map((item) => ({
      productId: item.productId || item.name,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      variantInfo: {
        image: item.image || null,
      },
    })),
  };

  let externalSyncFailed = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch('https://api.evoclabs.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const responseBody = await response.text();

    if (!response.ok) {
      console.warn('[COD] External order sync failed with status:', response.status, 'Response:', responseBody);
      externalSyncFailed = true;
    } else {
      console.log('[COD] External order sync succeeded:', response.status);
    }
  } catch (err: any) {
    console.warn('[COD] External API unreachable, creating local order (fallback):', err.message);
    externalSyncFailed = true;
  }

  // If external sync failed, still create local order but flag it
  // Success requires local order creation to succeed
  const orderResult = await createOrder({
    userId: data.userId,
    storeId,
    items: data.items.map(item => ({
      productId: item.productId || item.name,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      image: item.image,
    })),
    totalAmount: data.totalAmount,
    subtotal: itemSubtotal,
    tax: 0,
    shipping: 0,
    paymentMethod: 'COD',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone,
    shippingAddress: data.shippingAddress,
  });

  if (!orderResult.success) {
    return { success: false, message: orderResult.message };
  }

  // Order created locally - return success with warning if external sync failed
  return {
    success: true,
    orderId: String(orderResult.data?.id),
    warning: externalSyncFailed ? 'Order created but stock sync delayed' : undefined
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  payuTxnId?: string
) {
  try {
    // Validate status value to prevent enum injection
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return { success: false, message: "Invalid order status" };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(),
        ...(payuTxnId && { payuTxnId }),
      },
    });
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateOrderByTxnId(txnId: string, status: string, payuResponse?: any) {
  try {
    const order = await prisma.order.update({
      where: { payuTxnId: txnId },
      data: { payuStatus: status, payuResponse },
    });
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}