// API base URL - subdomain determines which store's data is returned
const API_BASE = 'https://api.evoclabs.com/api/storefront/public';

// Extract subdomain from hostname (e.g., moonstruck.evoclabs.com -> moonstruck)
export function getSubdomain(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development: use hardcoded default
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'moonstruck';
    }
    // Extract subdomain from domain
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0];
    }
  }
  return 'moonstruck';
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