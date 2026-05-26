export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
export const TWO_FACTOR_API_KEY = process.env.NEXT_PUBLIC_TWO_FACTOR_API_KEY || '';
export const PAYU_KEY = process.env.NEXT_PUBLIC_PAYU_KEY || '';
export const PAYU_SALT = process.env.NEXT_PUBLIC_PAYU_SALT || '';

export function getSubdomain(): string {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    // Server-side: use env var
    const sub = process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
    console.log('[CONFIG] Server-side getSubdomain:', sub);
    return sub;
  }

  const hostname = window.location.hostname;
  console.log('[CONFIG] Client-side hostname:', hostname);

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const sub = process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
    console.log('[CONFIG] Local dev, using env subdomain:', sub);
    return sub;
  }

  // Production: moonstruck.evoclabs.com -> moonstruck
  // Custom domain: www.example.com -> won't match pattern, fallback
  const parts = hostname.split('.');
  console.log('[CONFIG] Hostname parts:', parts);

  if (parts.length >= 2) {
    console.log('[CONFIG] Extracted subdomain:', parts[0]);
    return parts[0]; // First subdomain
  }

  const sub = process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
  console.log('[CONFIG] Fallback subdomain:', sub);
  return sub;
}

export function getApiUrl(subdomain?: string): string {
  const base = API_BASE;
  const sub = subdomain || getSubdomain();
  const url = `${base}/${sub}/frontend`;
  console.log('[CONFIG] getApiUrl:', url);
  return url;
}

export function isSubdomainUrl(): boolean {
  if (typeof window === 'undefined') {
    console.log('[CONFIG] isSubdomainUrl: false (server)');
    return false;
  }
  const hostname = window.location.hostname;
  const isSub = hostname.includes('.') && !hostname.startsWith('www');
  console.log('[CONFIG] isSubdomainUrl:', isSub, '(', hostname, ')');
  return isSub;
}

export function getStoreInfo(): { subdomain: string; isValid: boolean } {
  const subdomain = getSubdomain();
  const isValid = subdomain.length > 0 && subdomain !== 'localhost';
  console.log('[CONFIG] getStoreInfo:', { subdomain, isValid });
  return { subdomain, isValid };
}