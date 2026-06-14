'use client';

import { useEffect, useState, useMemo } from 'react';

interface PreviewBridgeProps {
  initialCustomization: any;
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
    `;
  }, [
    customization?.brandColors?.primary,
    customization?.brandColors?.accent,
    customization?.brandColors?.secondary,
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
