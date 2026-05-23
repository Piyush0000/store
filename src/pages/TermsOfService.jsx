import { useLegalPages } from '../context/StoreContext';
import './Policy.css';

export default function TermsOfService() {
  const pages = useLegalPages();
  const page = pages.find(p => p.type === 'TERMS_OF_SERVICE');

  if (page?.content) {
    return (
      <div className="policy-page">
        <h1>{page.title}</h1>
        <div className="policy-content" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    );
  }

  return (
    <div className="policy-page">
      <h1>Terms of Service</h1>
      <p className="policy-date">Last updated: January 2024</p>
      <div className="policy-content">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Swarajya Imperial website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>
        <h2>2. Products and Pricing</h2>
        <p>All products are described accurately to the best of our knowledge. Prices are subject to change without notice. We reserve the right to limit quantities or discontinue products at any time.</p>
        <h2>3. Order Process</h2>
        <p>Orders are subject to availability and confirmation of the order price. We reserve the right to refuse or cancel any order for any reason, including but not limited to: product availability, errors in pricing, or suspected fraud.</p>
        <h2>4. Payment Terms</h2>
        <p>Payment must be received in full before order processing. We accept various payment methods as indicated at checkout. All transactions are secured and encrypted.</p>
        <h2>5. Intellectual Property</h2>
        <p>All content on this website, including images, text, designs, and logos, is the property of Swarajya Imperial and protected by copyright laws.</p>
        <h2>6. Limitation of Liability</h2>
        <p>Swarajya Imperial shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        <h2>7. Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
        <h2>8. Contact Us</h2>
        <p>For any questions regarding these Terms of Service, please contact us at mauryaglobal08@gmail.com or call +91-9930569627.</p>
      </div>
    </div>
  );
}