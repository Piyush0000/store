import { headers } from 'next/headers';

// Server-side only function to resolve the active subdomain from headers
export async function getServerSubdomain(): Promise<string> {
  try {
    const headersList = await headers();
    let host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    if (host.includes(',')) {
      host = host.split(',')[0].trim();
    }
    if (host) {
      // Strip port if exists
      const hostname = host.split(':')[0];
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
      }
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[0];
      }
    }
  } catch (error) {
    console.warn('[server-utils] Failed to get host header:', error);
  }
  return process.env.NEXT_PUBLIC_SUBDOMAIN || 'moonstruck';
}
