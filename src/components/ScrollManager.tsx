"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect } from "react";

export default function ScrollManager() {
  const pathname = usePathname();

  // useLayoutEffect fires synchronously BEFORE browser paint
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    // Disable browser default scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force immediate scroll to top before any repaint
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
