'use client';

import { useEffect, useState, useMemo } from 'react';

interface PreviewBridgeProps {
  initialCustomization: any;
}

function isLightColor(colorStr: string): boolean {
  if (!colorStr) return false;
  const cleanColor = colorStr.trim().toLowerCase();

  // Hex format
  if (cleanColor.startsWith('#')) {
    const hex = cleanColor.slice(1);
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness >= 180;
  }

  // RGB/RGBA format
  if (cleanColor.startsWith('rgb')) {
    const matches = cleanColor.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0], 10);
      const g = parseInt(matches[1], 10);
      const b = parseInt(matches[2], 10);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness >= 180;
    }
  }

  const lightColors = ['white', 'yellow', 'lightgray', 'lightgrey', 'beige', 'ivory', 'lightblue', 'lightgreen'];
  return lightColors.includes(cleanColor);
}

export default function PreviewBridge({ initialCustomization }: PreviewBridgeProps) {
  const [customization, setCustomization] = useState(initialCustomization);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Allow any origin for local dev/preview, but check message type
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        console.log('[PreviewBridge] Received customization update:', e.data.data);
        setCustomization((prev: any) => ({
          ...(prev || {}),
          ...e.data.data,
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * ProductCard renders in several grids that never receive customization, so
   * the chosen style is published as a data attribute on <body> and the card
   * CSS keys off it. Kept in an effect so it also follows live preview updates.
   */
  useEffect(() => {
    const variant = customization?.productCard?.variant || 'classic';
    document.body.dataset.productCard = variant;
  }, [customization?.productCard?.variant]);

  const bodyFont = useMemo(() => {
    return customization?.typography?.bodyFont || customization?.typography?.fontFamily;
  }, [customization?.typography?.bodyFont, customization?.typography?.fontFamily]);

  const headingFont = useMemo(() => {
    return customization?.typography?.headingFont;
  }, [customization?.typography?.headingFont]);

  /**
   * CSS variable mapping:
   *   primaryColor  → the main brand color (buttons, borders, highlights)
   *   secondaryColor → the secondary / accent-coral color used on hover states
   *   accentColor   → the light accent / gold-light used on hover + decoration
   *
   * We derive a "dark" shade by using the primary at 80% opacity approximation
   * (pure CSS doesn't compute darkness, so we reuse primary for dark variants).
   */
  const css = useMemo(() => {
    const primaryColor = customization?.brandColors?.primary;
    const accentColor = customization?.brandColors?.accent;
    const secondaryColor = customization?.brandColors?.secondary;

    let headerStyle = customization?.headerStyle;
    if (headerStyle && typeof headerStyle === 'string') {
      try {
        headerStyle = JSON.parse(headerStyle);
      } catch (err) {}
    }
    const headerBg = headerStyle?.backgroundColor;
    const isLight = headerBg ? isLightColor(headerBg) : false;

    // Nav bar look and its own colour overrides.
    const navVariant = headerStyle?.navVariant || 'classic';
    const navBg = headerStyle?.navBackgroundColor;
    const navText = headerStyle?.navTextColor;
    const navAccent = headerStyle?.navAccentColor;
    // These variants paint their own surface, so the header background must
    // not be forced onto .header__nav or they would look identical to classic.
    const navOwnsBackground = ['floating', 'transparent', 'gradient'].includes(navVariant);
    const navBarSelector = navOwnsBackground ? '.header' : '.header, .header__nav';

    const productCard = customization?.productCard;
    const pcBadge = productCard?.badgeColor;
    const pcButton = productCard?.buttonColor;
    const pcButtonText = productCard?.buttonTextColor;
    const pcPrice = productCard?.priceColor;

    return `
      :root {
        ${primaryColor ? `
          --gold: ${primaryColor} !important;
          --color-gold: ${primaryColor} !important;
          --accent: ${primaryColor} !important;
          --gold-dark: ${primaryColor} !important;
          --color-gold-dark: ${primaryColor} !important;
        ` : ''}
        ${accentColor ? `
          --gold-light: ${accentColor} !important;
          --color-gold-light: ${accentColor} !important;
          --color-gold-bg: ${accentColor}22 !important;
        ` : ''}
        ${secondaryColor ? `
          --color-accent-coral: ${secondaryColor} !important;
        ` : ''}
        ${bodyFont ? `
          --font-body: "${bodyFont}", var(--font-inter), system-ui, sans-serif !important;
        ` : ''}
        ${headingFont ? `
          --font-heading: "${headingFont}", var(--font-playfair), serif !important;
        ` : ''}
      }
      ${headerBg ? `
        ${navBarSelector} {
          background: ${headerBg} !important;
        }
        ${isLight ? `
          /* Light header styles: turn text, links and icons to gray */
          .header {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
          }
          .header__nav {
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
          }
          .header__icon-btn, .header__logo-text, .header__nav-link, .header__mobile-toggle {
            color: #4b5563 !important;
          }
          .header__logo-img {
            filter: none !important;
          }
          .header__icon-btn:hover, .header__mobile-toggle:hover {
            background: rgba(0, 0, 0, 0.05) !important;
            color: #1f2937 !important;
          }
          .header__nav-link:hover, .header__nav-link--active {
            color: var(--gold-light) !important;
          }
        ` : `
          /* Dark / other header styles: keep text, links and icons white */
          .header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .header__nav {
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .header__icon-btn, .header__logo-text, .header__nav-link, .header__mobile-toggle {
            color: #ffffff !important;
          }
          .header__logo-img {
            filter: brightness(0) invert(1) !important;
          }
          .header__icon-btn:hover, .header__mobile-toggle:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .header__nav-link:hover, .header__nav-link--active {
            color: var(--gold-light) !important;
          }
        `}
      ` : ''}
      ${navBg || navText || navAccent ? `
        /* Nav-specific colours. Emitted after the header block above so they
           win on source order for stores that set them explicitly. */
        .header {
          ${navBg ? `--nav-bg: ${navBg};` : ''}
          ${navText ? `--nav-text: ${navText};` : ''}
          ${navAccent ? `
            --nav-accent: ${navAccent};
            --nav-on-accent: ${isLightColor(navAccent) ? '#14181f' : '#ffffff'};
          ` : ''}
        }
        ${navBg && !navOwnsBackground ? `
          .header__nav { background: ${navBg} !important; }
        ` : ''}
        ${navText ? `
          .header .header__nav-link { color: ${navText} !important; }
        ` : ''}
        ${navAccent ? `
          .header .header__nav-link:hover,
          .header .header__nav-link--active { color: ${navAccent} !important; }
          .header .header__nav-link::after { background: ${navAccent} !important; }
          .header--nav-pill .header__nav-link:hover,
          .header--nav-pill .header__nav-link--active,
          .header--nav-boxed .header__nav-link:hover,
          .header--nav-boxed .header__nav-link--active {
            background: ${navAccent} !important;
            color: ${isLightColor(navAccent) ? '#14181f' : '#ffffff'} !important;
          }
        ` : ''}
      ` : ''}
      ${pcBadge || pcButton || pcButtonText || pcPrice ? `
        /* Product card colours. Each falls back to the card's own default. */
        body {
          ${pcBadge ? `
            --pc-badge-bg: ${pcBadge};
            --pc-badge-text: ${isLightColor(pcBadge) ? '#14181f' : '#ffffff'};
          ` : ''}
          ${pcButton ? `--pc-btn-bg: ${pcButton};` : ''}
          ${pcButtonText ? `--pc-btn-text: ${pcButtonText};` : ''}
          ${pcPrice ? `--pc-price: ${pcPrice};` : ''}
        }
      ` : ''}
    `;
  }, [
    customization?.brandColors?.primary,
    customization?.brandColors?.accent,
    customization?.brandColors?.secondary,
    customization?.headerStyle,
    customization?.productCard,
    bodyFont,
    headingFont
  ]);

  return (
    <>
      {bodyFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${bodyFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`}
        />
      )}
      {headingFont && headingFont !== bodyFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
