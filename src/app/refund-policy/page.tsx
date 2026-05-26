import { fetchLegal } from '@/lib/api';
import './policy.css';

export default async function RefundPolicyPage() {
  let content = '';

  try {
    const legalPages = await fetchLegal();
    const refund = legalPages.find(p => p.type === 'REFUND_POLICY');
    content = refund?.content || '';
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
  }

  return (
    <div className="policy">
      <div className="policy__header">
        <h1>Refund Policy</h1>
      </div>
      <div className="policy__content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>Refund policy content coming soon.</p>
        )}
      </div>
    </div>
  );
}