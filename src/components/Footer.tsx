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
          <img src="/UPI.svg" alt="UPI" className="footer__payment-icon footer__payment-icon--upi" />
          <img src="/PhonePe.svg" alt="PhonePe" className="footer__payment-icon footer__payment-icon--phonepe" />
                    <img src="/RuPay.svg" alt="RuPay" className="footer__payment-icon footer__payment-icon--rupay" />
        </div>
        <button className="footer__go-top" onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUpIcon /> GO TO TOP
        </button>
      </div>
    </footer>
  );
}
