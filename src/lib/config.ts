function publicStorefrontApiBase(): string {
  if (process.env.NODE_ENV !== 'production') {
    return (
      process.env.INTERNAL_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE ||
      'http://127.0.0.1:5000/api/storefront/public'
    ).replace(/\/+$/, '');
  }
  return (
    process.env.INTERNAL_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'https://api.evoclabs.com/api/storefront/public'
  ).replace(/\/+$/, '');
}

const API_BASE = publicStorefrontApiBase();

export function getApiBase(): string {
  return API_BASE;
}

export function getBackendOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_ORIGIN || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  try {
    const raw = API_BASE.includes('://') ? API_BASE : `https://${API_BASE}`;
    return new URL(raw).origin;
  } catch {
    return 'https://api.evoclabs.com';
  }
}

export function getSubdomain(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const querySub = params.get('subdomain');
    if (querySub) {
      localStorage.setItem('detected_subdomain', querySub);
      return querySub;
    }

    const cookieMatch = document.cookie.match(/(?:^|; )x-store-subdomain=([^;]*)/);
    const cookieSub = cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
    if (cookieSub) {
      localStorage.setItem('detected_subdomain', cookieSub);
      return cookieSub;
    }

    let hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('www.')) hostname = hostname.substring(4);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_SUBDOMAIN || localStorage.getItem('detected_subdomain') || '';
    }
    if (hostname.endsWith('.evoclabs.com')) {
      const sub = hostname.split('.')[0] || '';
      if (sub) localStorage.setItem('detected_subdomain', sub);
      return sub;
    }
    return localStorage.getItem('detected_subdomain') || process.env.NEXT_PUBLIC_SUBDOMAIN || '';
  }
  return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
}

export function getStoreId(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('storeId');
    if (fromQuery) {
      localStorage.setItem('detected_store_id', fromQuery);
      return fromQuery;
    }
    const cookieMatch = document.cookie.match(/(?:^|; )x-store-id=([^;]*)/);
    const cookieId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
    if (cookieId) return cookieId;
    return localStorage.getItem('detected_store_id') || '';
  }
  return '';
}

export function getApiUrl(subdomain?: string): string {
  const sub = subdomain || getSubdomain() || 'preview';
  return `${API_BASE}/${encodeURIComponent(sub)}/frontend`;
}

export function withStoreId(url: string, storeId?: string): string {
  const id = storeId || getStoreId();
  if (!id) return url;
  return `${url}${url.includes('?') ? '&' : '?'}storeId=${encodeURIComponent(id)}`;
}

export function isSubdomainUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('.') && !hostname.startsWith('www');
}

export function getStoreInfo(): { subdomain: string; isValid: boolean } {
  const subdomain = getSubdomain();
  return { subdomain, isValid: subdomain !== 'localhost' };
}
