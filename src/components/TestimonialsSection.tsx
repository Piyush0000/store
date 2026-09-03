"use client";

import React, { useState, useEffect } from "react";
import "./TestimonialsSection.css";
import {
  bentoSpan,
  resolveDisplayType,
  summarizeRatings,
  usableRating,
  type Testimonial,
} from "@/lib/testimonials-style";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  displayType?: string;
}

export default function TestimonialsSection({
  testimonials,
  title = "CUSTOMERS FEEDBACK",
  displayType,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validTestimonials = (testimonials || []).filter(
    (t) => t && t.name && t.description,
  );

  const style = resolveDisplayType(displayType);

  // Reset the active slide when the merchant switches layout in the live preview,
  // otherwise an index valid for a 4-up carousel can overshoot a 1-up spotlight.
  useEffect(() => {
    setCurrentIndex(0);
  }, [style, validTestimonials.length]);

  if (validTestimonials.length === 0) return null;

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024 && windowWidth <= 1280;

  // Determine how many slides to show at once (4 slides on large desktop).
  // Spotlight is always a single review, whatever the viewport.
  const slidesPerPage =
    style === "spotlight" ? 1 : isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4;
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

  // Shared frame for the new layouts. The classic layout keeps its own markup
  // untouched so existing storefronts render byte-identically.
  const shell = (modifier: string, children: React.ReactNode) => (
    <section
      className={`testimonials-section testimonials-section--${modifier}`}
    >
      <div className="testimonials-section__container">
        <h2 className="testimonials-section__heading">{title}</h2>
        {children}
      </div>
    </section>
  );

  // Only rendered when the merchant actually supplied a link — the classic card
  // falls back to href="#", which is a dead anchor.
  const knowMore = (t: Testimonial, className: string) =>
    t.ctaLink ? (
      <a href={t.ctaLink} className={className}>
        know more
      </a>
    ) : null;

  const initials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  if (style === "spotlight") {
    const active = validTestimonials[Math.min(currentIndex, maxIndex)];
    return shell(
      "spotlight",
      <>
        <div
          className="testimonials-spotlight"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {active.image && (
            <div className="testimonials-spotlight__media">
              <img src={active.image} alt={active.name} loading="lazy" />
            </div>
          )}
          <div className="testimonials-spotlight__panel">
            <span className="testimonials-spotlight__mark" aria-hidden="true">
              &ldquo;
            </span>
            <p className="testimonials-spotlight__text">{active.description}</p>
            <div className="testimonials-section__stars">
              {renderStars(active.rating)}
            </div>
            <p className="testimonials-spotlight__name">
              {active.name}
              {active.date && (
                <span className="testimonials-spotlight__date">
                  {" "}
                  · {active.date}
                </span>
              )}
            </p>
            {knowMore(active, "testimonials-spotlight__link")}
          </div>
        </div>

        {validTestimonials.length > 1 && (
          <div className="testimonials-spotlight__pager">
            {validTestimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`testimonials-spotlight__thumb ${i === currentIndex ? "testimonials-spotlight__thumb--active" : ""}`}
                aria-label={`Show review from ${t.name}`}
                aria-current={i === currentIndex}
              >
                {t.image ? (
                  <img src={t.image} alt="" loading="lazy" />
                ) : (
                  <span>{initials(t.name)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </>,
    );
  }

  if (style === "bento") {
    const visible = expanded
      ? validTestimonials
      : validTestimonials.slice(0, 7);
    return shell(
      "bento",
      <>
        <div className="testimonials-bento">
          {visible.map((t, i) => {
            const hasImage = Boolean(t.image);
            const span = bentoSpan(i, hasImage);
            return (
              <article
                key={t.id}
                className={`testimonials-bento__tile testimonials-bento__tile--${span} ${hasImage ? "testimonials-bento__tile--media" : ""}`}
              >
                {hasImage && (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="testimonials-bento__image"
                    loading="lazy"
                  />
                )}
                <div className="testimonials-bento__body">
                  <div className="testimonials-section__stars">
                    {renderStars(t.rating)}
                  </div>
                  <p className="testimonials-bento__text">{t.description}</p>
                  <p className="testimonials-bento__name">{t.name}</p>
                </div>
              </article>
            );
          })}
        </div>
        {validTestimonials.length > 7 && (
          <div className="testimonials-bento__more">
            <button type="button" onClick={() => setExpanded((v) => !v)}>
              {expanded
                ? "Show less"
                : `Show all ${validTestimonials.length} reviews`}
            </button>
          </div>
        )}
      </>,
    );
  }

  if (style === "cinematic") {
    return shell(
      "cinematic",
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
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="testimonials-section__nav testimonials-section__nav--next"
              aria-label="Next review"
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
              transition: "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {validTestimonials.map((t) => (
              <div
                key={t.id}
                className="testimonials-section__slide"
                style={{ width: `${100 / slidesPerPage}%` }}
              >
                <article
                  className={`testimonials-cinematic__card ${t.image ? "" : "testimonials-cinematic__card--plain"}`}
                >
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="testimonials-cinematic__image"
                      loading="lazy"
                    />
                  )}
                  <div className="testimonials-cinematic__scrim">
                    <div className="testimonials-section__stars">
                      {renderStars(t.rating)}
                    </div>
                    <p className="testimonials-cinematic__text">
                      {t.description}
                    </p>
                    <p className="testimonials-cinematic__name">{t.name}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>,
    );
  }

  if (style === "marquee") {
    const half = Math.ceil(validTestimonials.length / 2);
    const rows =
      validTestimonials.length > 3
        ? [validTestimonials.slice(0, half), validTestimonials.slice(half)]
        : [validTestimonials];

    // A row must be wider than the viewport or the -50% translate exposes a gap,
    // so short lists are repeated until there is enough to fill it.
    const fillRow = (row: Testimonial[]) => {
      const filled: Testimonial[] = [];
      while (filled.length < 8 && row.length > 0) filled.push(...row);
      return filled;
    };

    return shell(
      "marquee",
      <div className="testimonials-marquee">
        {rows.map((row, rowIndex) => {
          const filled = fillRow(row);
          return (
          <div
            key={rowIndex}
            className={`testimonials-marquee__row testimonials-marquee__row--${rowIndex === 1 ? "reverse" : "forward"}`}
          >
            <div className="testimonials-marquee__track">
              {/* Duplicated so the translate can loop without a visible seam. */}
              {[...filled, ...filled].map((t, i) => (
                <article
                  key={`${t.id}-${i}`}
                  className="testimonials-marquee__card"
                  aria-hidden={i >= filled.length}
                >
                  <div className="testimonials-section__stars">
                    {renderStars(t.rating)}
                  </div>
                  <p className="testimonials-marquee__text">{t.description}</p>
                  <p className="testimonials-marquee__name">{t.name}</p>
                </article>
              ))}
            </div>
          </div>
          );
        })}
      </div>,
    );
  }

  if (style === "summary") {
    const stats = summarizeRatings(validTestimonials);
    const visible = expanded ? validTestimonials : validTestimonials.slice(0, 4);

    return shell(
      "summary",
      <div className="testimonials-summary">
        <aside className="testimonials-summary__panel">
          {stats.ratedCount > 0 ? (
            <>
              <p className="testimonials-summary__average">{stats.average}</p>
              <div className="testimonials-section__stars">
                {renderStars(Math.round(stats.average))}
              </div>
              <p className="testimonials-summary__count">
                Based on {stats.ratedCount}{" "}
                {stats.ratedCount === 1 ? "rating" : "ratings"}
              </p>
              <div className="testimonials-summary__bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star - 1];
                  const pct = Math.round((count / stats.ratedCount) * 100);
                  return (
                    <div key={star} className="testimonials-summary__bar-row">
                      <span className="testimonials-summary__bar-label">
                        {star}★
                      </span>
                      <span className="testimonials-summary__bar-track">
                        <span
                          className="testimonials-summary__bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="testimonials-summary__bar-count">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="testimonials-summary__count">
              {stats.totalCount} {stats.totalCount === 1 ? "review" : "reviews"}
            </p>
          )}
        </aside>

        <div className="testimonials-summary__list">
          {visible.map((t) => (
            <article key={t.id} className="testimonials-summary__item">
              <div className="testimonials-summary__avatar">
                {t.image ? (
                  <img src={t.image} alt="" loading="lazy" />
                ) : (
                  <span>{initials(t.name)}</span>
                )}
              </div>
              <div className="testimonials-summary__body">
                <div className="testimonials-summary__head">
                  <span className="testimonials-summary__name">{t.name}</span>
                  {t.date && (
                    <span className="testimonials-summary__date">{t.date}</span>
                  )}
                </div>
                {usableRating(t.rating) !== null && (
                  <div className="testimonials-section__stars">
                    {renderStars(t.rating)}
                  </div>
                )}
                <p className="testimonials-summary__text">{t.description}</p>
                {knowMore(t, "testimonials-summary__link")}
              </div>
            </article>
          ))}
          {validTestimonials.length > 4 && (
            <button
              type="button"
              className="testimonials-summary__more"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? "Show less"
                : `Show all ${validTestimonials.length} reviews`}
            </button>
          )}
        </div>
      </div>,
    );
  }

  return (
    <section className="testimonials-section scroll-fade-up">
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
                    <img
                      src={
                        t.image ||
                        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
                      }
                      alt={t.name}
                      className="testimonials-section__image"
                      loading="lazy"
                    />
                    <div className="testimonials-section__content">
                      <div className="testimonials-section__quote-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                        </svg>
                      </div>
                      
                      <p className="testimonials-section__text">
                        {t.description}
                      </p>

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

                      <div className="testimonials-section__bottom-row">
                        <a
                          href={t.ctaLink || "#"}
                          className="testimonials-section__know-more"
                        >
                          know more
                        </a>
                        <h4 className="testimonials-section__name">— {t.name}</h4>
                      </div>
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
