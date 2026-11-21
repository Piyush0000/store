"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Handles instant top-of-page scroll positioning on navigation and resets scrollRestoration.
 * Uses native browser scrolling to prevent layout shifting, scrollbar offset bugs, or right-side gaps.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  // Disable browser automatic scroll restoration to ensure every page opens at the top
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // ALWAYS scroll to top immediately on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
