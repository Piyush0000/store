'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MessageCircle, ArrowUp, Music2, AtSign } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import PoweredByEvoc, { isLightColor } from './PoweredByEvoc';
import './FooterDesign.css';

export const FOOTER_DESIGNS = ['minimal-brand', 'large-brand', 'store-directory', 'centered-elegant', 'floating-card'];
export function footerSettings(customization: any): Record<string, any> {
  let legacy = customization?.footerStyle;
  if (typeof legacy === 'string') { try { legacy = JSON.parse(legacy); } catch { legacy = {}; } }
  return { ...(legacy && typeof legacy === 'object' ? legacy : {}), ...(customization?.footerContent || {}) };
}
const limit = (value: any, fallback: number, min: number, max: number) =>
  value === '' || value == null || !Number.isFinite(Number(value)) ? fallback : Math.max(min, Math.min(max, Number(value)));
const safeLink = (value: unknown) => typeof value === 'string' && /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value.trim()) ? value.trim() : '';
type FooterLink = { label: string; path: string };
const Facebook = ({ size = 17 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1 .3-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v9z" /></svg>;
const Instagram = ({ size = 17 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>;
const Youtube = ({ size = 17 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>;

export default function FooterDesign({ customization, storeName, defaultLogo, links }: {
  customization: any; storeName: string; defaultLogo: string; links: FooterLink[];
}) {
  const settings = footerSettings(customization);
  const variant = settings.footerVariant;
  const root = useRef<HTMLElement>(null);
  const [logoError, setLogoError] = useState(false);
  const logo = resolveMediaUrl(settings.footerBanner ?? customization?.footerBanner ?? defaultLogo);
  useEffect(() => setLogoError(false), [logo]);
  useEffect(() => {
    if (customization.__previewFooter && window.parent !== window) {
      const frame = requestAnimationFrame(() => root.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
      return () => cancelAnimationFrame(frame);
    }
  }, [variant, customization.__previewFooter]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width:901px)');
    const expand = () => { if (desktop.matches) root.current?.querySelectorAll('details').forEach(group => { group.open = true; }); };
    desktop.addEventListener('change', expand);
    return () => desktop.removeEventListener('change', expand);
  }, []);
  useEffect(() => {
    const focusFooter = (event: MessageEvent) => {
      if (window.parent !== window && event.source === window.parent && event.data?.type === 'ORBIT_FOOTER_PREVIEW') {
        root.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    };
    window.addEventListener('message', focusFooter);
    return () => window.removeEventListener('message', focusFooter);
  }, []);

  const background = settings.backgroundColor || '#0b0d0c';
  const text = settings.textColor || '#f7f7f2';
  const contacts = { ...(customization?.contactInfo || {}), ...(settings.contact || {}) };
  const socials = { ...(customization?.socialLinks || {}), ...(settings.socials || {}) };
  const socialEntries = [
    ['facebook', 'Facebook', Facebook], ['instagram', 'Instagram', Instagram],
    ['whatsapp', 'WhatsApp', MessageCircle], ['youtube', 'YouTube', Youtube],
    ['twitter', 'X', AtSign], ['tiktok', 'TikTok', Music2],
  ] as const;
  const visibleSocials = socialEntries.filter(([key]) => safeLink(socials[key]));
  const shopLinks = (customization?.navLinks || []).filter((link: any) => link.href && link.href !== '/').map((link: any) => ({ label: link.label, href: link.href }));
  const defaults = variant === 'minimal-brand' ? [
    { title: 'Explore', links: [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/catalogue' }, { label: 'About us', href: '/about' }] },
  ] : [
    { title: 'Shop', links: shopLinks.length ? shopLinks : [{ label: 'All products', href: '/catalogue' }] },
    { title: 'Customer care', links: links.map(link => ({ label: link.label, href: link.path })) },
  ];
  const columns = Array.isArray(settings.linkColumns) ? settings.linkColumns : defaults;
  const renderLinks = (column: any) => <ul>{(Array.isArray(column.links) ? column.links : []).filter((link: any) => link.label && safeLink(link.href)).map((link: any, index: number) =>
    <li key={`${link.href}-${index}`}><Link href={safeLink(link.href)}>{link.label}</Link></li>)}</ul>;
  const contact = settings.showContact !== false && (contacts.email || contacts.phone || contacts.address) ? <section className="footer-design__contact">
    <h3>Contact</h3>
    {contacts.email && <a href={`mailto:${contacts.email}`}>{contacts.email}</a>}
    {contacts.phone && <a href={`tel:${String(contacts.phone).replace(/[^+\d]/g, '')}`}>{contacts.phone}</a>}
    {contacts.address && <p>{contacts.address}</p>}
  </section> : null;
  const socialBlock = visibleSocials.length > 0 && settings.showSocials !== false ? <section className="footer-design__social-section">
    <h3>Follow us</h3><div className="footer-design__socials">
      {visibleSocials.map(([key, label, Icon]) => <a key={key} href={safeLink(socials[key])} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <Icon size={17} aria-hidden="true" />{settings.socialLabels !== false && <span>{label}</span>}
      </a>)}
    </div>
  </section> : null;
  const image = settings.backgroundImage ? resolveMediaUrl(settings.backgroundImage) : '';
  const style = {
    '--fd-bg': background, '--fd-text': text, '--fd-heading': settings.accentColor || text,
    '--fd-hover': settings.linkHoverColor || settings.accentColor || text,
    '--fd-padding': `${limit(settings.padding, 56, 20, 120)}px`,
    '--fd-radius': `${limit(settings.cornerRadius, 28, 0, 64)}px`,
    '--fd-logo': `${limit(settings.logoWidth, 140, 60, 280)}px`,
    '--fd-watermark-opacity': limit(settings.watermarkOpacity, 10, 3, 30) / 100,
    '--fd-overlay': `rgba(${settings.overlayTone === 'light' ? '255,255,255' : '0,0,0'},${limit(settings.overlayOpacity, 65, 0, 95) / 100})`,
    '--fd-image': image ? `url(${JSON.stringify(image)})` : 'none',
  } as CSSProperties;
  return <footer ref={root} className={`footer-design footer-design--${variant}`} style={style} aria-label="Store footer">
    <div className={`footer-design__surface ${image ? 'footer-design__surface--image' : ''}`}>
      {variant === 'large-brand' && <div className="footer-design__watermark" aria-hidden="true">{settings.watermarkText || storeName}</div>}
      <div className="footer-design__grid">
        <section className="footer-design__brand">
          <Link href="/" aria-label={`${storeName} home`} className="footer-design__logo">
            {logo && !logoError ? <img src={logo} alt={storeName} onError={() => setLogoError(true)} /> : <span>{storeName}</span>}
          </Link>
          <p>{settings.bio ?? settings.description ?? customization?.aboutSection?.content ?? ''}</p>
          {!['minimal-brand', 'centered-elegant'].includes(variant) && socialBlock}
        </section>
        {columns.map((column: any, index: number) => settings.mobileAccordion ? <details key={index} className="footer-design__column footer-design__accordion" open onToggle={event => { if (window.matchMedia('(min-width:901px)').matches && !event.currentTarget.open) event.currentTarget.open = true; }}>
          <summary>{column.title || 'Links'}</summary>{renderLinks(column)}
        </details> : <section key={index} className="footer-design__column"><h3>{column.title || 'Links'}</h3>{renderLinks(column)}</section>)}
        {contact}
        {['minimal-brand', 'centered-elegant'].includes(variant) && socialBlock}
      </div>
      <div className="footer-design__bottom">
        <p>{settings.copyright ?? `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</p>
        <nav aria-label="Footer policies">{links.map(link => <Link key={link.path} href={link.path}>{link.label}</Link>)}</nav>
        {settings.showBackToTop !== false && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowUp size={16} />Back to top</button>}
      </div>
      <div className="footer-design__utility">
        {settings.showPaymentIcons !== false && <div className="footer-design__payments" aria-label="Payment methods">
          <span>Visa</span><span>Mastercard</span>{['UPI', 'PhonePe', 'RuPay'].map(name => <img key={name} src={`/${name}.svg`} alt={name} />)}
        </div>}
        <PoweredByEvoc light={isLightColor(text)} />
      </div>
    </div>
  </footer>;
}
