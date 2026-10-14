'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { festivalColor, festivalVisual, type FestivalTheme } from '@/lib/festival-theme';
import './FestivalFlagshipScene.css';

gsap.registerPlugin(useGSAP, MotionPathPlugin, DrawSVGPlugin, ScrollTrigger);

export default function FestivalFlagshipScene({ theme }: { theme: FestivalTheme }) {
  const root = useRef<HTMLElement>(null);
  const sceneId = theme.source === 'custom' ? theme.basePresetId : theme.presetId;
  const sankranti = sceneId === 'makar-sankranti';
  const visual = festivalVisual(theme);
  const link = theme.ctaLink?.startsWith('/') && !theme.ctaLink.startsWith('//') ? theme.ctaLink : '/catalogue';
  const style = {
    '--festival-primary': festivalColor(theme.palette?.primary, sankranti ? '#1d4f77' : '#4d092a'),
    '--festival-accent': festivalColor(theme.palette?.accent, sankranti ? '#f7d394' : '#f7c76b'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
  } as CSSProperties;

  useGSAP(() => {
    if (!root.current) return;
    const reduced = theme.reducedMotionPreview || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !visual.motion || visual.intensity === 'off' || visual.recipe === 'off';
    if (reduced) return;
    const speed = (visual.intensity === 'subtle' ? 1.35 : visual.intensity === 'festive' ? .78 : 1) * (visual.speed === 'slow' ? 1.3 : visual.speed === 'fast' ? .8 : 1) * (visual.recipe === 'elegant' ? 1.18 : visual.recipe === 'playful' ? .88 : 1);
    const intro = gsap.timeline({ defaults: { ease: visual.recipe === 'minimal' ? 'power1.out' : visual.recipe === 'playful' ? 'back.out(1.08)' : 'power3.out' } });
    intro.from('.flagship-scene__atmosphere', { opacity: 0, scale: 1.05, duration: 1.15 * speed })
      .from('.flagship-scene__artwork', { opacity: 0, y: 42, scale: .92, duration: 1.1 * speed }, .18)
      .from('.flagship-scene__eyebrow', { opacity: 0, y: 15, duration: .6 * speed }, .32)
      .from('.flagship-scene__title', { opacity: 0, y: 45, duration: .95 * speed }, .43)
      .from('.flagship-scene__copy', { opacity: 0, y: 22, duration: .75 * speed }, .73)
      .from('.flagship-scene__cta', { opacity: 0, y: 16, duration: .65 * speed }, .91);
    const ambient: gsap.core.Animation[] = [];
    if (sankranti && visual.recipe !== 'minimal') {
      const paths = [
        [{ x: -70, y: 58 }, { x: 12, y: -4 }, { x: 80, y: 34 }, { x: 170, y: -42 }],
        [{ x: 60, y: 34 }, { x: -20, y: -36 }, { x: -105, y: 5 }, { x: -150, y: -70 }],
      ];
      root.current.querySelectorAll('.flagship-scene__kite').forEach((kite, index) => {
        ambient.push(gsap.to(kite, { motionPath: { path: paths[index], curviness: 1.3 }, rotation: index ? -9 : 10, duration: (index ? 13 : 11) * speed, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });
    } else if (!sankranti && visual.recipe !== 'minimal') {
      ambient.push(gsap.to('.flagship-scene__flame', { scaleX: .87, scaleY: 1.1, rotation: 2, transformOrigin: '50% 95%', duration: 1.15 * speed, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      intro.from('.flagship-scene__rangoli path', { drawSVG: '0%', stagger: .12, duration: 1.25 * speed, ease: 'power1.inOut' }, .55);
      ambient.push(gsap.to('.flagship-scene__glow', { opacity: .55, scale: 1.08, duration: 2.4 * speed, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    }
    const scroll = visual.recipe === 'minimal' ? null : gsap.to('.flagship-scene__artwork', { yPercent: sankranti ? -8 : -5, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .8 } });
    const visibility = () => ambient.forEach(animation => document.hidden ? animation.pause() : animation.resume());
    const replay = (event: MessageEvent) => { if (event.source === window.parent && event.data?.type === 'ORBIT_FESTIVAL_REPLAY') intro.restart(); };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    window.addEventListener('message', replay);
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('message', replay); scroll?.kill(); ambient.forEach(animation => animation.kill()); };
  }, { scope: root, dependencies: [sceneId, theme.reducedMotionPreview, visual.motion, visual.intensity, visual.recipe, visual.speed], revertOnUpdate: true });

  return <section ref={root} className={`flagship-scene flagship-scene--${sankranti ? 'sankranti' : 'diwali'}`} style={style} data-typography={visual.typography} data-button={visual.buttonStyle} aria-label={`${theme.name || 'Festival'} collection`}>
    {sankranti ? <div className="flagship-scene__atmosphere flagship-scene__sky" aria-hidden="true"><span className="flagship-scene__sun"/><span className="flagship-scene__cloud flagship-scene__cloud--one"/><span className="flagship-scene__cloud flagship-scene__cloud--two"/><span className="flagship-scene__rooftops"/></div> : <div className="flagship-scene__atmosphere flagship-scene__night" aria-hidden="true"><span className="flagship-scene__glow"/><span className="flagship-scene__arch"/><span className="flagship-scene__stars"/></div>}
    {theme.imageUrl && !theme.imageUrl.startsWith('/festivals/') && <img className="flagship-scene__merchant-art" src={theme.imageUrl} alt="" decoding="async" />}
    <div className="flagship-scene__artwork" aria-hidden="true">
      {sankranti ? <><img className="flagship-scene__kite flagship-scene__kite--near" src="/festivals/flagships/sankranti-kite.svg" alt=""/><img className="flagship-scene__kite flagship-scene__kite--far" src="/festivals/flagships/sankranti-kite.svg" alt=""/><span className="flagship-scene__wind flagship-scene__wind--one"/><span className="flagship-scene__wind flagship-scene__wind--two"/></> : <><span className="flagship-scene__flame"><img src="/festivals/flagships/diwali-diya.svg" alt=""/></span><svg className="flagship-scene__rangoli" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" strokeWidth="1.8"><path d="M180 22C219 93 267 93 338 180c-71 39-71 87-158 158-39-71-87-71-158-158 71-39 71-87 158-158Z"/><path d="M180 55c29 52 73 66 125 125-52 29-66 73-125 125-29-52-73-66-125-125 52-29 66-73 125-125Z"/><path d="M180 86c20 37 57 73 94 94-37 20-73 57-94 94-20-37-57-73-94-94 37-20 73-57 94-94Z"/><path d="M180 120c20 32 40 40 60 60-20 20-40 28-60 60-20-32-40-40-60-60 20-20 40-28 60-60Z"/><circle cx="180" cy="180" r="19"/><circle cx="180" cy="180" r="153" strokeDasharray="2 11"/></g></svg></>}
    </div>
    <div className="flagship-scene__content"><span className="flagship-scene__eyebrow">{visual.eyebrow}</span><h1 className="flagship-scene__title">{theme.greeting || (sankranti ? 'Let the celebrations soar' : 'A brighter Diwali begins here')}</h1><p className="flagship-scene__copy">{theme.message}</p>{theme.offerLabel && theme.couponCode && <span className="flagship-scene__offer">{theme.offerLabel} · {theme.couponCode}</span>}<Link className="flagship-scene__cta" href={link}>{theme.ctaText || 'Shop the collection'} <span aria-hidden="true">↗</span></Link></div>
    <span className="flagship-scene__caption" aria-hidden="true">{sankranti ? 'The sky is yours' : 'A season of light'}</span>
  </section>;
}
