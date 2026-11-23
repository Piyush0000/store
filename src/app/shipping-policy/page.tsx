export const dynamic = "force-dynamic";

import { fetchPageBySlug } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import '@/app/policy.css';

const formatContent = (text: string) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  return text
    .split(/\n\s*\n/)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export default async function ShippingPolicyPage() {
  let content = '';
  let title = 'Shipping Policy';

  try {
    const subdomain = await getServerSubdomain();
    const page = await fetchPageBySlug('shipping-policy', subdomain);
    content = page?.content || '';
    title = page?.title || title;
  } catch (error) {
    console.error('Failed to fetch shipping-policy page:', error);
  }

  return (
    <div className="policy-page">
      <div className="policy-page__header">
        <h1>{title}</h1>
      </div>
      <div className="policy-content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
        ) : (
          <p>Shipping policy content coming soon.</p>
        )}
      </div>
    </div>
  );
}