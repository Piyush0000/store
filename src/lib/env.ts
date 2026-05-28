// Server-side only (never exposed to browser)
// These are secret keys that should NOT have NEXT_PUBLIC_ prefix

export const PAYU_KEY = process.env.PAYU_KEY || '';
export const PAYU_SALT = process.env.PAYU_SALT || '';
export const PAYU_CALLBACK_URL = process.env.PAYU_CALLBACK_URL || '';
export const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || '';
export const STORE_ID = process.env.STORE_ID || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';

// Client-side public variables (accessible in browser)
export const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
export const NEXT_PUBLIC_SUBDOMAIN = process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
export const NEXT_PUBLIC_PAYU_KEY = process.env.NEXT_PUBLIC_PAYU_KEY || '';