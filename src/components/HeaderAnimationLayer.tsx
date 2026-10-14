'use client';

import type { CSSProperties } from 'react';

export const HEADER_ANIMATIONS = [
  'none',
  'silk-ribbon',
  'sparkle-trail',
  'floating-hearts',
  'floating-petals',
  'twinkling-stars',
  'aurora-gradient',
  'shopping-emojis',
  'logo-shimmer',
  'mini-confetti',
  'emoji-garden',
] as const;

type Animation = (typeof HEADER_ANIMATIONS)[number];
type Intensity = 'subtle' | 'balanced' | 'bold';
type Speed = 'slow' | 'normal' | 'fast';
type Frequency = 'occasional' | 'periodic' | 'continuous';
type Theme = 'pastel' | 'vibrant' | 'monochrome' | 'custom';

interface HeaderAnimationConfig {
  effect?: string;
  enabled?: boolean;
  intensity?: Intensity;
  speed?: Speed;
  frequency?: Frequency;
  colorTheme?: Theme;
  customColor?: string;
  emojis?: string[];
}

interface Props { config?: HeaderAnimationConfig; }

const DEFAULT_EMOJIS: Record<string, string[]> = {
  'floating-hearts': ['💖', '💕', '❤️'],
  'shopping-emojis': ['🛍️', '🎁', '💎'],
  'emoji-garden': ['🦋', '🌷', '👑', '✨', '🌻'],
};

const PARTICLE_POSITIONS = [6, 15, 25, 36, 47, 58, 69, 79, 90, 11, 42, 84];

function safeColor(value?: string) {
  return value && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value) ? value : '#c9a65b';
}

export default function HeaderAnimationLayer({ config }: Props) {
  const effect = (config?.enabled === false ? 'none' : config?.effect) as Animation;
  if (!HEADER_ANIMATIONS.includes(effect)) return null;
  if (effect === 'none') return null;

  const intensity: Intensity = ['subtle', 'balanced', 'bold'].includes(config?.intensity || '')
    ? config!.intensity!
    : 'balanced';
  const speed: Speed = ['slow', 'normal', 'fast'].includes(config?.speed || '')
    ? config!.speed!
    : 'normal';
  const frequency: Frequency = ['occasional', 'periodic', 'continuous'].includes(config?.frequency || '')
    ? config!.frequency!
    : 'periodic';
  const theme: Theme = ['pastel', 'vibrant', 'monochrome', 'custom'].includes(config?.colorTheme || '')
    ? config!.colorTheme!
    : 'pastel';
  const emojiOptions = (config?.emojis || DEFAULT_EMOJIS[effect] || ['✨'])
    .filter((emoji): emoji is string => typeof emoji === 'string' && emoji.trim().length > 0)
    .slice(0, 8);
  const emojis = emojiOptions.length ? emojiOptions : ['✨'];
  const count = intensity === 'subtle' ? 5 : intensity === 'bold' ? 12 : 8;
  const speedSeconds = speed === 'slow' ? 8 : speed === 'fast' ? 3.4 : 5.2;
  const frequencyMultiplier = frequency === 'occasional' ? 2.8 : frequency === 'continuous' ? 0.72 : 1.45;
  const style = {
    '--header-animation-duration': `${(speedSeconds * frequencyMultiplier).toFixed(1)}s`,
    '--header-animation-alpha': intensity === 'subtle' ? '.48' : intensity === 'bold' ? '.92' : '.72',
    '--header-animation-custom': safeColor(config?.customColor),
  } as CSSProperties;

  return (
    <div
      key={effect}
      className={`header__animation-layer header__animation-layer--${effect} header__animation-layer--${intensity} header__animation-layer--${frequency} header__animation-layer--${theme}`}
      style={style}
      aria-hidden="true"
    >
      {effect === 'silk-ribbon' && Array.from({ length: count }, (_, index) => (
        <svg key={index} className="header__animation-ribbon" style={{ left: `${PARTICLE_POSITIONS[index] ?? (index * 9)}%`, animationDelay: `${index * -.31}s` }} viewBox="0 0 48 140" preserveAspectRatio="none">
          <defs><linearGradient id={`header-ribbon-${index}`} x1="0" x2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".45"/><stop offset=".48" stopColor="currentColor" stopOpacity=".95"/><stop offset=".7" stopColor="white" stopOpacity=".58"/><stop offset="1" stopColor="currentColor" stopOpacity=".7"/></linearGradient></defs>
          <path d="M15 -10 C42 22 -5 40 24 70 C48 98 4 116 28 150" fill="none" stroke={`url(#header-ribbon-${index})`} strokeWidth="9" strokeLinecap="round"/>
        </svg>
      ))}

      {(effect === 'sparkle-trail' || effect === 'twinkling-stars') && Array.from({ length: count }, (_, index) => (
        <span key={index} className="header__animation-sparkle" style={{ '--particle-index': index } as CSSProperties}>
          {effect === 'sparkle-trail' ? (index % 3 === 0 ? '✦' : '✧') : (index % 3 === 0 ? '★' : '✦')}
        </span>
      ))}

      {(effect === 'floating-hearts' || effect === 'shopping-emojis' || effect === 'emoji-garden') && Array.from({ length: count }, (_, index) => (
        <span key={index} className="header__animation-emoji" style={{ '--particle-index': index } as CSSProperties}>
          {emojis[index % emojis.length]}
        </span>
      ))}

      {effect === 'floating-petals' && Array.from({ length: count }, (_, index) => (
        <span key={index} className="header__animation-petal" style={{ '--particle-index': index } as CSSProperties} />
      ))}

      {effect === 'mini-confetti' && Array.from({ length: count + 4 }, (_, index) => (
        <span key={index} className="header__animation-confetti" style={{ '--particle-index': index } as CSSProperties} />
      ))}
    </div>
  );
}
