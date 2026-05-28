// Server-side secrets (never exposed to browser)
// These must NOT have NEXT_PUBLIC_ prefix

export const PAYU_KEY = process.env.PAYU_KEY || '';
export const PAYU_SALT = process.env.PAYU_SALT || '';
export const PAYU_CALLBACK_URL = process.env.PAYU_CALLBACK_URL || '';
export const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';