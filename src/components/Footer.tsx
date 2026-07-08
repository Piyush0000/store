'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { fetchStorefront, fetchPages } from '@/lib/api';
import './Footer.css';

const DEFAULT_SLUGS = ['about', 'privacy-policy', 'refund-policy', 'shipping-policy', 'terms-of-service'];

const quickLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Return Policy', path: '/refund-policy' },
  { label: 'Shipping Policy', path: '/shipping-policy' },
  { label: 'Terms and condition', path: '/terms-of-service' },
];

const DEFAULT_LOGO = '';
const DEFAULT_NAME = 'Demo Store';
const DEFAULT_DESC = 'Welcome to our store. We believe in providing the best quality products for our customers.';
const DEFAULT_PHONE = '';
const DEFAULT_EMAIL = 'contact@example.com';
const DEFAULT_ADDRESS = '';
const DEFAULT_FB = '';
const DEFAULT_IG = '';
const DEFAULT_TWITTER = '';
const DEFAULT_TIKTOK = '';

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 8H7v4h2v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.57-3.99-1.57-.49-.45-.91-.97-1.24-1.54v7.87c.05 2.44-.99 4.9-3.07 6.18-2.22 1.39-5.22 1.35-7.39-.08C4.58 19.34 3.75 16.2 4.6 13.5c.74-2.42 2.92-4.22 5.46-4.52V13c-1.45.15-2.88 1.11-3.35 2.5-.59 1.69.17 3.75 1.73 4.54 1.57.8 3.73.34 4.75-1.18.29-.41.38-.91.38-1.41V0h-1.06z"/>
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

function getContrastColor(hexColor: string) {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return '#ffffff';
  
  let r = 0, g = 0, b = 0;
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  }
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface FooterProps {
  initialCustomization?: any;
  storeName?: string;
  storeSubdomain?: string;
}

export default function Footer({ initialCustomization, storeName: propStoreName, storeSubdomain }: FooterProps) {
  const getInitialLogo = () => {
    let headerStyle = initialCustomization?.headerStyle;
    if (headerStyle && typeof headerStyle === 'string') {
      try { headerStyle = JSON.parse(headerStyle); } catch (err) {}
    }
    return initialCustomization?.logo || headerStyle?.logoUrl || initialCustomization?.headerConfig?.logoUrl || DEFAULT_LOGO;
  };

  const getInitialStoreName = () => {
    let headerStyle = initialCustomization?.headerStyle;
    if (headerStyle && typeof headerStyle === 'string') {
      try { headerStyle = JSON.parse(headerStyle); } catch (err) {}
    }
    return headerStyle?.storeName || headerStyle?.logoText || initialCustomization?.headerConfig?.storeName || propStoreName || DEFAULT_NAME;
  };

  const [storeName, setStoreName] = useState(getInitialStoreName);
  const [logoUrl, setLogoUrl] = useState(getInitialLogo);
  const [logoError, setLogoError] = useState(false);
  const [brandDesc, setBrandDesc] = useState(() => {
    const fc = initialCustomization?.footerContent;
    const fs = initialCustomization?.footerStyle;
    return fc?.bio || fc?.description || fs?.bio || initialCustomization?.aboutSection?.content || DEFAULT_DESC;
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const fc = initialCustomization?.footerContent;
    const fs = initialCustomization?.footerStyle;
    return fc?.backgroundColor || fs?.backgroundColor || '#0a0a0a';
  });

  const [links, setLinks] = useState<{ label: string; path: string }[]>(quickLinks);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  useEffect(() => {
    if (propStoreName) {
      setStoreName(propStoreName);
    }
  }, [propStoreName]);

  const [contactInfo, setContactInfo] = useState(() => {
    // Support footerContent structure from admin panel
    const fc = initialCustomization?.footerContent;
    return {
      phone: fc?.contact?.phone || initialCustomization?.contactInfo?.phone || DEFAULT_PHONE,
      email: fc?.contact?.email || initialCustomization?.contactInfo?.email || DEFAULT_EMAIL,
      address: fc?.contact?.address || initialCustomization?.contactInfo?.address || DEFAULT_ADDRESS,
    };
  });
  const [socialLinks, setSocialLinks] = useState(() => {
    const fc = initialCustomization?.footerContent;
    return {
      facebook: fc?.socials?.facebook || initialCustomization?.socialLinks?.facebook || DEFAULT_FB,
      instagram: fc?.socials?.instagram || initialCustomization?.socialLinks?.instagram || DEFAULT_IG,
      twitter: fc?.socials?.twitter || initialCustomization?.socialLinks?.twitter || DEFAULT_TWITTER,
      tiktok: fc?.socials?.tiktok || initialCustomization?.socialLinks?.tiktok || DEFAULT_TIKTOK,
    };
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    fetchPages(storeSubdomain)
      .then((pages) => {
        const updatedLinks = quickLinks.map((ql) => {
          const slug = ql.path.replace('/', '');
          const match = pages.find((p) => p.slug === slug);
          if (match) {
            return { label: match.title, path: ql.path };
          }
          return ql;
        });

        const customPages = pages.filter((p) => !DEFAULT_SLUGS.includes(p.slug) && p.isActive);
        const finalLinks = [
          ...updatedLinks,
          ...customPages.map((cp) => ({
            label: cp.title,
            path: `/pages/${cp.slug}`
          }))
        ];
        setLinks(finalLinks);
      })
      .catch((err) => console.warn('[Footer] Failed to fetch pages:', err));
  }, []);

  useEffect(() => {
    if (initialCustomization) {
      return; // Skip fetch since we have initialCustomization!
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchStorefront(storeSubdomain)
      .then((data) => {
        const { customization, store } = data;

        if (store?.name) setStoreName(store.name);

        let headerStyle = customization?.headerStyle;
        if (headerStyle && typeof headerStyle === 'string') {
          try { headerStyle = JSON.parse(headerStyle); } catch (err) {}
        }

        if (customization?.logo) {
          setLogoUrl(customization.logo);
        } else if (headerStyle?.logoUrl) {
          setLogoUrl(headerStyle.logoUrl);
        } else if (customization?.headerConfig?.logoUrl) {
          setLogoUrl(customization.headerConfig.logoUrl);
        }

        // Also support footerContent structure from admin panel
        if (customization?.footerContent) {
          const fc = customization.footerContent;
          setContactInfo({
            phone: fc?.contact?.phone || customization.contactInfo?.phone || DEFAULT_PHONE,
            email: fc?.contact?.email || customization.contactInfo?.email || DEFAULT_EMAIL,
            address: fc?.contact?.address || customization.contactInfo?.address || DEFAULT_ADDRESS,
          });
          setSocialLinks({
            facebook: fc?.socials?.facebook || customization.socialLinks?.facebook || DEFAULT_FB,
            instagram: fc?.socials?.instagram || customization.socialLinks?.instagram || DEFAULT_IG,
            twitter: fc?.socials?.twitter || customization.socialLinks?.twitter || DEFAULT_TWITTER,
            tiktok: fc?.socials?.tiktok || customization.socialLinks?.tiktok || DEFAULT_TIKTOK,
          });
        } else if (customization?.contactInfo) {
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
            twitter: customization.socialLinks.twitter || DEFAULT_TWITTER,
            tiktok: customization.socialLinks.tiktok || DEFAULT_TIKTOK,
          });
        }
        if (customization?.footerContent?.bio || customization?.footerContent?.description || customization?.footerStyle?.bio) {
          setBrandDesc(customization.footerContent?.bio || customization.footerContent?.description || customization.footerStyle?.bio);
        } else if (customization?.aboutSection?.content) {
          setBrandDesc(customization.aboutSection.content);
        }
        const fcBg = customization?.footerContent?.backgroundColor;
        const fsBg = customization?.footerStyle?.backgroundColor;
        setBackgroundColor(fcBg || fsBg || '#0a0a0a');
      })
      .catch((err) => console.warn('[Footer] Failed to fetch config:', err));
  }, [initialCustomization]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        const cust = e.data.data;
        let headerStyle = cust?.headerStyle;
        if (headerStyle && typeof headerStyle === 'string') {
          try { headerStyle = JSON.parse(headerStyle); } catch (err) {}
        }

        if (cust?.logo) {
          setLogoUrl(cust.logo);
        } else if (headerStyle?.logoUrl) {
          setLogoUrl(headerStyle.logoUrl);
        } else if (cust?.headerConfig?.logoUrl) {
          setLogoUrl(cust.headerConfig.logoUrl);
        }

        if (headerStyle?.storeName || headerStyle?.logoText) {
          setStoreName(headerStyle.storeName || headerStyle.logoText);
        } else if (cust?.headerConfig?.storeName) {
          setStoreName(cust.headerConfig.storeName);
        }

        if (cust?.footerContent) {
          const fc = cust.footerContent;
          setContactInfo({
            phone: fc?.contact?.phone || cust.contactInfo?.phone || DEFAULT_PHONE,
            email: fc?.contact?.email || cust.contactInfo?.email || DEFAULT_EMAIL,
            address: fc?.contact?.address || cust.contactInfo?.address || DEFAULT_ADDRESS,
          });
          setSocialLinks({
            facebook: fc?.socials?.facebook || cust.socialLinks?.facebook || DEFAULT_FB,
            instagram: fc?.socials?.instagram || cust.socialLinks?.instagram || DEFAULT_IG,
            twitter: fc?.socials?.twitter || cust.socialLinks?.twitter || DEFAULT_TWITTER,
            tiktok: fc?.socials?.tiktok || cust.socialLinks?.tiktok || DEFAULT_TIKTOK,
          });
        } else if (cust?.contactInfo) {
          setContactInfo({
            phone: cust.contactInfo.phone || DEFAULT_PHONE,
            email: cust.contactInfo.email || DEFAULT_EMAIL,
            address: cust.contactInfo.address || DEFAULT_ADDRESS,
          });
        }
        if (cust?.socialLinks) {
          setSocialLinks({
            facebook: cust.socialLinks.facebook || DEFAULT_FB,
            instagram: cust.socialLinks.instagram || DEFAULT_IG,
            twitter: cust.socialLinks.twitter || DEFAULT_TWITTER,
            tiktok: cust.socialLinks.tiktok || DEFAULT_TIKTOK,
          });
        }
        if (cust?.footerContent?.bio || cust?.footerContent?.description || cust?.footerStyle?.bio) {
          setBrandDesc(cust.footerContent?.bio || cust.footerContent?.description || cust.footerStyle?.bio);
        } else if (cust?.aboutSection?.content) {
          setBrandDesc(cust.aboutSection.content);
        }
        const fcBg = cust?.footerContent?.backgroundColor;
        const fsBg = cust?.footerStyle?.backgroundColor;
        setBackgroundColor(fcBg || fsBg || '#0a0a0a');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const txtColor = getContrastColor(backgroundColor);
  const secondaryTxtColor = txtColor === '#000000' ? '#555555' : '#999999';
  const borderColor = txtColor === '#000000' ? 'rgba(0, 0, 0, 0.15)' : '#222222';

  return (
    <footer 
      className="footer"
      style={{
        backgroundColor: backgroundColor,
        '--footer-bg': backgroundColor,
        '--footer-text': txtColor,
        '--footer-text-secondary': secondaryTxtColor,
        '--footer-border': borderColor,
      } as React.CSSProperties}
    >
      <div className="footer__row1">
        <div className="footer__brand">
          <div className="footer__logo-wrap">
            {logoError || !logoUrl || !(logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('/')) ? (
              <span className="footer__logo-text">{storeName.toUpperCase()}</span>
            ) : (
              <img
                src={logoUrl}
                alt={storeName}
                className="footer__logo"
                onError={() => setLogoError(true)}
              />
            )}
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
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter / X">
                <TwitterIcon />
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="TikTok">
                <TikTokIcon />
              </a>
            )}
          </div>
        </div>

        <div className="footer__contact">
          <h4 className="footer__contact-heading">Contact Us</h4>
          <ul className="footer__contact-list">
            {contactInfo.phone && <li>Call: {contactInfo.phone}</li>}
            {contactInfo.phone && <li>WhatsApp: {contactInfo.phone}</li>}
            <li>Customer Support Time: 24/7</li>
            {contactInfo.email && <li>Email: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>}
            {contactInfo.address && <li>Address: {contactInfo.address}</li>}
          </ul>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__row2">
        <div className="footer__quick-links">
          {links.map((link) => (
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

      <div className="footer__powered-by-wrap">
        <a href="https://evoclabs.com" target="_blank" rel="noopener noreferrer" className="footer__powered-by">
          <span className="footer__powered-by-text">Powered by</span>
          <img src="/evoc-logo.png" alt="EvocLabs" className="footer__evoc-logo" />
          <span className="footer__powered-by-name">EvocLabs</span>
        </a>
      </div>
    </footer>
  );
}
