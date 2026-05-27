'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { fetchStorefront } from '@/lib/api';
import './Footer.css';

const quickLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return Policy', path: '/refund-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms and condition', path: '/terms-of-service' },
];

const DEFAULT_LOGO = 'https://d1311wbk6unapo.cloudfront.net/NushopWebsiteAsset/tr:w-300,,f-webp,fo-auto/686907a872a04e21d2c32db3_brand_logo_HC7VFLYTI4_2026-03-02.jpg';
const DEFAULT_NAME = 'Swarajya Imperial';
const DEFAULT_DESC = 'At Swarajya Imperial, We Believe Jewellery Is More than Just an Accessory. Founded on A Passion for Craftsmanship.';
const DEFAULT_PHONE = '+91 - 9930569627';
const DEFAULT_EMAIL = 'mauryaglobal08@gmail.com';
const DEFAULT_ADDRESS = 'jayprakash nagar kharodi marve road malad west mumbai, Maharashtra, 400095';
const DEFAULT_FB = 'https://www.facebook.com/profile.php?id=61579162477335';
const DEFAULT_IG = 'https://www.instagram.com/swarajyaimperial/';

function VisaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="footer__payment-icon">
      <title>Visa</title>
      <path fill="#1A1F71" d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564zm5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="footer__payment-icon">
      <title>Mastercard</title>
      <circle cx="6" cy="12" r="6" fill="#EB001B"/>
      <circle cx="18" cy="12" r="6" fill="#F79E1B"/>
      <path d="M12 7.2c1.15.95 1.9 2.45 1.9 4.05s-.75 3.1-1.9 4.05c-1.15-.95-1.9-2.45-1.9-4.05s.75-3.1 1.9-4.05z" fill="#FF5F00"/>
    </svg>
  );
}

function UpiIcon() {
  return (
    <svg viewBox="0 0 48 48" className="footer__payment-icon footer__payment-icon--upi">
      <rect width="48" height="48" rx="8" fill="#fff"/>
      <rect x="8" y="16" width="32" height="16" rx="3" fill="#603BAA"/>
      <text x="24" y="27" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">UPI</text>
    </svg>
  );
}

function PhonePeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="footer__payment-icon footer__payment-icon--phonepe">
      <rect width="48" height="48" rx="8" fill="#5F259F"/>
      <text x="24" y="30" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">PhonePe</text>
    </svg>
  );
}

function PaytmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="footer__payment-icon">
      <title>Paytm</title>
      <path fill="#00B9F1" d="M15.85 8.167a.204.204 0 0 0-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.23.23 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.239.239 0 0 0-.236-.24h-.612V8.386a.218.218 0 0 0-.216-.22zm4.225 1.17c-.398 0-.762.15-1.042.395v-.124a.238.238 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.41.41 0 0 1 .226.09.405.405 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.239.239 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.419.419 0 0 1 .196-.068h.198c.23.02.37.2.37.408.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.601 1.601 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5zM.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484H.232zm9.032 0a.239.239 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004-.303.006H9.739a.239.239 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.239.239 0 0 0-.236-.24h-1.07a.239.239 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.239.239 0 0 0-.236-.24zm-4.004.006a.232.232 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zm-3.713 1.572h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1c-.192.002-.386 0-.578 0zm4.67 1.977h.445c.139 0 .252.108.252.24v.932a.23.23 0 0 1-.014.076.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239Z"/>
    </svg>
  );
}

function RuPayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="footer__payment-icon footer__payment-icon--rupay">
      <rect width="48" height="48" rx="8" fill="#6B8E23"/>
      <text x="24" y="30" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">RuPay</text>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 10.938 8.437 11.946v-8.437H7.078v-3.497h2.359v-2.666c0-2.475 1.438-3.843 3.667-3.843 1.063 0 2.166.197 2.166.197v2.379h-1.223c-1.228 0-1.606-.765-1.606-1.541v-1.714h2.806l-.443 3.497h-2.363v8.437C17.344 23.011 21 18.063 21 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}

export default function Footer() {
  const [storeName, setStoreName] = useState(DEFAULT_NAME);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [brandDesc, setBrandDesc] = useState(DEFAULT_DESC);
  const [contactInfo, setContactInfo] = useState({
    phone: DEFAULT_PHONE,
    email: DEFAULT_EMAIL,
    address: DEFAULT_ADDRESS,
  });
  const [socialLinks, setSocialLinks] = useState({
    facebook: DEFAULT_FB,
    instagram: DEFAULT_IG,
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchStorefront()
      .then((data) => {
        const { customization, store } = data;

        if (store?.name) setStoreName(store.name);
        if (customization?.contactInfo) {
          setContactInfo({
            phone: customization.contactInfo.phone || DEFAULT_PHONE,
            email: customization.contactInfo.email || DEFAULT_EMAIL,
            address: customization.contactInfo.address || DEFAULT_ADDRESS,
          });
        }
        if (customization?.socialLinks) {
          setSocialLinks({
            facebook: customization.socialLinks.facebook || DEFAULT_FB,
            instagram: customization.socialLinks.instagram || DEFAULT_IG,
          });
        }
        if (customization?.aboutSection?.content) {
          setBrandDesc(customization.aboutSection.content);
        }
      })
      .catch((err) => console.error('[Footer] Failed to fetch config:', err));
  }, []);

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
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                <FacebookIcon />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>

        <div className="footer__contact">
          <h4 className="footer__contact-heading">Contact Us</h4>
          <ul className="footer__contact-list">
            <li>Call: {contactInfo.phone}</li>
            <li>WhatsApp: {contactInfo.phone}</li>
            <li>Customer Support Time: 24/7</li>
            <li>Email: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>
            <li>Address: {contactInfo.address}</li>
          </ul>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__row2">
        <div className="footer__quick-links">
          {quickLinks.map((link) => (
            <Link key={link.path} href={link.path} className="footer__quick-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__row4">
        <div className="footer__payment-icons">
          <VisaIcon />
          <MastercardIcon />
          <UpiIcon />
          <PhonePeIcon />
          <PaytmIcon />
          <RuPayIcon />
        </div>
        <button className="footer__go-top" onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUpIcon /> GO TO TOP
        </button>
      </div>
    </footer>
  );
}
