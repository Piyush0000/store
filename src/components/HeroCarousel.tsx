'use client';

import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import Link from 'next/link';
import './HeroCarousel.css';

export interface HeroSlide {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  align?: string;
  valign?: string;
  overlay?: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** The `heroSection` customization object (transition, height, fit, interval, zoom, autoplay). */
  settings?: Record<string, unknown> | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function readSettings(settings?: Record<string, unknown> | null) {
  const interval = Number(settings?.interval);
  return {
    transition: settings?.transition === 'fade' ? 'fade' : 'slide',
    height: ['medium', 'tall', 'full'].includes(String(settings?.height)) ? String(settings?.height) : 'tall',
    fit: settings?.fit === 'contain' ? 'contain' : 'cover',
    interval: Number.isFinite(interval) && interval > 0 ? clamp(interval, 3, 10) : 5,
    zoom: settings?.zoom === true,
    autoplay: settings?.autoplay !== false,
  };
}

export default function HeroCarousel({ slides, settings }: HeroCarouselProps) {
  const { transition, height, fit, interval, zoom, autoplay } = readSettings(settings);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Keep the index valid when slides are removed in the editor preview.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const go = (next: number) => setIndex(((next % count) + count) % count);
  const paused = hovering;
  const canPlay = autoplay && count > 1;

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
  };

  const className = [
    'hero-banner',
    `hero-banner--${transition}`,
    `hero-banner--${height}`,
    `hero-banner--${fit}`,
    zoom ? 'hero-banner--zoom' : '',
    paused ? 'hero-banner--paused' : '',
    canPlay ? '' : 'hero-banner--static',
  ].filter(Boolean).join(' ');

  return (
    <section
      className={className}
      style={{ '--hero-interval': `${interval}s` } as CSSProperties}
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-banner__slides">
        {slides.map((slide, i) => {
          const active = i === index;
          const hasText = Boolean(slide.title || slide.subtitle || (slide.cta && slide.link));
          const overlay = clamp(Number.isFinite(Number(slide.overlay)) ? Number(slide.overlay) : 40, 0, 80) / 100;
          const align = ['left', 'right'].includes(String(slide.align)) ? String(slide.align) : 'center';
          const valign = ['top', 'middle'].includes(String(slide.valign)) ? String(slide.valign) : 'bottom';
          // The shade sits where the text is, so it stays readable.
          const shade = valign === 'bottom'
            ? `linear-gradient(to top, rgba(0,0,0,${overlay}) 0%, rgba(0,0,0,0) 65%)`
            : valign === 'top'
              ? `linear-gradient(to bottom, rgba(0,0,0,${overlay}) 0%, rgba(0,0,0,0) 65%)`
              : `rgba(0,0,0,${(overlay * 0.75).toFixed(2)})`;
          const Heading = i === 0 ? 'h1' : 'h2';
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image}
              alt={slide.title || 'Hero Banner'}
              className="hero-banner__image"
              loading={i === 0 ? 'eager' : 'lazy'}
              {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
              decoding="async"
            />
          );
          return (
            <div
              key={slide.id}
              className={`hero-banner__slide ${active ? 'is-active' : ''}`}
              style={transition === 'slide' ? { transform: `translateX(${(i - index) * 100}%)` } : undefined}
              aria-hidden={!active}
              inert={!active}
            >
              {slide.link ? (
                <Link href={slide.link} className="hero-banner__link">{image}</Link>
              ) : image}
              {hasText && (
                <div
                  className="hero-banner__shade"
                  style={{ background: shade }}
                />
              )}
              {hasText && (
                <div className={`hero-banner__content hero-banner__content--${align} hero-banner__content--v-${valign}`}>
                  {slide.title && <Heading>{slide.title}</Heading>}
                  {slide.subtitle && <p>{slide.subtitle}</p>}
                  {slide.cta && slide.link && (
                    <Link href={slide.link} className="hero-banner__cta">{slide.cta}</Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="hero-banner__dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-banner__dot ${i === index ? 'is-active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
            >
              <span className="hero-banner__dot-visual">
                {i === index && (
                  // The fill animation lasts one interval; when it ends we advance.
                  <span key={index} className="hero-banner__dot-fill" onAnimationEnd={() => go(index + 1)} />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
