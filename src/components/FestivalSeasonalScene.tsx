'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { festivalColor, festivalVisual, type FestivalTheme } from '@/lib/festival-theme';
import './FestivalSeasonalScene.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function FestivalSeasonalScene({ theme }: { theme: FestivalTheme }) {
  const root = useRef<HTMLElement>(null);
  const sceneId = theme.source === 'custom' ? theme.basePresetId : theme.presetId;
  const holi = sceneId === 'holi';
  const visual = festivalVisual(theme);
  const link = theme.ctaLink?.startsWith('/') && !theme.ctaLink.startsWith('//') ? theme.ctaLink : '/catalogue';
  const legacyHoliPalette = holi && theme.palette?.primary?.toLowerCase() === '#44307b' && theme.palette?.text?.toLowerCase() === '#ffffff';
  const style = {
    '--festival-primary': legacyHoliPalette ? '#fff8f0' : festivalColor(theme.palette?.primary, holi ? '#fff8f0' : '#123b34'),
    '--festival-accent': festivalColor(theme.palette?.accent, holi ? '#f46f79' : '#eac582'),
    '--festival-text': festivalColor(theme.palette?.text, holi ? '#302049' : '#fffaf0'),
    '--seasonal-ink': legacyHoliPalette ? '#302049' : festivalColor(theme.palette?.text, '#302049'),
    '--seasonal-action': legacyHoliPalette ? '#44307b' : festivalColor(theme.palette?.accent, '#612d72'),
  } as CSSProperties;

  useGSAP(() => {
    if (!root.current) return;
    const reduced = theme.reducedMotionPreview || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !visual.motion || visual.intensity === 'off' || visual.recipe === 'off';
    if (reduced) return;
    const speed = (visual.speed === 'slow' ? 1.3 : visual.speed === 'fast' ? .8 : 1) *
      (visual.intensity === 'subtle' ? 1.25 : visual.intensity === 'festive' ? .85 : 1);
    const intro = gsap.timeline({ defaults: { ease: visual.recipe === 'playful' ? 'back.out(1.05)' : 'power3.out' } });
    intro.from('.seasonal-scene__frame', { opacity: 0, scale: .98, duration: .85 * speed })
      .from('.seasonal-scene__eyebrow', { opacity: 0, y: 20, duration: .5 * speed }, .24)
      .from('.seasonal-scene__title', { opacity: 0, y: 48, duration: .95 * speed }, .36)
      .from('.seasonal-scene__copy', { opacity: 0, y: 22, duration: .65 * speed }, .68)
      .from('.seasonal-scene__cta', { opacity: 0, y: 16, duration: .6 * speed }, .9);
    const ambient: gsap.core.Animation[] = [];
    if (holi) {
      intro.from('.seasonal-scene__powder', { scale: .08, opacity: 0, rotation: -25, stagger: .18, duration: 1.1 * speed, ease: 'power2.out' }, .1);
      if (visual.recipe !== 'minimal') ambient.push(gsap.to('.seasonal-scene__powder', {
        y: (index: number) => index % 2 ? -16 : 16, rotation: (index: number) => index % 2 ? -5 : 5,
        duration: 4 * speed, stagger: .35, repeat: -1, yoyo: true, ease: 'sine.inOut',
      }));
    } else {
      intro.from('.seasonal-scene__ornament', { opacity: 0, y: -65, stagger: .18, duration: .9 * speed }, .18)
        .from('.seasonal-scene__branch', { opacity: 0, y: -24, duration: .9 * speed }, .04);
      if (visual.recipe !== 'minimal') ambient.push(gsap.to('.seasonal-scene__ornament', {
        rotation: (index: number) => index % 2 ? -5 : 5, transformOrigin: '50% 0%',
        duration: 3.5 * speed, stagger: .3, repeat: -1, yoyo: true, ease: 'sine.inOut',
      }));
    }
    if (visual.recipe !== 'minimal') gsap.to('.seasonal-scene__art', {
      yPercent: holi ? -7 : -4, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .7 },
    });
    const visibility = () => ambient.forEach(animation => document.hidden ? animation.pause() : animation.resume());
    const replay = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === 'ORBIT_FESTIVAL_REPLAY') intro.restart();
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    window.addEventListener('message', replay);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('message', replay);
      ambient.forEach(animation => animation.kill());
    };
  }, { scope: root, dependencies: [sceneId, theme.reducedMotionPreview, visual.motion, visual.intensity, visual.recipe, visual.speed], revertOnUpdate: true });

  return <section ref={root} className={`seasonal-scene seasonal-scene--${holi ? 'holi' : 'christmas'}`} style={style}
    data-typography={visual.typography} data-button={visual.buttonStyle} aria-label={`${theme.name || 'Festival'} collection`}>
    <div className="seasonal-scene__frame" aria-hidden="true" />
    <div className="seasonal-scene__art" aria-hidden="true">
      {holi ? <>
        <span className="seasonal-scene__powder seasonal-scene__powder--pink" />
        <span className="seasonal-scene__powder seasonal-scene__powder--blue" />
        <span className="seasonal-scene__powder seasonal-scene__powder--yellow" />
        <span className="seasonal-scene__powder seasonal-scene__powder--green" />
        <span className="seasonal-scene__ring seasonal-scene__ring--one" />
        <span className="seasonal-scene__ring seasonal-scene__ring--two" />
      </> : <>
        <svg className="seasonal-scene__branch" viewBox="0 0 640 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M600 0C480 170 325 265 35 400" stroke="#c49a55" strokeWidth="8" strokeLinecap="round"/>
          {Array.from({ length: 12 }, (_, index) => {
            const x = 595 - index * 42;
            const y = 13 + index * 27;
            return <g key={index} stroke={index % 2 ? '#4f8972' : '#7bb393'} strokeWidth="4" strokeLinecap="round">
              <path d={`M${x} ${y}l-20 -65M${x} ${y}l-48 -50M${x} ${y}l-65 -27M${x} ${y}l4 60M${x} ${y}l-28 67M${x} ${y}l-48 50`}/>
            </g>;
          })}
        </svg>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--one"><span /></span>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--two"><span /></span>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--three"><span /></span>
        <span className="seasonal-scene__star seasonal-scene__star--one">✦</span>
        <span className="seasonal-scene__star seasonal-scene__star--two">✧</span>
      </>}
      {theme.imageUrl && !theme.imageUrl.startsWith('/festivals/') &&
        <img className="seasonal-scene__merchant-art" src={theme.imageUrl} alt="" decoding="async" />}
    </div>
    <div className="seasonal-scene__content">
      <span className="seasonal-scene__eyebrow">{visual.eyebrow}</span>
      <h1 className="seasonal-scene__title">{theme.greeting || (holi ? 'Colour your world with joy' : 'Gather in the glow of the season')}</h1>
      {theme.message && <p className="seasonal-scene__copy">{theme.message}</p>}
      {theme.offerLabel && theme.couponCode && <span className="seasonal-scene__offer">{theme.offerLabel} · {theme.couponCode}</span>}
      <Link className="seasonal-scene__cta" href={link}>{theme.ctaText || 'Shop the collection'} <span aria-hidden="true">↗</span></Link>
    </div>
    <span className="seasonal-scene__footnote" aria-hidden="true">{holi ? 'A celebration in full colour' : 'A little magic in every moment'}</span>
  </section>;
}
