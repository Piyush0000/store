import { headers } from 'next/headers';

// Server-side only function to resolve the active subdomain from headers
export async function getServerSubdomain(): Promise<string> {
  try {
    const headersList = await headers();
    
    // 1. Check for custom header set by middleware first
    const xSubdomain = headersList.get('x-subdomain');
    console.log('[server-utils] x-subdomain header:', xSubdomain);
    if (xSubdomain) {
      return xSubdomain;
    }

    // 2. Fallback to parsing Host header
    let host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    console.log('[server-utils] host header:', host);
    if (host.includes(',')) {
      host = host.split(',')[0].trim();
    }
    if (host) {
      // Strip port if exists
      const hostname = host.split(':')[0];
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('[server-utils] Localhost detected. process.env.NEXT_PUBLIC_SUBDOMAIN:', process.env.NEXT_PUBLIC_SUBDOMAIN);
        return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
      }
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[0];
      }
    }
  } catch (error) {
    console.warn('[server-utils] Failed to get host header:', error);
  }
  return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
}
