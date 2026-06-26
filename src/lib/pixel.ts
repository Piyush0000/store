declare global {
  interface Window {
    fbq: any;
  }
}

export function extractPixelId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]\s*\)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function fbqTrack(eventName: string, options?: any) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, options);
  }
}

export function trackViewContent(name: string, id: string, price: number) {
  fbqTrack('ViewContent', {
    content_name: name,
    content_ids: [id],
    content_type: 'product',
    value: price,
    currency: 'INR',
  });
}

export function trackAddToCart(name: string, id: string, price: number) {
  fbqTrack('AddToCart', {
    content_name: name,
    content_ids: [id],
    content_type: 'product',
    value: price,
    currency: 'INR',
  });
}

export function trackInitiateCheckout(value: number, numItems: number) {
  fbqTrack('InitiateCheckout', {
    value: value,
    currency: 'INR',
    num_items: numItems,
  });
}

export function trackPurchase(orderId: string, value: number) {
  if (typeof window !== 'undefined') {
    const key = `fb_purchased_${orderId}`;
    if (sessionStorage.getItem(key)) {
      console.log(`[Pixel] Purchase event already tracked for order: ${orderId}`);
      return;
    }
    sessionStorage.setItem(key, 'true');
  }
  fbqTrack('Purchase', {
    content_type: 'product',
    value: value,
    currency: 'INR',
    order_id: orderId,
  });
}
