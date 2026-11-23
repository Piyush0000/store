"use client";

import { useEffect } from "react";

export default function ScrollObserver() {
  useEffect(() => {
    // Check for browser support
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback for environments without IntersectionObserver support
      document.querySelectorAll(".scroll-fade-up").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    // Initialize high-performance IntersectionObserver
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            // Unobserve immediately after reveal to save memory & GPU overhead
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12, // Trigger when 12% of the element is visible
        rootMargin: "0px 0px -30px 0px", // Slight bottom margin so elements glide in gracefully
      }
    );

    // Function to observe all unrevealed elements with .scroll-fade-up
    const observeElements = () => {
      const elements = document.querySelectorAll(".scroll-fade-up:not(.is-revealed)");
      elements.forEach((el) => observer.observe(el));
    };

    // Initial observation
    observeElements();

    // Watch for dynamically rendered sections/components
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
