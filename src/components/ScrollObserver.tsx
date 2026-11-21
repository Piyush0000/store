"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Check for browser support
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".scroll-fade-up").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    // Initialize IntersectionObserver with tight viewport margin so user visibly sees reveal on scroll
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            // Unobserve after reveal to keep layout performant
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px -20px 0px", // Triggers visibly right as it enters viewport
      }
    );

    // Function to observe all unrevealed elements with .scroll-fade-up
    const observeElements = () => {
      const elements = document.querySelectorAll(".scroll-fade-up:not(.is-revealed)");
      elements.forEach((el) => observer.observe(el));
    };

    // Initial observation
    observeElements();

    // Debounce mutation handling so rapid DOM changes do not thrash querySelectorAll
    let mutationRafId: number | null = null;
    const debouncedObserve = () => {
      if (mutationRafId !== null) return;
      mutationRafId = requestAnimationFrame(() => {
        observeElements();
        mutationRafId = null;
      });
    };

    // Watch for dynamically rendered sections/components
    const mutationObserver = new MutationObserver(debouncedObserve);

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (mutationRafId !== null) cancelAnimationFrame(mutationRafId);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
