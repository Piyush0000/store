import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import './Footer.css';

const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const collections = [
  { label: 'BEST SELLER', path: '/catalogue?category=best-seller' },
  { label: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets' },
  { label: 'NECKLACE', path: '/catalogue?category=necklace' },
  { label: 'IN THE SPOTLIGHT', path: '/catalogue?category=spotlight' },
  { label: 'EARRINGS', path: '/catalogue?category=earrings' },
];

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    if (email) {
      alert('Thank you for subscribing!');
      document.getElementById('newsletter-email').value = '';
    }
  };
  return (
    <footer className="footer" id="site-footer">
      {/* Top: Newsletter */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <h3>Stay Royal, Stay Updated</h3>
            <p>Subscribe for exclusive offers and new arrivals</p>
          </div>
          <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              className="footer__newsletter-input"
              id="newsletter-email"
              required
            />
            <button type="submit" className="footer__newsletter-btn" id="newsletter-subscribe">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer__main">
        <div className="container footer__grid">
          {/* Brand Column */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-text">SWARAJYA</span>
              <span className="footer__logo-sub">IMPERIAL</span>
            </Link>
            <p className="footer__brand-desc">
              At Swarajya Imperial, We Believe Jewellery Is More than Just an Accessory — It's an Expression of Identity, Emotion, and Timeless Beauty. Founded on A Passion for Craftsmanship.
            </p>
            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram" id="footer-instagram">
                <InstagramIcon size={18} />
              </a>
            </div>
            <div className="footer__payment">
              <span className="footer__payment-label">We Accept</span>
              <div className="footer__payment-icons">
                <span className="footer__payment-icon">VISA</span>
                <span className="footer__payment-icon">MC</span>
                <span className="footer__payment-icon">UPI</span>
                <span className="footer__payment-icon">PAYTM</span>
              </div>
            </div>
          </div>

          {/* Contact Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact Us</h4>
            <div className="footer__contact-items">
              <a href="tel:+919930569627" className="footer__contact-item" id="footer-phone">
                <Phone size={14} />
                <span>Call: +91 - 9930569627</span>
              </a>
              <a href="https://wa.me/919930569627" target="_blank" rel="noopener noreferrer" className="footer__contact-item" id="footer-whatsapp">
                <Phone size={14} />
                <span>WhatsApp: +91 - 9930569627</span>
              </a>
              <a href="mailto:mauryaglobal08@gmail.com" className="footer__contact-item" id="footer-email">
                <Mail size={14} />
                <span>mauryaglobal08@gmail.com</span>
              </a>
              <div className="footer__contact-item" id="footer-address">
                <MapPin size={14} />
                <span>Jayprakash Nagar, Kharodi Marve Road, Malad West, Mumbai, 400095</span>
              </div>
              <div className="footer__contact-item" id="footer-hours">
                <Clock size={14} />
                <span>Customer Support: 24/7</span>
              </div>
            </div>
          </div>

          {/* Policies Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Policies</h4>
            <div className="footer__links">
              <Link to="/about" className="footer__link" id="footer-about">About Us</Link>
              <Link to="/privacy-policy" className="footer__link" id="footer-privacy">Privacy Policy</Link>
              <Link to="/refund-policy" className="footer__link" id="footer-refund">Refund Policy</Link>
              <Link to="/shipping-policy" className="footer__link" id="footer-shipping">Shipping Policy</Link>
              <Link to="/terms-of-service" className="footer__link" id="footer-terms">Terms of Service</Link>
            </div>
          </div>

          {/* Collections Column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Collections</h4>
            <div className="footer__links">
              {collections.map((c) => (
                <Link key={c.path} to={c.path} className="footer__link">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Swarajya Imperial. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy-policy">Privacy</Link>
            <span>|</span>
            <Link to="/terms-of-service">Terms</Link>
            <span>|</span>
            <Link to="/refund-policy">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
