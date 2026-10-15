'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FESTIVAL_AREAS, festivalAreaEnabled, festivalColor, festivalImage, festivalIsActive, festivalVisual, type FestivalEffect, type FestivalTheme, type FestivalVisual } from '@/lib/festival-theme';
import './FestivalExperience.css';
import './FestivalCustomStorefront.css';
import './DiwaliStorefront.css';
import './FestivalRegionalStorefront.css';
import './FestivalHarvestStorefront.css';
import './FestivalGlobalPersonalStorefront.css';
import './FestivalNationalDaysStorefront.css';
import './FestivalSpringRegionalStorefront.css';
import './FestivalCampaignStorefront.css';

const FestivalFlagshipScene = dynamic(() => import('./FestivalFlagshipScene'), { ssr: false });
const FestivalSeasonalScene = dynamic(() => import('./FestivalSeasonalScene'), { ssr: false });
const FestivalCultureScene = dynamic(() => import('./FestivalCultureScene'), { ssr: false });
gsap.registerPlugin(useGSAP, ScrollTrigger);

function remaining(end: string | undefined, now: number) {
  if (!end) return '';
  const seconds = Math.max(0, Math.floor((Date.parse(end) - now) / 1000));
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const days = Math.floor(seconds / 86400);
  return `${days ? `${days}d ` : ''}${String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const EFFECT_GLYPHS: Partial<Record<FestivalEffect, string>> = {
  snow:'✳', stars:'✦', glimmer:'✧', hearts:'♥', petals:'✿', lights:'•', embers:'•', sunlight:'✧', color:'•', lanterns:'✧', kites:'◇', ribbons:'', threads:'',
};

export function FestivalEffects({ visual, ambient = false }: { visual: FestivalVisual; ambient?: boolean }) {
  if (!visual.decorations || visual.intensity === 'off') return null;
  const count = ambient ? (visual.intensity === 'festive' ? 8 : 5) : visual.intensity === 'subtle' ? 5 : visual.intensity === 'festive' ? 13 : 9;
  const speed = visual.speed === 'slow' ? 1.3 : visual.speed === 'fast' ? .8 : 1;
  return <div className={`festival-effects festival-effects--${visual.effect} ${ambient ? 'festival-effects--ambient' : ''} ${visual.motion && visual.recipe !== 'off' && visual.recipe !== 'minimal' ? '' : 'festival-effects--static'}`} aria-hidden="true">
    {Array.from({ length:count }, (_, index) => <span key={index} className="festival-effects__piece" style={{ '--piece-index':index, animationDuration:`${(10 + index * 1.7) * speed}s` } as CSSProperties}>{EFFECT_GLYPHS[visual.effect]}</span>)}
  </div>;
}

export default function FestivalExperience({ initialTheme }: { initialTheme?: FestivalTheme | null }) {
  const [theme, setTheme] = useState<FestivalTheme | null>(initialTheme || null);
  const [now, setNow] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onPreview = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE' && event.data?.data?.festivalTheme !== undefined) {
        setTheme(event.data.data.festivalTheme);
      }
    };
    window.addEventListener('message', onPreview);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ORBIT_STOREFRONT_PREVIEW_READY' }, '*');
    }
    return () => window.removeEventListener('message', onPreview);
  }, []);

  useEffect(() => {
    setNow(Date.now());
    if (!theme?.enabled) return;
    const tick = () => setNow(Date.now());
    const visibility = () => { document.body.dataset.festivalPaused = document.hidden ? 'true' : 'false'; tick(); };
    const interval = window.setInterval(() => { if (!document.hidden) tick(); }, 1000);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', visibility); delete document.body.dataset.festivalPaused; };
  }, [theme?.enabled]);

  const active = festivalIsActive(theme, now ?? Date.now());
  useEffect(() => {
    const body = document.body;
    body.dataset.festivalActive = active ? 'true' : 'false';
    body.dataset.festivalSource = active && theme ? theme.source || 'predefined' : '';
    body.dataset.festivalPreset = active && theme
      ? (theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '')
      : '';
    for (const area of FESTIVAL_AREAS) body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`] = active && theme && festivalAreaEnabled(theme, area) ? 'true' : 'false';
    if (active && theme) {
      const visual = festivalVisual(theme);
      body.dataset.festivalEffect = visual.effect;
      body.dataset.festivalIntensity = visual.intensity;
      body.dataset.festivalReduced = theme.reducedMotionPreview ? 'true' : 'false';
      const badge = theme.merchandising?.badgeText?.trim();
      body.dataset.festivalBadge = badge && festivalAreaEnabled(theme, 'products') ? 'true' : 'false';
      if (badge) body.style.setProperty('--festival-badge', `"${badge.replace(/["\\\n\r]/g, '')}"`);
      body.style.setProperty('--festival-primary', festivalColor(theme.palette?.primary, '#6b1736'));
      body.style.setProperty('--festival-accent', festivalColor(theme.palette?.accent, '#d6a750'));
      body.style.setProperty('--festival-surface', festivalColor(theme.palette?.surface, '#fff8ef'));
      body.style.setProperty('--festival-text', festivalColor(theme.palette?.text, '#ffffff'));
      body.style.setProperty('--festival-art', `url("${festivalImage(theme.imageUrl, theme.presetId).replace(/["\\]/g, '')}")`);
    }
    return () => {
      for (const key of ['festivalActive', 'festivalSource', 'festivalPreset', 'festivalEffect', 'festivalIntensity', 'festivalReduced', 'festivalBadge']) delete body.dataset[key];
      for (const area of FESTIVAL_AREAS) delete body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`];
      for (const key of ['--festival-primary', '--festival-accent', '--festival-surface', '--festival-text', '--festival-art', '--festival-badge']) body.style.removeProperty(key);
    };
  }, [active, theme]);

  if (!active || !theme) return null;
  const countdown = now === null ? '' : remaining(theme.endsAt, now);
  const showNote = festivalAreaEnabled(theme, 'cart') && (pathname === '/cart' || pathname?.startsWith('/checkout'));
  const barStyle = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
  } as CSSProperties;
  return <>
    {festivalVisual(theme).decorations && festivalVisual(theme).intensity !== 'off' && <FestivalEffects visual={festivalVisual(theme)} ambient />}
    {festivalAreaEnabled(theme, 'announcement') && <div className="festival-offer-bar" style={barStyle}>
      <span className="festival-offer-bar__spark" aria-hidden="true">✦</span>
      <span>{theme.greeting || `Celebrate ${theme.name || 'the festival'} with us`}</span>
      {theme.offerLabel && theme.couponCode && <strong>{theme.offerLabel} · Use {theme.couponCode}</strong>}
      {countdown && <span key={countdown} className="festival-offer-bar__timer" aria-label={`Sale ends in ${countdown}`}>Ends in {countdown}</span>}
    </div>}
    {showNote && <div className="festival-checkout-note">{theme.greeting || theme.name}{pathname === '/cart' && theme.offerLabel && theme.couponCode ? ` · ${theme.offerLabel} with code ${theme.couponCode}` : ''}</div>}
  </>;
}

export function FestivalHero({ theme }: { theme: FestivalTheme }) {
  const root = useRef<HTMLElement>(null);
  const visual = festivalVisual(theme);
  useGSAP(() => {
    if (!root.current) return;
    const reduced = theme.reducedMotionPreview || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !visual.motion || visual.intensity === 'off' || visual.recipe === 'off';
    if (reduced) return;
    const speed = (visual.speed === 'slow' ? 1.25 : visual.speed === 'fast' ? .8 : 1) *
      (visual.intensity === 'subtle' ? 1.2 : visual.intensity === 'festive' ? .85 : 1);
    const falling = ['petals', 'snow', 'lanterns'].includes(visual.effect);
    const sweeping = ['threads', 'ribbons', 'sunlight'].includes(visual.effect);
    const intro = gsap.timeline({ defaults: { ease: visual.recipe === 'playful' ? 'back.out(1.06)' : 'power3.out' } });
    intro.from('.festival-hero__art', {
      opacity: 0, x: sweeping ? -55 : 0, y: falling ? -45 : 20,
      scale: sweeping ? 1.05 : .96, rotation: sweeping ? -3 : 0, duration: 1.05 * speed,
    }).from('.festival-hero__content > *', { opacity: 0, y: 25, stagger: .11 * speed, duration: .6 * speed }, .25);
    if (visual.recipe !== 'minimal') {
      gsap.to('.festival-hero__art', {
        yPercent: falling ? -9 : -5, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .7 },
      });
      if (root.current.querySelector('.festival-effects__piece')) {
        intro.from('.festival-effects__piece', { opacity: 0, y: falling ? -28 : 18, stagger: .045 * speed, duration: .5 * speed }, .35);
      }
    }
    const replay = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === 'ORBIT_FESTIVAL_REPLAY') intro.restart();
    };
    window.addEventListener('message', replay);
    return () => window.removeEventListener('message', replay);
  }, { scope: root, dependencies: [theme.presetId, theme.basePresetId, theme.reducedMotionPreview, visual.effect, visual.intensity, visual.motion, visual.recipe, visual.speed], revertOnUpdate: true });
  if (['makar-sankranti', 'diwali'].includes(theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '')) return <FestivalFlagshipScene theme={theme} />;
  if (['holi', 'christmas'].includes(theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '')) return <FestivalSeasonalScene theme={theme} />;
  if (['raksha-bandhan', 'ganesh-chaturthi', 'navratri', 'durga-puja', 'dussehra', 'pongal', 'lohri', 'onam', 'baisakhi', 'bihu', 'dhanteras', 'janmashtami', 'ugadi-gudi-padwa', 'eid-al-fitr', 'eid-al-adha', 'ramadan', 'valentines-day', 'new-year', 'mothers-day', 'fathers-day', 'friendship-day', 'childrens-day', 'independence-day', 'republic-day', 'easter'].includes(theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '')) return <FestivalCultureScene theme={theme} />;
  const image = festivalImage(theme.imageUrl, theme.presetId);
  const link = theme.ctaLink?.startsWith('/') && !theme.ctaLink.startsWith('//') ? theme.ctaLink : '/catalogue';
  const style = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
    '--festival-surface': festivalColor(theme.palette?.surface, '#fff8ef'),
  } as CSSProperties;
  return <section ref={root} className="festival-hero" style={style} data-composition={visual.composition} data-typography={visual.typography} data-effect={visual.effect} data-button={visual.buttonStyle} aria-label={`${theme.name || 'Festival'} collection`}>
    <picture>{theme.mobileImageUrl && <source media="(max-width: 700px)" srcSet={festivalImage(theme.mobileImageUrl, theme.presetId)} />}<img className="festival-hero__art" src={image} alt="" fetchPriority="high" decoding="async" /></picture>
    <div className="festival-hero__veil" aria-hidden="true" />
    <FestivalEffects visual={visual} />
    <div className="festival-hero__content">
      <span className="festival-hero__eyebrow"><span aria-hidden="true">✦</span> {visual.eyebrow || 'A season to celebrate'}</span>
      <h1>{theme.greeting || `Celebrate ${theme.name || 'the season'}`}</h1>
      {theme.message && <p>{theme.message}</p>}
      {theme.offerLabel && theme.couponCode && <div className="festival-hero__offer">{theme.offerLabel} · Code {theme.couponCode}</div>}
      <Link href={link} className="festival-hero__button">{theme.ctaText || 'Shop the collection'} <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="festival-hero__edge" aria-hidden="true" />
  </section>;
}

export function FestivalCollection({ theme }: { theme: FestivalTheme }) {
  const title = theme.merchandising?.collectionTitle?.trim();
  if (!title || !festivalAreaEnabled(theme, 'collection')) return null;
  const requested = theme.merchandising?.collectionLink || '/catalogue';
  const link = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/catalogue';
  return <section className="festival-collection" aria-label="Festival collection" style={{ '--festival-surface':festivalColor(theme.palette?.surface, '#fff8ef'), '--festival-primary':festivalColor(theme.palette?.primary, '#6b1736'), '--festival-accent':festivalColor(theme.palette?.accent, '#d6a750'), '--festival-text':festivalColor(theme.palette?.text, '#ffffff') } as CSSProperties}>
    <span className="festival-collection__spark" aria-hidden="true">✦</span>
    <div><span className="festival-collection__eyebrow">Selected for this celebration</span><h2>{title}</h2></div>
    <Link href={link}>Explore collection <span aria-hidden="true">↗</span></Link>
  </section>;
}
