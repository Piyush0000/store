import { Link } from 'react-router-dom';
import { useCustomization } from '../context/StoreContext';
import './Footer.css';

const quickLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return Policy', path: '/refund-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms and condition', path: '/terms-of-service' },
];

const paymentIcons = [
  { name: 'PhonePe', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.png/120px-PhonePe_Logo.png' },
  { name: 'Google Pay', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png' },
  { name: 'Paytm', src: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png' },
  { name: 'UPI', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/120px-UPI-Logo-vector.svg.png' },
  { name: 'RuPay', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay.svg/120px-RuPay.svg.png' },
  { name: 'Mastercard', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png' },
  { name: 'Visa', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png' },
];

const FALLBACK_LOGO = 'https://d1311wbk6unapo.cloudfront.net/NushopWebsiteAsset/tr:w-300,,f-webp,fo-auto/686907a872a04e21d2c32db3_brand_logo_HC7VFLYTI4_2026-03-02.jpg';

export default function Footer() {
  const c = useCustomization();

  const storeName = c?.headerConfig?.storeName || 'Swarajya Imperial';
  const logoUrl = c?.logo || c?.headerConfig?.logoUrl || FALLBACK_LOGO;
  const brandDesc = c?.aboutSection?.content || `At Swarajya Imperial, We Believe Jewellery Is More than Just an Accessory. Founded on A Passion for Craftsmanship.`;
  const phone = c?.contactInfo?.phone || '+91 - 9930569627';
  const email = c?.contactInfo?.email || 'mauryaglobal08@gmail.com';
  const address = c?.contactInfo?.address || 'jayprakash nagar kharodi marve road malad west mumbai, Maharashtra, 400095';
  const facebookUrl = c?.socialLinks?.facebook || 'https://www.facebook.com/profile.php?id=61579162477335';
  const instagramUrl = c?.socialLinks?.instagram || 'https://www.instagram.com/swarajyaimperial/';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__row1">
        <div className="footer__brand">
          <div className="footer__logo-wrap">
            <img src={logoUrl} alt={storeName} className="footer__logo" />
          </div>
          <h3 className="footer__brand-name">{storeName}</h3>
          <p className="footer__brand-desc">{brandDesc}</p>
          <div className="footer__social">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
              <img src="https://cdn.zeplin.io/625010cc1f439d65f2e6923a/assets/0fe8623a-92b1-4c60-b8e6-4908a033002f-3x.png" alt="Facebook" />
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
              <img src="https://cdn.zeplin.io/625010cc1f439d65f2e6923a/assets/adcd9537-a389-4b15-a623-12d504c27047-3x.png" alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer__contact">
          <h4 className="footer__contact-heading">Contact Us</h4>
          <ul className="footer__contact-list">
            <li>Call: {phone}</li>
            <li>WhatsApp: {phone}</li>
            <li>Customer Support Time: 24/7</li>
            <li>Email: <a href={`mailto:${email}`}>{email}</a></li>
            <li>Address: {address}</li>
          </ul>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__row2">
        <div className="footer__quick-links">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="footer__quick-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__row4">
        <div className="footer__payment-icons">
          {paymentIcons.map((icon) => (
            <img key={icon.name} src={icon.src} alt={icon.name} className="footer__payment-icon" />
          ))}
        </div>
        <button className="footer__go-top" onClick={scrollToTop}>
          ↑ GO TO TOP
        </button>
      </div>
    </footer>
  );
}