"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  minHeight?: number | string;
  rootMargin?: string;
  className?: string;
}

/**
 * LazySection defers mounting of below-the-fold components until the user
 * scrolls within `rootMargin` (default 400px) of the section.
 *
 * This dramatically reduces initial DOM size, hydration cost, and network requests,
 * perfectly mirroring the progressive loading architecture of Shopdeck.
 */
export default function LazySection({
  children,
  minHeight = 400,
  rootMargin = "100px 0px 50px 0px",
  className = "",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  const heightVal = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className={`lazy-section-placeholder ${className}`}
        style={{
          minHeight: heightVal,
          width: "100%",
        }}
      >
        <div className="lazy-section-shimmer" />
      </div>
    );
  }

  return (
    <div className={`lazy-section-loaded ${className}`}>
      {children}
    </div>
  );
}
