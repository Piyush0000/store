'use client';

import { useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import {
  festivalAreaEnabled,
  festivalColor,
  festivalImage,
  festivalVisual,
  type FestivalTheme,
} from '@/lib/festival-theme';
import { FestivalEffects } from './FestivalExperience';

const FestivalFlagshipScene = dynamic(() => import('./FestivalFlagshipScene'), { ssr: false });
const FestivalSeasonalScene = dynamic(() => import('./FestivalSeasonalScene'), { ssr: false });
const FestivalCultureScene = dynamic(() => import('./FestivalCultureScene'), { ssr: false });

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FestivalHero({ theme }: { theme: FestivalTheme }) {
  const root = useRef<HTMLElement>(null);
  const visual = festivalVisual(theme);

  useGSAP(() => {
    if (!root.current) return;
    const reduced =
      theme.reducedMotionPreview ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !visual.motion ||
      visual.intensity === 'off' ||
      visual.recipe === 'off';
    if (reduced) return;

    const speed =
      (visual.speed === 'slow' ? 1.25 : visual.speed === 'fast' ? 0.8 : 1) *
      (visual.intensity === 'subtle' ? 1.2 : visual.intensity === 'festive' ? 0.85 : 1);
    const falling = ['petals', 'snow', 'lanterns'].includes(visual.effect);

    const intro = gsap.timeline({
      defaults: { ease: visual.recipe === 'playful' ? 'back.out(1.06)' : 'power3.out' },
    });
    intro
      .from('.festival-hero__content > *', {
        y: visual.recipe === 'playful' ? 24 : 16,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8 * speed,
      })
      .from(
        '.festival-hero__art',
        { scale: 1.06, opacity: 0.7, duration: 1.1 * speed, ease: 'power2.out' },
        '<0.1'
      );

    if (visual.motion && visual.recipe !== 'minimal') {
      gsap.to('.festival-hero__art', {
        yPercent: falling ? 6 : -4,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }
  }, [theme, visual]);

  const presetKey = theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '';
  if (['makar-sankranti', 'diwali'].includes(presetKey)) return <FestivalFlagshipScene theme={theme} />;
  if (['holi', 'christmas'].includes(presetKey)) return <FestivalSeasonalScene theme={theme} />;
  if (['raksha-bandhan', 'ganesh-chaturthi', 'navratri', 'durga-puja', 'dussehra', 'pongal', 'lohri', 'onam', 'baisakhi', 'bihu', 'dhanteras', 'janmashtami', 'ugadi-gudi-padwa', 'eid-al-fitr', 'eid-al-adha', 'ramadan', 'valentines-day', 'new-year', 'mothers-day', 'fathers-day', 'friendship-day', 'childrens-day', 'independence-day', 'republic-day', 'easter'].includes(presetKey)) return <FestivalCultureScene theme={theme} />;

  const image = festivalImage(theme.imageUrl, theme.presetId);
  const requested = theme.ctaLink || '/catalogue';
  const link = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/catalogue';
  const style = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
    '--festival-surface': festivalColor(theme.palette?.surface, '#fff8ef'),
  } as CSSProperties;

  return (
    <section
      ref={root}
      className="festival-hero"
      style={style}
      data-composition={visual.composition}
      data-typography={visual.typography}
      data-effect={visual.effect}
      data-button={visual.buttonStyle}
      aria-label={`${theme.name || 'Festival'} collection`}
    >
      <picture>
        {theme.mobileImageUrl && (
          <source
            media="(max-width: 700px)"
            srcSet={festivalImage(theme.mobileImageUrl, theme.presetId)}
          />
        )}
        <img
          className="festival-hero__art"
          src={image}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="festival-hero__veil" aria-hidden="true" />
      <FestivalEffects visual={visual} />
      <div className="festival-hero__content">
        <span className="festival-hero__eyebrow">
          <span aria-hidden="true">✦</span> {visual.eyebrow || 'A season to celebrate'}
        </span>
        <h1>{theme.greeting || `Celebrate ${theme.name || 'the season'}`}</h1>
        {theme.message && <p>{theme.message}</p>}
        {theme.offerLabel && theme.couponCode && (
          <div className="festival-hero__offer">
            {theme.offerLabel} · Code {theme.couponCode}
          </div>
        )}
        <Link href={link} className="festival-hero__button">
          {theme.ctaText || 'Shop the collection'} <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="festival-hero__edge" aria-hidden="true" />
    </section>
  );
}

export function FestivalCollection({ theme }: { theme: FestivalTheme }) {
  const title = theme.merchandising?.collectionTitle?.trim();
  if (!title || !festivalAreaEnabled(theme, 'collection')) return null;
  const requested = theme.merchandising?.collectionLink || '/catalogue';
  const link = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/catalogue';
  return (
    <section
      className="festival-collection"
      aria-label="Festival collection"
      style={
        {
          '--festival-surface': festivalColor(theme.palette?.surface, '#fff8ef'),
          '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
          '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
          '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
        } as CSSProperties
      }
    >
      <span className="festival-collection__spark" aria-hidden="true">
        ✦
      </span>
      <div>
        <span className="festival-collection__eyebrow">Selected for this celebration</span>
        <h2>{title}</h2>
      </div>
      <Link href={link}>
        Explore collection <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
