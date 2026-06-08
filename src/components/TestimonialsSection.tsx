'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin } from 'lucide-react';

interface Testimonial {
  id: string;
  customerName: string;
  customerImage?: string;
  review: string;
  rating: number;
  reviewDate?: string;
  location?: string;
  productName?: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  visible?: boolean;
  layout?: 'grid' | 'carousel' | 'auto-slide';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          style={{ fill: s <= rating ? '#f59e0b' : 'transparent', color: s <= rating ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = t.review.length > 180;
  const initials = t.customerName ? t.customerName.charAt(0).toUpperCase() : '?';

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'box-shadow 300ms',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
    >
      {/* Quote Icon */}
      <div style={{ marginBottom: 12 }}>
        <Quote size={24} style={{ color: 'rgba(200,160,76,0.25)' }} />
      </div>

      {/* Review Text */}
      <p style={{
        color: '#555',
        fontSize: '14px',
        lineHeight: 1.7,
        flex: 1,
        margin: 0,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: expanded || !isLong ? undefined : 4,
        overflow: expanded || !isLong ? 'visible' : 'hidden',
      }}>
        {t.review}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'left', marginTop: 4 }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Rating + Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0', paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        <StarRating rating={t.rating} />
        {t.reviewDate && (
          <span style={{ fontSize: '11px', color: '#aaa' }}>
            {new Date(t.reviewDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Customer Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg,#c9a84c,#e8d5a3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0,
          border: '2px solid rgba(201,168,76,0.2)'
        }}>
          {t.customerImage ? (
            <img src={t.customerImage} alt={t.customerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.customerName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {t.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '11px', color: '#999' }}>
                <MapPin size={10} /> {t.location}
              </span>
            )}
            {t.productName && (
              <span style={{ background: '#f5f5f5', padding: '1px 8px', borderRadius: 999, fontSize: '10px', color: '#666' }}>
                {t.productName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection({ testimonials, visible = true, layout = 'carousel' }: TestimonialsSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!visible || !testimonials?.length) return null;

  const maxSlide = Math.max(0, testimonials.length - itemsPerView);

  useEffect(() => {
    if (layout !== 'auto-slide' || isPaused) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
    }, 4000);
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [layout, isPaused, maxSlide]);

  const goNext = () => setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  const goPrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const sectionStyle: React.CSSProperties = {
    padding: '64px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    overflow: 'hidden',
  };

  if (layout === 'grid') {
    return (
      <section style={sectionStyle}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="section-title">WHAT OUR CUSTOMERS SAY</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {testimonials.map(t => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </section>
    );
  }

  // Carousel / Auto-slide layout
  const gapPx = 24;
  // Width of each card in percent (accounting for gaps)
  const cardWidthPct = (100 - (gapPx * (itemsPerView - 1)) / 12) / itemsPerView;
  // Shift per slide = cardWidthPct + gap as percent of container
  const shiftPerSlide = cardWidthPct + (gapPx / 12);

  return (
    <section
      style={sectionStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h2 className="section-title" style={{ marginBottom: 0, paddingBottom: 0 }}>
          WHAT OUR CUSTOMERS SAY
        </h2>
        {maxSlide > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={goPrev}
              disabled={currentSlide === 0}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e5e5',
                background: '#fff', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentSlide === 0 ? 0.3 : 1, transition: 'background 200ms'
              }}
              onMouseEnter={e => { if (currentSlide !== 0) (e.currentTarget.style.background = '#f5f5f5'); }}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              disabled={currentSlide >= maxSlide}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e5e5',
                background: '#fff', cursor: currentSlide >= maxSlide ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: currentSlide >= maxSlide ? 0.3 : 1, transition: 'background 200ms'
              }}
              onMouseEnter={e => { if (currentSlide < maxSlide) (e.currentTarget.style.background = '#f5f5f5'); }}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: `${gapPx}px`,
            transition: 'transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)',
            transform: `translateX(-${currentSlide * shiftPerSlide}%)`,
          }}
        >
          {testimonials.map(t => (
            <div
              key={t.id}
              style={{
                flexShrink: 0,
                width: `calc((100% - ${(itemsPerView - 1) * gapPx}px) / ${itemsPerView})`,
              }}
            >
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>

      {maxSlide > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32 }}>
          {Array.from({ length: maxSlide + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 999,
                background: i === currentSlide ? '#c9a84c' : '#ddd',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 200ms, background 200ms',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
