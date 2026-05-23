import { useLegalPages } from '../context/StoreContext';
import './Policy.css';

export default function PrivacyPolicy() {
  const pages = useLegalPages();
  const page = pages.find(p => p.type === 'PRIVACY_POLICY');

  // If API has content, render it — otherwise show hardcoded fallback
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
      <h1>Privacy Policy</h1>
      <p className="policy-date">Last updated: January 2024</p>
      <div className="policy-content">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly, including: name, email address, phone number, shipping address, billing address, and payment information when you make a purchase.</p>
        <h2>2. How We Use Your Information</h2>
        <p>We use your information to: process and fulfill orders, communicate about products and services, send promotional communications (with your consent), and improve our website and services.</p>
        <h2>3. Cookies and Tracking</h2>
        <p>Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us remember your preferences and analyze website traffic.</p>
        <h2>4. Third-Party Sharing</h2>
        <p>We may share your information with trusted third parties, including payment processors, shipping carriers, and analytics providers, solely for the purpose of fulfilling your orders and improving our services.</p>
        <h2>5. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
        <h2>6. Your Rights</h2>
        <p>You have the right to: access your personal data, correct inaccurate data, request deletion of your data, and opt out of marketing communications at any time.</p>
        <h2>7. Contact Us</h2>
        <p>For any questions about our Privacy Policy, please contact us at mauryaglobal08@gmail.com or call +91-9930569627.</p>
      </div>
    </div>
  );
}