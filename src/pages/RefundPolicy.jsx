import { useLegalPages } from '../context/StoreContext';
import './Policy.css';

export default function RefundPolicy() {
  const pages = useLegalPages();
  const page = pages.find(p => p.type === 'REFUND_POLICY');

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
      <h1>Refund Policy</h1>
      <p className="policy-date">Last updated: January 2024</p>
      <div className="policy-content">
        <h2>1. Eligibility for Refunds</h2>
        <p>We accept returns within 7 days of delivery for most products. Items must be unused, unworn, and in their original packaging with all tags attached. Customized or personalized items are non-refundable.</p>
        <h2>2. Return Process</h2>
        <p>To initiate a return, please contact us at mauryaglobal08@gmail.com or call +91-9930569627 with your order number and reason for return. We will provide you with return shipping instructions.</p>
        <h2>3. Refund Timeline</h2>
        <p>Once we receive your return, please allow 5-7 business days for processing. Refunds will be credited to your original payment method within 7-10 business days after processing.</p>
        <h2>4. Non-Refundable Items</h2>
        <p>The following items are non-refundable:</p>
        <ul>
          <li>Earrings (for hygiene reasons)</li>
          <li>Customized or personalized jewelry</li>
          <li>Items marked as "Final Sale"</li>
          <li>Items returned after 7 days of delivery</li>
        </ul>
        <h2>5. Exchange Options</h2>
        <p>We offer exchanges for size or color variations subject to availability. Contact us within 7 days of delivery to arrange an exchange.</p>
        <h2>6. Damaged or Defective Items</h2>
        <p>If you receive a damaged or defective item, please contact us immediately with photos. We will arrange for a replacement or full refund at no additional cost.</p>
        <h2>7. Contact Us</h2>
        <p>For any questions about our Refund Policy, please reach out to us at mauryaglobal08@gmail.com or call +91-9930569627.</p>
      </div>
    </div>
  );
}