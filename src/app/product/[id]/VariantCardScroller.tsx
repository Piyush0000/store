"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VariantCardScroller({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, max: 0, visible: 1 });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    setPosition({
      left: Math.min(track.scrollLeft, max),
      max,
      visible: track.scrollWidth ? track.clientWidth / track.scrollWidth : 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const move = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(112, track.clientWidth * 0.8), behavior: "smooth" });
  };

  const indicatorWidth = Math.min(100, position.visible * 100);
  const indicatorLeft = position.max
    ? (position.left / position.max) * (100 - indicatorWidth)
    : 0;

  return (
    <div className="product-page__variant-scroller">
      <div
        ref={trackRef}
        className="product-page__variant-options product-page__variant-options--cards"
        data-lenis-prevent
        onScroll={measure}
        role="group"
        aria-label="Product options; swipe horizontally to see more"
      >
        {children}
      </div>
      <div className="product-page__variant-scroll-controls" aria-label="Browse product options">
        <button type="button" onClick={() => move(-1)} disabled={position.left <= 1} aria-label="Previous options">
          <ChevronLeft size={18} />
        </button>
        <div className="product-page__variant-scroll-progress" aria-hidden="true">
          <span style={{ width: `${indicatorWidth}%`, left: `${indicatorLeft}%` }} />
        </div>
        <button type="button" onClick={() => move(1)} disabled={position.left >= position.max - 1} aria-label="Next options">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
