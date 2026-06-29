'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

interface AnalyticsContextType {
  track: (eventName: string, payload?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

function extractPixelId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  // If it's a numeric string (10 to 20 digits), it's the Pixel ID directly
  if (/^\d{10,20}$/.test(trimmed)) {
    return trimmed;
  }
  // Try to extract from fbq('init', 'ID')
  const initMatch = trimmed.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/);
  if (initMatch && initMatch[1]) {
    return initMatch[1];
  }
  // Fallback: search for a sequence of 12-18 digits in the code
  const numberMatch = trimmed.match(/\d{12,18}/);
  if (numberMatch && numberMatch[0]) {
    return numberMatch[0];
  }
  return null;
}

export function AnalyticsProvider({
  children,
  customization,
  storeSubdomain
}: {
  children: React.ReactNode;
  customization: any;
  storeSubdomain: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract pixel ID if present
  const rawPixel = customization?.metaPixel;
  const pixelId = extractPixelId(rawPixel);
  
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    // Generate or fetch session ID from sessionStorage
    if (typeof window !== 'undefined') {
      let currentSessionId = sessionStorage.getItem('orbit_session_id');
      if (!currentSessionId) {
        currentSessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('orbit_session_id', currentSessionId);
      }
      sessionIdRef.current = currentSessionId;
    }
  }, []);

  // Initialize fbq tracking array
  useEffect(() => {
    if (typeof window !== 'undefined' && pixelId) {
      const win = window as any;
      if (!win.fbq) {
        win.fbq = function(...args: any[]) {
          win.fbq.callMethod ? win.fbq.callMethod.apply(win.fbq, args) : win.fbq.queue.push(args);
        };
        win._fbq = win.fbq;
        win.fbq.push = win.fbq;
        win.fbq.loaded = true;
        win.fbq.version = '2.0';
        win.fbq.queue = [];
      }
      
      // Initialize the pixel
      win.fbq('init', pixelId);
      console.log('[Analytics] Initialized Meta Pixel:', pixelId);
    }
  }, [pixelId]);

  // Expose track function
  const track = async (eventName: string, payload: any = {}) => {
    try {
      const win = window as any;
      const cleanSubdomain = storeSubdomain || '';
      const sessionId = sessionIdRef.current || sessionStorage.getItem('orbit_session_id') || 'sess_anonymous';
      
      console.log(`[Analytics] Track Event: ${eventName}`, payload);

      // 1. Dispatch to Meta Pixel
      if (win.fbq && pixelId) {
        win.fbq('track', eventName, payload);
      }

      // 2. Dispatch to First-Party Backend API
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
      const eventUrl = `${apiBase}/${cleanSubdomain}/events`;

      // Extract user ID if present in localStorage or user context
      const userId = localStorage.getItem('user_id') || undefined;

      await fetch(eventUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          eventName,
          pageUrl: window.location.href,
          referrer: document.referrer || null,
          payload
        })
      });
    } catch (error) {
      console.error('[Analytics] Failed to dispatch tracking event:', error);
    }
  };

  // Track PageView on route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      track('PageView');
    }
  }, [pathname, searchParams]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {/* Inject Meta Pixel SDK script dynamically if pixelId exists */}
      {pixelId && (
        <Script
          id="meta-pixel-sdk"
          src="https://connect.facebook.net/en_US/fbevents.js"
          strategy="afterInteractive"
        />
      )}
      {children}
    </AnalyticsContext.Provider>
  );
}
