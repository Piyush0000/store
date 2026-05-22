import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import './Footer.css';

const collections = [
  { label: 'BEST SELLER', path: '/catalogue?category=best-seller' },
  { label: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets' },
  { label: 'NECKLACE', path: '/catalogue?category=necklace' },
  { label: 'IN THE SPOTLIGHT', path: '/catalogue?category=spotlight' },
  { label: 'EARRINGS', path: '/catalogue?category=earrings' },
];

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      {/* Top: Newsletter */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <h3>Stay Royal, Stay Updated</h3>
            <p>Subscribe for exclusive offers and new arrivals</p>
          </div>
          <div className="footer__newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="footer__newsletter-input"
              id="newsletter-email"
            />
            <button className="footer__newsletter-btn" id="newsletter-subscribe">
              Subscribe
            </button>
          </div>
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
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook" id="footer-facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram" id="footer-instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter" id="footer-twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube" id="footer-youtube">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
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
