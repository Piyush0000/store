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
        .from('.seasonal-scene__tree', { opacity: 0, y: 24, scale: .94, transformOrigin: '50% 100%', duration: 1.1 * speed }, .04)
        .from('.seasonal-scene__gift', { opacity: 0, y: 18, stagger: .12, duration: .55 * speed }, .72);
      if (visual.recipe !== 'minimal') ambient.push(gsap.to('.seasonal-scene__ornament, .seasonal-scene__tree-light', {
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
        <svg className="seasonal-scene__pichkari" viewBox="0 0 640 360" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="pichkari-body" x1="210" y1="120" x2="482" y2="225" gradientUnits="userSpaceOnUse"><stop stopColor="#fff0c2"/><stop offset=".32" stopColor="#e6b85f"/><stop offset=".67" stopColor="#d56883"/><stop offset="1" stopColor="#7e3d77"/></linearGradient></defs>
          <g transform="rotate(-18 370 180)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M212 147h263c15 0 27 12 27 27v26c0 15-12 27-27 27H212c-13 0-23-10-23-23v-34c0-13 10-23 23-23Z" fill="url(#pichkari-body)" stroke="#fff0c6" strokeWidth="5"/>
            <path d="M236 160v53m23-53v53m174-53v53m25-53v53" stroke="#fff0ce" strokeOpacity=".7" strokeWidth="4"/>
            <path d="M475 164h54v46h-54" fill="#f0c768" stroke="#fff0c6" strokeWidth="5"/>
            <path d="M529 174h39v26h-39" fill="#84c4d1" stroke="#fff0c6" strokeWidth="4"/>
            <path d="M281 223v45h35v-24c0-13 10-23 23-23" fill="#e76b91" stroke="#fff0c6" strokeWidth="5"/>
            <path d="M205 161h-44v51h44" fill="#b65b8a" stroke="#fff0c6" strokeWidth="4"/>
            <path d="M163 171h-23m23 31h-23" stroke="#fff0c6" strokeWidth="4"/>
            <circle cx="568" cy="187" r="7" fill="#f6d26f" stroke="#fff0c6" strokeWidth="3"/>
          </g>
          <g fill="#fff0ce"><circle cx="106" cy="86" r="5"/><circle cx="128" cy="119" r="3"/><circle cx="84" cy="153" r="4"/><circle cx="163" cy="83" r="3"/><circle cx="116" cy="207" r="5"/><circle cx="74" cy="237" r="3"/><circle cx="153" cy="271" r="4"/></g>
          <path d="m104 73 7-17m55 56 18-4M79 153l-19 5m57 70 7 17m31 36 17 13" stroke="#fff0ce" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </> : <>
        <div className="seasonal-scene__window" />
        <svg className="seasonal-scene__tree" viewBox="0 0 640 720" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tree-bough" x1="320" y1="95" x2="320" y2="620" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3a9a68"/><stop offset=".48" stopColor="#176342"/><stop offset="1" stopColor="#0b3c31"/>
            </linearGradient>
            <linearGradient id="tree-trunk" x1="320" y1="510" x2="320" y2="650" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9a6845"/><stop offset="1" stopColor="#55382e"/>
            </linearGradient>
            <radialGradient id="tree-halo"><stop stopColor="#ffe2a0" stopOpacity=".52"/><stop offset="1" stopColor="#ffe2a0" stopOpacity="0"/></radialGradient>
            <filter id="tree-soft-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12"/></filter>
          </defs>
          <ellipse cx="320" cy="390" rx="260" ry="290" fill="url(#tree-halo)"/>
          <path d="M320 106c-17 27-42 48-76 69 24 5 43 2 61-7-17 25-47 43-89 57 35 7 67-1 94-19-13 25-33 44-60 58 35 1 59-8 70-21 11 13 35 22 70 21-27-14-47-33-60-58 27 18 59 26 94 19-42-14-72-32-89-57 18 9 37 12 61 7-34-21-59-42-76-69Z" fill="#164f3c" stroke="#7cae83" strokeOpacity=".7" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M320 167c-22 34-58 63-108 87 34 6 63 2 88-13-22 31-63 55-121 74 49 9 94-2 132-28-18 35-46 62-83 80 48 2 80-11 92-29 12 18 44 31 92 29-37-18-65-45-83-80 38 26 83 37 132 28-58-19-99-43-121-74 25 15 54 19 88 13-50-24-86-53-108-87Z" fill="url(#tree-bough)" stroke="#86b78a" strokeOpacity=".72" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M320 254c-29 41-77 76-145 103 47 8 86 2 121-18-31 43-86 75-165 101 67 12 128-3 180-38-24 48-63 84-113 109 65 3 109-15 122-40 13 25 57 43 122 40-50-25-89-61-113-109 52 35 113 50 180 38-79-26-134-58-165-101 35 20 74 26 121 18-68-27-116-62-145-103Z" fill="#1d714d" stroke="#a0c58c" strokeOpacity=".74" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M320 355c-37 43-97 79-178 107 57 10 105 3 147-22-37 44-101 77-191 104 76 13 146-4 205-43-27 47-70 83-125 108 73 3 122-15 142-43 20 28 69 46 142 43-55-25-98-61-125-108 59 39 129 56 205 43-90-27-154-60-191-104 42 25 90 32 147 22-81-28-141-64-178-107Z" fill="#125d44" stroke="#82b18a" strokeOpacity=".76" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M249 183c20 0 36-5 48-15m-84 61c30 1 55-5 75-19m-103 74c39 2 70-6 94-24m-123 91c47 3 87-7 119-30m-145 106c54 3 101-9 138-36m-87 104c53 2 94-8 124-25m160-287c-20 0-36-5-48-15m84 61c-30 1-55-5-75-19m103 74c-39 2-70-6-94-24m123 91c-47 3-87-7-119-30m145 106c-54 3-101-9-138-36m87 104c-53 2-94-8-124-25" stroke="#a5ca92" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round"/>
          <path d="M300 509h40v106h-40z" fill="url(#tree-trunk)"/>
          <path d="M218 250c50 36 155 38 204-2m-250 89c60 46 173 48 236-1m-283 99c71 55 211 58 290-2" stroke="#f2cd7b" strokeOpacity=".85" strokeWidth="4" strokeLinecap="round"/>
          <path d="M320 43 331 73l32 2-25 20 9 31-27-18-27 18 9-31-25-20 32-2 11-30Z" fill="#ffe08b" stroke="#fff4cb" strokeWidth="3"/>
          <path d="M320 51 327 72l22 1-17 13 6 21-18-12-18 12 6-21-17-13 22-1 7-21Z" fill="#fff7da" opacity=".9"/>
          <g className="seasonal-scene__tree-light" filter="url(#tree-soft-glow)" fill="#ffe2a0" opacity=".68">
            <circle cx="268" cy="234" r="11"/><circle cx="365" cy="270" r="9"/><circle cx="230" cy="341" r="10"/><circle cx="397" cy="367" r="11"/><circle cx="205" cy="455" r="10"/><circle cx="433" cy="460" r="9"/><circle cx="277" cy="496" r="9"/><circle cx="359" cy="418" r="9"/>
          </g>
          <g stroke="#f4d58c" strokeWidth="2">
            <path d="M268 234v17m97 19v20m-135 51v21m167 5v20m-192 68v20m188-15v20m-84-1v18m51-96v18"/>
          </g>
          <g>
            <circle cx="268" cy="254" r="13" fill="#bb4c4d" stroke="#ffe8a9" strokeWidth="3"/><circle cx="365" cy="293" r="12" fill="#d9aa4c" stroke="#fff0bb" strokeWidth="3"/>
            <circle cx="230" cy="372" r="13" fill="#d9aa4c" stroke="#fff0bb" strokeWidth="3"/><circle cx="397" cy="406" r="14" fill="#bd5150" stroke="#ffe8a9" strokeWidth="3"/>
            <circle cx="205" cy="475" r="13" fill="#8db4a1" stroke="#fff0bb" strokeWidth="3"/><circle cx="433" cy="480" r="12" fill="#d9aa4c" stroke="#fff0bb" strokeWidth="3"/>
            <circle cx="277" cy="514" r="12" fill="#bd5150" stroke="#ffe8a9" strokeWidth="3"/><circle cx="359" cy="436" r="12" fill="#8db4a1" stroke="#fff0bb" strokeWidth="3"/>
          </g>
        </svg>
        <span className="seasonal-scene__gift seasonal-scene__gift--one" aria-hidden="true"><i /></span>
        <span className="seasonal-scene__gift seasonal-scene__gift--two" aria-hidden="true"><i /></span>
        <span className="seasonal-scene__gift seasonal-scene__gift--three" aria-hidden="true"><i /></span>
        <span className="seasonal-scene__wreath" aria-hidden="true"><i /><b /><em /></span>
        <span className="seasonal-scene__garland" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--one"><span /></span>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--two"><span /></span>
        <span className="seasonal-scene__ornament seasonal-scene__ornament--three"><span /></span>
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
