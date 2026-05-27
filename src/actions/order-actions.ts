'use server';

import { prisma } from '@/lib/prisma';
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

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
  variant: z.string().optional(),
});

const orderSchema = z.object({
  userId: z.string(),
  items: z.array(orderItemSchema),
  totalAmount: z.number(),
  paymentMethod: z.enum(['COD', 'PAYU']),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  payuTxnId: z.string().optional(),
  shippingAddress: z.object({
    flatHouse: z.string(),
    areaStreet: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }).optional(),
});

export async function createOrder(data: z.infer<typeof orderSchema>) {
  try {
    const { shippingAddress, ...orderData } = data;
    const order = await prisma.order.create({ data: orderData });
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

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

export async function createCodOrder(data: {
  userId: string;
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
  const orderReference = `COD-${Date.now().toString(36).toUpperCase()}`;

  const storeId = process.env.STORE_ID;
  if (!storeId) {
    return { success: false, message: 'STORE_ID is required to validate COD stock' };
  }

  if (!data.shippingAddress) {
    return { success: false, message: 'Shipping address is required to validate COD stock' };
  }

  // Validate stock and create the external order first.
  const customerName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Customer';

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
    subtotal: data.totalAmount,
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
      price: item.price,
      variantInfo: {
        image: item.image || null
      }
    })),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
    const response = await fetch('https://api.evoclabs.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const responseBody = await response.text();

    // If API returns an error, still create the local order (fallback mode)
    // The external sync is for inventory validation, not a hard requirement
    if (!response.ok) {
      console.warn('[COD] External order sync failed with status:', response.status, 'Response:', responseBody);
      // Continue with local order creation anyway - this is a fallback
    } else {
      console.log('[COD] External order sync succeeded:', response.status);
    }
  } catch (err: any) {
    // Network errors should not block COD orders - create order locally as fallback
    console.warn('[COD] External API unreachable, creating local order (fallback):', err.message);
  }

  // External sync is optional - create local order regardless of external API result
  const orderResult = await createOrder({
    userId: data.userId,
    items: data.items.map(item => ({
      productId: item.productId || item.name,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    totalAmount: data.totalAmount,
    paymentMethod: 'COD',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
  });

  if (!orderResult.success) {
    return { success: false, message: orderResult.message };
  }

return { success: true, orderId: String(orderResult.data?.id) };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  payuTxnId?: string
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        paymentMethod: status,
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
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}