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

export default async function RefundPolicyPage() {
  let content = '';
  let title = 'Refund Policy';

  try {
    const subdomain = await getServerSubdomain();
    const page = await fetchPageBySlug('refund-policy', subdomain);
    content = page?.content || '';
    title = page?.title || title;
  } catch (error) {
    console.error('Failed to fetch refund-policy page:', error);
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
          <p>Refund policy content coming soon.</p>
        )}
      </div>
    </div>
  );
}