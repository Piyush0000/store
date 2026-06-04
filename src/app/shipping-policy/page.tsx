export const dynamic = "force-dynamic";

import { fetchLegal } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import '@/app/policy.css';

export default async function ShippingPolicyPage() {
  let content = '';

  try {
    const subdomain = await getServerSubdomain();
    const legalPages = await fetchLegal(subdomain);
    const shipping = legalPages.find(p => p.type === 'SHIPPING_POLICY');
    content = shipping?.content || '';
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
  }

  return (
    <div className="policy">
      <div className="policy__header">
        <h1>Shipping Policy</h1>
      </div>
      <div className="policy__content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>Shipping policy content coming soon.</p>
        )}
      </div>
    </div>
  );
}