'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSubdomain } from '@/lib/server-utils';
import { fetchStorefront } from '@/lib/api';

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

export async function getStorefrontCodFee(): Promise<number> {
  const subdomain = await getServerSubdomain();
  const storefront = await fetchStorefront(subdomain);
  return storefront.settings?.codFee ?? 0;
}

export async function getStorefrontShippingFee(): Promise<{
  shippingFee: number;
  freeShippingThreshold: number;
  shippingLabel: string;
  enabled: boolean;
}> {
  try {
    const subdomain = await getServerSubdomain();
    const storefront = await fetchStorefront(subdomain);
    const settings = storefront.settings || {};
    const customization = storefront.customization || {};

    const shippingSettings = (customization as any).shippingSettings || {};
    const shippingFee = Number(shippingSettings.shippingFee ?? (settings as any).shippingFee ?? 0);
    const freeShippingThreshold = Number(shippingSettings.freeShippingThreshold ?? (settings as any).freeShippingThreshold ?? 0);
    const shippingLabel = shippingSettings.shippingLabel || 'Shipment Fee';
    const enabled = shippingSettings.enabled !== false;

    return {
      shippingFee,
      freeShippingThreshold,
      shippingLabel,
      enabled,
    };
  } catch (error) {
    console.error('Error fetching storefront shipping fee:', error);
    return {
      shippingFee: 0,
      freeShippingThreshold: 0,
      shippingLabel: 'Shipment Fee',
      enabled: false,
    };
  }
}

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
  variantId: z.string().optional(),
});

const orderInputSchema = z.object({
  userId: z.string(),
  storeId: z.string().optional(),
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
  orderNumber: z.string().optional(),
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

    let storeId = orderData.storeId;
    if (!storeId) {
      const subdomain = await getServerSubdomain();
      const storefront = await fetchStorefront(subdomain);
      if (storefront.store?.id) {
        storeId = storefront.store.id;
      }
    }

    if (!storeId) {
      return { success: false, message: 'Store not found or store ID could not be resolved' };
    }

    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        storeId: storeId,
        orderNumber: orderData.orderNumber || generateOrderNumber(),
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
            let variantInfo: any = undefined;
            if (item.variantId) {
              variantInfo = { variantId: item.variantId, variant: item.variant, image: item.image };
            } else if (item.variant) {
              variantInfo = { variant: item.variant, image: item.image };
            } else if (item.image) {
              variantInfo = { image: item.image };
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
  items: { productId: string; name: string; price: number; quantity: number; image?: string; variantId?: string; variant?: string }[];
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
  couponCode?: string;
  discountAmount?: number;
}) {
  const subdomain = await getServerSubdomain();
  const storefront = await fetchStorefront(subdomain);
  const storeId = data.storeId || storefront.store?.id;

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

  // Validate total matches items + COD fee - discount
  const COD_FEE = storefront.settings?.codFee ?? 0;
  const expectedTotal = itemSubtotal + COD_FEE - (data.discountAmount || 0);
  if (Math.abs(data.totalAmount - expectedTotal) > 1) {
    console.warn('[COD] Total mismatch:', { passed: data.totalAmount, calculated: expectedTotal, itemSubtotal });
  }

  const customerName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Customer';

  const localOrderNumber = generateOrderNumber();

  // Try external sync first (for stock validation)
  const externalPayload = {
    storeId,
    orderNumber: localOrderNumber,
    customerName,
    customerEmail: data.email || '',
    shippingAddress: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      line1: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      addressLine1: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zip: data.shippingAddress.pincode,
      postalCode: data.shippingAddress.pincode,
      zipCode: data.shippingAddress.pincode,
      country: 'IN',
      phone: data.phone || '',
    },
    billingAddress: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      line1: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      addressLine1: `${data.shippingAddress.flatHouse}, ${data.shippingAddress.areaStreet}`,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      zip: data.shippingAddress.pincode,
      postalCode: data.shippingAddress.pincode,
      zipCode: data.shippingAddress.pincode,
      country: 'IN',
      phone: data.phone || '',
    },
    subtotal: itemSubtotal,
    total: data.totalAmount,
    shipping: 0,
    tax: 0,
    source: 'STOREFRONT',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    couponCode: data.couponCode || null,
    discountAmount: data.discountAmount || null,
    items: data.items.map((item) => ({
      productId: item.productId || item.name,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      variantId: item.variantId || undefined,
      variantInfo: {
        id: item.variantId || null,
        variant: item.variant || null,
        image: item.image || null,
      },
    })),
  };

  let externalSyncFailed = false;
  let responseBody = '';
  let responseStatus = 500;
  
  if (storeId === 's-1') {
    console.log('[COD] Bypassing external sync for demo store');
  } else {
    try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    const ordersApiUrl = apiBase.replace('/storefront/public', '/orders');
    const response = await fetch(ordersApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    responseStatus = response.status;
    responseBody = await response.text();

    if (!response.ok) {
      console.warn('[COD] External order sync failed with status:', response.status, 'Response:', responseBody);
      externalSyncFailed = true;
    } else {
      console.log('[COD] External order sync succeeded:', response.status);
    }
    } catch (err: any) {
      console.warn('[COD] External API unreachable, creating local order (fallback):', err.message);
      externalSyncFailed = true;
      responseBody = err.message;
    }
  }

  // External sync MUST succeed - reject if it fails
  if (externalSyncFailed) {
    const errorMsg = responseBody ? getCodFailureMessage(responseBody, responseStatus) : 'Unable to verify stock availability. Please try again.';
    return { success: false, message: errorMsg };
  }

  // External sync succeeded, create local order
  const orderResult = await createOrder({
    userId: data.userId,
    storeId,
    orderNumber: localOrderNumber,
    items: data.items.map(item => ({
      productId: item.productId || item.name,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      image: item.image,
      variantId: item.variantId,
      variant: item.variant,
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
    couponCode: data.couponCode,
    discountAmount: data.discountAmount,
  });

  if (!orderResult.success) {
    return { success: false, message: orderResult.message };
  }

  return {
    success: true,
    orderId: String(orderResult.data?.id),
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

export async function getOrdersByUser(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function confirmAndSyncPayUOrder(orderId: string, txnId: string, payuStatus?: string, payuResponse?: any) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    // If order is already paid, just return it
    if (order.paymentStatus === 'PAID') {
      console.log(`[Sync] Order ${orderId} already marked PAID. Skipping backend sync.`);
      return { success: true, data: order };
    }

    console.log(`[Sync] Confirming and syncing Order ${orderId} to backend...`);

    // 1. Update local order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        payuTxnId: txnId || undefined,
        ...(payuStatus && { payuStatus }),
        ...(payuResponse && { payuResponse: payuResponse as any }),
      },
      include: { items: true },
    });

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
    const ordersApiUrl = apiBase.replace('/storefront/public', '/orders');

    const externalPayload = {
      storeId: order.storeId,
      userId: order.userId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: {
        firstName: (order.shippingAddress as any).firstName || '',
        lastName: (order.shippingAddress as any).lastName || '',
        line1: (order.shippingAddress as any).street || '',
        addressLine1: (order.shippingAddress as any).street || '',
        city: (order.shippingAddress as any).city || '',
        state: (order.shippingAddress as any).state || '',
        zip: (order.shippingAddress as any).zipCode || '',
        postalCode: (order.shippingAddress as any).zipCode || '',
        zipCode: (order.shippingAddress as any).zipCode || '',
        country: 'IN',
        phone: (order.shippingAddress as any).phone || '',
      },
      billingAddress: {
        firstName: (order.billingAddress as any).firstName || '',
        lastName: (order.billingAddress as any).lastName || '',
        line1: (order.billingAddress as any).street || '',
        addressLine1: (order.billingAddress as any).street || '',
        city: (order.billingAddress as any).city || '',
        state: (order.billingAddress as any).state || '',
        zip: (order.billingAddress as any).zipCode || '',
        postalCode: (order.billingAddress as any).zipCode || '',
        zipCode: (order.billingAddress as any).zipCode || '',
        country: 'IN',
        phone: (order.billingAddress as any).phone || '',
      },
      subtotal: order.subtotal,
      total: order.total,
      shipping: order.shipping,
      tax: order.tax,
      source: 'STOREFRONT',
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      items: order.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        variantInfo: item.variantInfo || undefined,
      })),
    };

    const response = await fetch(ordersApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(externalPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Sync] Failed to sync order to backend:`, errorText);
    } else {
      console.log(`[Sync] Order ${orderId} successfully synced to backend.`);
    }

    return { success: true, data: updatedOrder };
  } catch (error: any) {
    console.error('[confirmAndSyncPayUOrder] Error:', error);
    return { success: false, message: error.message };
  }
}