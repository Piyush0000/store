export const dynamic = "force-dynamic";

import { fetchLegal } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import '@/app/policy.css';

export default async function TermsOfServicePage() {
  let content = '';

  try {
    const subdomain = await getServerSubdomain();
    const legalPages = await fetchLegal(subdomain);
    const terms = legalPages.find(p => p.type === 'TERMS_OF_SERVICE');
    content = terms?.content || '';
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
  }

  return (
    <div className="policy">
      <div className="policy__header">
        <h1>Terms of Service</h1>
      </div>
      <div className="policy__content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>Terms of service content coming soon.</p>
        )}
      </div>
    </div>
  );
}