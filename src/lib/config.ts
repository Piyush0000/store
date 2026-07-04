const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';

// Extract subdomain from hostname (e.g., store.evoclabs.com -> store)
export function getSubdomain(): string {
  if (typeof window !== 'undefined') {
    // 1. Try URL query parameter first (great for testing)
    const params = new URLSearchParams(window.location.search);
    const querySub = params.get('subdomain');
    if (querySub) {
      localStorage.setItem('detected_subdomain', querySub);
      return querySub;
    }

    // 2. Try localStorage saved subdomain next
    const storedSub = localStorage.getItem('detected_subdomain');
    if (storedSub) {
      return storedSub;
    }

    let hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    // Local development: use environment variable fallback
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
    }
    // Extract subdomain from domain
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0];
    }
  }
  return process.env.NEXT_PUBLIC_SUBDOMAIN || '';
}

export function getApiUrl(subdomain?: string): string {
  const sub = subdomain || getSubdomain();
  return `${API_BASE}/${sub}/frontend`;
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