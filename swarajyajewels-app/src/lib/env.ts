// Server-side env vars (accessed only in server components/actions)
export const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || '';
export const PAYU_KEY = process.env.PAYU_KEY || process.env.NEXT_PUBLIC_PAYU_KEY || '';
export const PAYU_SALT = process.env.PAYU_SALT || process.env.VITE_PAYU_SALT || '';
export const PAYU_CALLBACK_URL = process.env.PAYU_CALLBACK_URL || 'http://localhost:3000/api/payu/callback';
export const STORE_ID = process.env.STORE_ID || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';