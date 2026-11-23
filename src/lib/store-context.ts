import { cache } from 'react';
import { getServerStoreId, getServerSubdomain } from './server-utils';
import { fetchStorefront } from './api';

export const getStoreContext = cache(async () => {
  let [storeId, subdomain] = await Promise.all([getServerStoreId(), getServerSubdomain()]);
  if (!storeId && subdomain) {
    try {
      const data = await fetchStorefront(subdomain, undefined, { includeProducts: false, includeLegal: false });
      storeId = data.store?.id || '';
    } catch (err) {
      console.warn('[store-context] Failed to resolve storeId for subdomain:', subdomain, err);
    }
  }
  return { storeId, subdomain };
});

export const getCheckoutSettings = cache(async () => {
  const { storeId, subdomain } = await getStoreContext();
  const data = await fetchStorefront(subdomain, storeId, { includeProducts: false, includeLegal: false });
  return {
    storeId,
    subdomain,
    store: data.store,
    settings: data.settings,
    paymentSettings: (data as any).paymentSettings,
    shippingSettings: data.customization?.shippingSettings,
  };
});
