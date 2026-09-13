/** Shared interpretation for saved configuration and editor preview messages. */
export function readHeaderStyle(customization: any): Record<string, any> {
  const value = customization?.headerStyle;
  if (typeof value === 'string') {
    try { return JSON.parse(value) || {}; } catch { return {}; }
  }
  return value && typeof value === 'object' ? value : {};
}

export function usesBannerBackground(customization: any, pathname: string): boolean {
  const style = readHeaderStyle(customization);
  const mode = style.navBackgroundMode || (['transparent', 'floating'].includes(style.navVariant) ? 'banner' : 'color');
  const firstSection = customization?.homepageSections?.find((section: any) => section.enabled !== false);
  return mode === 'banner' && pathname === '/' && customization?.homePageConfig?.heroEnabled !== false
    && (!firstSection || firstSection.type === 'heroSection');
}

export function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = value === '' || value == null ? NaN : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
