"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable on mobile/touch devices for 100% native 120Hz hardware scrolling
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) {
      return;
    }

    // Initialize Lenis smooth scrolling instance for desktop pointer
    const lenis = new Lenis({
      duration: 1.2, // Premium, lightweight desktop inertia (~1.2s)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1, // Keep native touch behavior intact on mobile
      infinite: false,
    });
    lenisRef.current = lenis;

    // Single performant requestAnimationFrame loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Proper cleanup on unmount to avoid memory leaks
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // When route changes, instantly reset Lenis scroll to 0
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
