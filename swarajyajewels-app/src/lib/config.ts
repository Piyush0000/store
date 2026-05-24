export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';

export const TWO_FACTOR_API_KEY = process.env.NEXT_PUBLIC_TWO_FACTOR_API_KEY || '';

export const PAYU_KEY = process.env.NEXT_PUBLIC_PAYU_KEY || '';
export const PAYU_SALT = process.env.NEXT_PUBLIC_PAYU_SALT || '';

export const getSubdomain = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
  }
  return hostname.split('.')[0];
};

export const getApiUrl = (subdomain?: string) =>
  `${API_BASE}/${subdomain || getSubdomain()}/frontend`;