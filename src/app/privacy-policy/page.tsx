import { fetchLegal } from '@/lib/api';
import './policy.css';

export default async function PrivacyPolicyPage() {
  let content = '';

  try {
    const legalPages = await fetchLegal();
    const privacy = legalPages.find(p => p.type === 'PRIVACY_POLICY');
    content = privacy?.content || '';
  } catch (error) {
    console.error('Failed to fetch legal pages:', error);
  }

  return (
    <div className="policy">
      <div className="policy__header">
        <h1>Privacy Policy</h1>
      </div>
      <div className="policy__content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>Privacy policy content coming soon.</p>
        )}
      </div>
    </div>
  );
}