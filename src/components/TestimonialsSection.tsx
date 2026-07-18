"use client";

import React, { useState, useEffect } from "react";
import "./TestimonialsSection.css";

interface Testimonial {
  id: string;
  name: string;
  description: string;
  image?: string;
  rating?: number;
  date?: string;
  ctaLink?: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
}

export default function TestimonialsSection({
  testimonials,
  title = "CUSTOMERS FEEDBACK",
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validTestimonials = (testimonials || []).filter(
    (t) => t && t.name && t.description,
  );

  if (validTestimonials.length === 0) return null;

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024 && windowWidth <= 1280;

  // Determine how many slides to show at once (4 slides on large desktop)
  const slidesPerPage = isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4;
  const maxIndex = Math.max(0, validTestimonials.length - slidesPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`testimonials-section__star ${i < rating ? "testimonials-section__star--active" : ""}`}
        viewBox="0 0 24 24"
        fill={i < rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-section__container">
        <h2 className="testimonials-section__heading">{title}</h2>
        <div className="testimonials-section__view-all-container">
          <a href="#" className="testimonials-section__view-all">
            VIEW ALL
          </a>
        </div>

        <div
          className="testimonials-section__slider-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {validTestimonials.length > slidesPerPage && (
            <>
              <button
                onClick={handlePrev}
                className="testimonials-section__nav testimonials-section__nav--prev"
                aria-label="Previous testimonial"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="testimonials-section__nav testimonials-section__nav--next"
                aria-label="Next testimonial"
              >
                ›
              </button>
            </>
          )}

          <div className="testimonials-section__track-container">
            <div
              className="testimonials-section__track"
              style={{
                transform: `translateX(-${currentIndex * (100 / slidesPerPage)}%)`,
                transition:
                  "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {validTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="testimonials-section__slide"
                  style={{ width: `${100 / slidesPerPage}%` }}
                >
                  <div className="testimonials-section__card">
                    <div className="testimonials-section__image-container">
                      <img
                        src={
                          t.image ||
                          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
                        }
                        alt={t.name}
                        className="testimonials-section__image"
                        loading="lazy"
                      />
                    </div>
                    <div className="testimonials-section__content">
                      <h4 className="testimonials-section__name">{t.name}</h4>

                      <div className="testimonials-section__meta">
                        <div className="testimonials-section__stars">
                          {renderStars(t.rating)}
                        </div>
                        {t.date && (
                          <span className="testimonials-section__date">
                            {t.date}
                          </span>
                        )}
                      </div>

                      <p className="testimonials-section__text">
                        {t.description}
                      </p>

                      <a
                        href={t.ctaLink || "#"}
                        className="testimonials-section__know-more"
                      >
                        know more
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {validTestimonials.length > slidesPerPage && (
          <div className="testimonials-section__dots">
            {Array.from({
              length: validTestimonials.length - slidesPerPage + 1,
            }).map((_, i) => (
              <button
                key={i}
                className={`testimonials-section__dot ${i === currentIndex ? "testimonials-section__dot--active" : ""}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
