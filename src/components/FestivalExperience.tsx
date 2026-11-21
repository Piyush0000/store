'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import {
  FESTIVAL_AREAS,
  festivalAreaEnabled,
  festivalColor,
  festivalImage,
  festivalIsActive,
  festivalVisual,
  type FestivalEffect,
  type FestivalTheme,
  type FestivalVisual,
} from '@/lib/festival-theme';
import './FestivalExperience.css';
import { FestivalThemeStyles } from './FestivalThemeStyles';

// Re-export for any modules importing from FestivalExperience
export { FestivalHero, FestivalCollection } from './FestivalHero';

function remaining(end: string | undefined, now: number) {
  if (!end) return '';
  const seconds = Math.max(0, Math.floor((Date.parse(end) - now) / 1000));
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const days = Math.floor(seconds / 86400);
  return `${days ? `${days}d ` : ''}${String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const EFFECT_GLYPHS: Partial<Record<FestivalEffect, string>> = {
  snow: '✳',
  stars: '✦',
  glimmer: '✧',
  hearts: '♥',
  petals: '✿',
  lights: '•',
  embers: '•',
  sunlight: '✧',
  color: '•',
  lanterns: '✧',
  kites: '◇',
  ribbons: '',
  threads: '',
};

export function FestivalEffects({
  visual,
  ambient = false,
}: {
  visual: FestivalVisual;
  ambient?: boolean;
}) {
  if (!visual.decorations || visual.intensity === 'off') return null;
  const count = ambient
    ? visual.intensity === 'festive'
      ? 8
      : 5
    : visual.intensity === 'subtle'
      ? 5
      : visual.intensity === 'festive'
        ? 13
        : 9;
  const speed = visual.speed === 'slow' ? 1.3 : visual.speed === 'fast' ? 0.8 : 1;
  return (
    <div
      className={`festival-effects festival-effects--${visual.effect} ${ambient ? 'festival-effects--ambient' : ''} ${visual.motion && visual.recipe !== 'off' && visual.recipe !== 'minimal' ? '' : 'festival-effects--static'}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="festival-effects__piece"
          style={
            {
              '--piece-index': index,
              animationDuration: `${(10 + index * 1.7) * speed}s`,
            } as CSSProperties
          }
        >
          {EFFECT_GLYPHS[visual.effect]}
        </span>
      ))}
    </div>
  );
}

// Leaf component: Isolated timer that only re-renders itself, not the whole layout tree
function FestivalCountdownTimer({ endsAt }: { endsAt?: string }) {
  const [timeLeft, setTimeLeft] = useState(() => (endsAt ? remaining(endsAt, Date.now()) : ''));

  useEffect(() => {
    if (!endsAt) return;
    const update = () => {
      if (!document.hidden) {
        setTimeLeft(remaining(endsAt, Date.now()));
      }
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) return null;
  return (
    <span className="festival-offer-bar__timer" aria-label={`Sale ends in ${timeLeft}`}>
      Ends in {timeLeft}
    </span>
  );
}

export default function FestivalExperience({
  initialTheme,
}: {
  initialTheme?: FestivalTheme | null;
}) {
  const [theme, setTheme] = useState<FestivalTheme | null>(initialTheme || null);
  const [active, setActive] = useState(() => festivalIsActive(initialTheme));
  const pathname = usePathname();

  useEffect(() => {
    const onPreview = (event: MessageEvent) => {
      if (
        event.source === window.parent &&
        event.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE' &&
        event.data?.data?.festivalTheme !== undefined
      ) {
        setTheme(event.data.data.festivalTheme);
      }
    };
    window.addEventListener('message', onPreview);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ORBIT_STOREFRONT_PREVIEW_READY' }, '*');
    }
    return () => window.removeEventListener('message', onPreview);
  }, []);

  // Update active state when theme changes or when boundary times (startsAt/endsAt) arrive
  useEffect(() => {
    const isNowActive = festivalIsActive(theme);
    setActive(isNowActive);
    if (!theme?.enabled) return;

    const now = Date.now();
    const start = theme.startsAt ? Date.parse(theme.startsAt) : NaN;
    const end = theme.endsAt ? Date.parse(theme.endsAt) : NaN;

    const timers: number[] = [];
    if (Number.isFinite(start) && start > now) {
      timers.push(window.setTimeout(() => setActive(festivalIsActive(theme)), start - now));
    }
    if (Number.isFinite(end) && end > now) {
      timers.push(window.setTimeout(() => setActive(festivalIsActive(theme)), end - now));
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.dataset.festivalActive = active ? 'true' : 'false';
    body.dataset.festivalSource = active && theme ? theme.source || 'predefined' : '';
    body.dataset.festivalPreset =
      active && theme
        ? theme.source === 'custom'
          ? theme.basePresetId || ''
          : theme.presetId || ''
        : '';
    for (const area of FESTIVAL_AREAS) {
      body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`] =
        active && theme && festivalAreaEnabled(theme, area) ? 'true' : 'false';
    }
    if (active && theme) {
      const visual = festivalVisual(theme);
      body.dataset.festivalEffect = visual.effect;
      body.dataset.festivalIntensity = visual.intensity;
      body.dataset.festivalReduced = theme.reducedMotionPreview ? 'true' : 'false';
      const badge = theme.merchandising?.badgeText?.trim();
      body.dataset.festivalBadge =
        badge && festivalAreaEnabled(theme, 'products') ? 'true' : 'false';
      if (badge) body.style.setProperty('--festival-badge', `"${badge.replace(/["\\\n\r]/g, '')}"`);
      body.style.setProperty('--festival-primary', festivalColor(theme.palette?.primary, '#6b1736'));
      body.style.setProperty('--festival-accent', festivalColor(theme.palette?.accent, '#d6a750'));
      body.style.setProperty('--festival-surface', festivalColor(theme.palette?.surface, '#fff8ef'));
      body.style.setProperty('--festival-text', festivalColor(theme.palette?.text, '#ffffff'));
      body.style.setProperty(
        '--festival-art',
        `url("${festivalImage(theme.imageUrl, theme.presetId).replace(/["\\]/g, '')}")`
      );
    }
    return () => {
      for (const key of [
        'festivalActive',
        'festivalSource',
        'festivalPreset',
        'festivalEffect',
        'festivalIntensity',
        'festivalReduced',
        'festivalBadge',
      ]) {
        delete body.dataset[key];
      }
      for (const area of FESTIVAL_AREAS) {
        delete body.dataset[`festival${area[0].toUpperCase()}${area.slice(1)}`];
      }
      for (const key of [
        '--festival-primary',
        '--festival-accent',
        '--festival-surface',
        '--festival-text',
        '--festival-art',
        '--festival-badge',
      ]) {
        body.style.removeProperty(key);
      }
    };
  }, [active, theme]);

  if (!active || !theme) return null;

  const showNote =
    festivalAreaEnabled(theme, 'cart') &&
    (pathname === '/cart' || pathname?.startsWith('/checkout'));
  const barStyle = {
    '--festival-primary': festivalColor(theme.palette?.primary, '#6b1736'),
    '--festival-accent': festivalColor(theme.palette?.accent, '#d6a750'),
    '--festival-text': festivalColor(theme.palette?.text, '#ffffff'),
  } as CSSProperties;

  return (
    <>
      <FestivalThemeStyles theme={theme} />
      {festivalVisual(theme).decorations && festivalVisual(theme).intensity !== 'off' && (
        <FestivalEffects visual={festivalVisual(theme)} ambient />
      )}
      {festivalAreaEnabled(theme, 'announcement') && (
        <div className="festival-offer-bar" style={barStyle}>
          <span className="festival-offer-bar__spark" aria-hidden="true">
            ✦
          </span>
          <span>{theme.greeting || `Celebrate ${theme.name || 'the festival'} with us`}</span>
          {theme.offerLabel && theme.couponCode && (
            <strong>
              {theme.offerLabel} · Use {theme.couponCode}
            </strong>
          )}
          <FestivalCountdownTimer endsAt={theme.endsAt} />
        </div>
      )}
      {showNote && (
        <div className="festival-checkout-note">
          {theme.greeting || theme.name}
          {pathname === '/cart' && theme.offerLabel && theme.couponCode
            ? ` · ${theme.offerLabel} with code ${theme.couponCode}`
            : ''}
        </div>
      )}
    </>
  );
}
