'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FESTIVAL_AREAS, festivalAreaEnabled, festivalColor, festivalImage, festivalIsActive, type FestivalTheme } from '@/lib/festival-theme';
import './FestivalExperience.css';

function timeRemaining(end?: string, now = Date.now()) {
  const seconds = end ? Math.max(0, Math.floor((Date.parse(end) - now) / 1000)) : 0;
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function FestivalExperience({ initialTheme }: { initialTheme?: FestivalTheme | null }) {
  const [theme, setTheme] = useState<FestivalTheme | null>(initialTheme || null);
  const [now, setNow] = useState(() => Date.now());
  const pathname = usePathname();

  useEffect(() => {
    const onPreview = (event: MessageEvent) => {
      if (event.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE' && event.data?.data?.festivalTheme !== undefined) {
        setTheme(event.data.data.festivalTheme);
      }
    };
    window.addEventListener('message', onPreview);
    return () => window.removeEventListener('message', onPreview);
  }, []);

  useEffect(() => {
    if (!theme?.enabled) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [theme?.enabled]);

  const active = festivalIsActive(theme, now);
  useEffect(() => {
    const body = document.body;
    body.dataset.festivalActive = active ? 'true' : 'false';
    for (const area of FESTIVAL_AREAS) body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`] = active && theme && festivalAreaEnabled(theme, area) ? 'true' : 'false';
    if (active && theme) {
      body.style.setProperty('--festival-primary', festivalColor(theme.palette?.primary, '#6b1736'));
      body.style.setProperty('--festival-accent', festivalColor(theme.palette?.accent, '#d6a750'));
      body.style.setProperty('--festival-surface', festivalColor(theme.palette?.surface, '#fff8ef'));
      body.style.setProperty('--festival-text', festivalColor(theme.palette?.text, '#ffffff'));
      body.style.setProperty('--festival-art', `url("${festivalImage(theme.imageUrl, theme.presetId).replace(/["\\]/g, '')}")`);
    }
    return () => {
      delete body.dataset.festivalActive;
      for (const area of FESTIVAL_AREAS) delete body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`];
      for (const key of ['--festival-primary', '--festival-accent', '--festival-surface', '--festival-text', '--festival-art']) body.style.removeProperty(key);
    };
  }, [active, theme]);

  if (!active || !theme) return null;
  const countdown = timeRemaining(theme.endsAt, now);
  const showNote = festivalAreaEnabled(theme, 'cart') && (pathname === '/cart' || pathname?.startsWith('/checkout'));
  const barStyle = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
  } as CSSProperties;
  return (
    <>
      {festivalAreaEnabled(theme, 'announcement') && (
        <div className="festival-offer-bar" role="status" style={barStyle}>
          <span className="festival-offer-bar__spark" aria-hidden="true">✦</span>
          <span>{theme.greeting || `Celebrate ${theme.name || 'the festival'} with us`}</span>
          {theme.offerLabel && theme.couponCode && <strong>{theme.offerLabel} · Use {theme.couponCode}</strong>}
          {countdown && <span className="festival-offer-bar__timer">Ends in {countdown}</span>}
        </div>
      )}
      {showNote && <div className="festival-checkout-note">{theme.greeting || theme.name}{pathname === '/cart' && theme.offerLabel && theme.couponCode ? ` · ${theme.offerLabel} with code ${theme.couponCode}` : ''}</div>}
    </>
  );
}

export function FestivalHero({ theme }: { theme: FestivalTheme }) {
  const image = festivalImage(theme.imageUrl, theme.presetId);
  const link = theme.ctaLink?.startsWith('/') && !theme.ctaLink.startsWith('//') ? theme.ctaLink : '/catalogue';
  const style = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
    backgroundColor: festivalColor(theme.palette?.primary, '#6b1736'),
    backgroundImage: `linear-gradient(90deg, ${festivalColor(theme.palette?.primary, '#6b1736')} 0%, transparent 90%), url("${image.replace(/["\\]/g, '')}")`,
  } as CSSProperties;
  return (
    <section className="festival-hero" style={style} aria-label={`${theme.name || 'Festival'} collection`}>
      <div className="festival-hero__content">
        <span className="festival-hero__eyebrow">A season to celebrate</span>
        <h1>{theme.greeting || `Celebrate ${theme.name || 'the season'}`}</h1>
        {theme.message && <p>{theme.message}</p>}
        {theme.offerLabel && theme.couponCode && <div className="festival-hero__offer">{theme.offerLabel} · Code {theme.couponCode}</div>}
        <Link href={link} className="festival-hero__button">{theme.ctaText || 'Shop the collection'}</Link>
      </div>
    </section>
  );
}
