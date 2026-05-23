
export const API_BASE = 'https://api.evoclabs.com/api/storefront/public';

export const getSubdomain = () => {
  const hostname = window.location.hostname;
  // For localhost, use 'moonstruck' as default
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'moonstruck';
  }
  // Extract subdomain from hostname (e.g., "store.example.com" -> "store")
  return hostname.split('.')[0];
};

export const getApiUrl = (subdomain = getSubdomain()) =>
  `${API_BASE}/${subdomain}/frontend`;
 