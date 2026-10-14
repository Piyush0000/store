export type FestivalArea = 'announcement' | 'header' | 'hero' | 'products' | 'categories' | 'cart' | 'footer';

export interface FestivalTheme {
  enabled?: boolean;
  preview?: boolean;
  presetId?: string;
  name?: string;
  greeting?: string;
  message?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  startsAt?: string;
  endsAt?: string;
  couponCode?: string;
  offerLabel?: string;
  palette?: { primary?: string; accent?: string; surface?: string; text?: string };
  areas?: Partial<Record<FestivalArea, boolean>>;
}

export const FESTIVAL_AREAS: FestivalArea[] = ['announcement', 'header', 'hero', 'products', 'categories', 'cart', 'footer'];

export function festivalIsActive(theme: FestivalTheme | null | undefined, now = Date.now()): boolean {
  if (!theme || theme.enabled !== true) return false;
  if (theme.preview === true) return true;
  const start = theme.startsAt ? Date.parse(theme.startsAt) : NaN;
  const end = theme.endsAt ? Date.parse(theme.endsAt) : NaN;
  if (Number.isFinite(start) && now < start) return false;
  if (Number.isFinite(end) && now >= end) return false;
  return true;
}

export function festivalAreaEnabled(theme: FestivalTheme, area: FestivalArea): boolean {
  return theme.areas?.[area] !== false;
}

export function festivalColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value) ? value : fallback;
}

export function festivalImage(value: unknown, presetId?: string): string {
  if (typeof value === 'string' && (value.startsWith('/') && !value.startsWith('//') || /^https:\/\//i.test(value) || /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\//i.test(value))) return value;
  return `/festivals/${presetId && /^[a-z0-9-]+$/.test(presetId) ? presetId : 'custom'}.svg`;
}
