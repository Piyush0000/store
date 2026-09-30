import { cookies, headers } from 'next/headers';

const cookieSubdomain = async () => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('x-store-subdomain')?.value || '';
  } catch {
    return '';
  }
};

export async function getServerStoreId(): Promise<string> {
  try {
    const headersList = await headers();
    const fromHeader = headersList.get('x-store-id');
    if (fromHeader) return fromHeader;
    const cookieStore = await cookies();
    return cookieStore.get('x-store-id')?.value || '';
  } catch {
    return '';
  }
}

export async function getServerSubdomain(): Promise<string> {
  try {
    const headersList = await headers();
    const xSubdomain = headersList.get('x-subdomain');
    if (xSubdomain) return xSubdomain;

    const fromCookie = await cookieSubdomain();
    if (fromCookie) return fromCookie;

    let host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    if (host.includes(',')) host = host.split(',')[0].trim();
    if (host) {
      let hostname = host.split(':')[0].toLowerCase();
      if (hostname.startsWith('www.')) hostname = hostname.substring(4);
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
      }
      if (hostname.endsWith('.evoclabs.com')) {
        return hostname.split('.')[0] || '';
      }
    }
  } catch (error: any) {
    if (error && (error.digest === 'DYNAMIC_SERVER_USAGE' || String(error.message).includes('Dynamic server usage'))) {
      throw error;
    }
    console.warn('[server-utils] Failed to resolve storefront identity:', error);
  }
  return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
}
