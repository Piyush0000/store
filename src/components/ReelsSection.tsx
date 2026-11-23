'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ReelsSection.css';
import { videoMimeType } from '@/lib/media-type';

interface Reel {
  id: string;
  title: string;
  sub: string;
  category: string;
  videoUrl: string;
  ctaLink?: string;
  ctaText?: string;
  thumbnail?: string;
}

/**
 * The button under a video: a link to a product or page, with an optional label.
 * Only same-site paths and http(s) links are accepted, so a pasted value can't run script.
 */
function reelCta(reel: Reel): { href: string; label: string } | null {
  const link = (reel.ctaLink || '').trim();
  const safe = /^(\/(?!\/)|https?:\/\/)/i.test(link) ? link : '';
  if (!safe && !reel.category) return null;
  // A product/page link wins; otherwise go to the category's own page.
  const categoryPage = `/catalogue?category=${encodeURIComponent((reel.category || '').toLowerCase().trim())}`;
  return {
    href: safe || categoryPage,
    label: (reel.ctaText || '').trim() || 'Shop now',
  };
}

export type ReelDisplayType = 'grid' | 'carousel' | 'stories' | 'pop' | 'sales-page' | 'ugc';

interface ReelsSectionProps {
  reels: Reel[];
  displayType?: ReelDisplayType;
}

export default function ReelsSection({
  reels,
  displayType = "carousel",
}: ReelsSectionProps) {
  const activeReels = (reels || []).filter(
    (reel) =>
      reel &&
      typeof reel.videoUrl === "string" &&
      reel.videoUrl.trim() !== "",
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPopOpen, setIsPopOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: '200px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  if (!activeReels || activeReels.length === 0) return null;

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;
  const minSwipeDistance = 50;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % activeReels.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + activeReels.length) % activeReels.length);

  const handleReelClick = (idx: number) => {
    if (idx === currentIndex) {
      setIsMuted(!isMuted);
    } else {
      setCurrentIndex(idx);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  if (displayType === 'grid') {
    return (
      <section id="store-reels" ref={sectionRef} className="store-reels store-reels--gallery">
        <ReelsHeading eyebrow="Shop the videos" title="Watch, discover and shop" />
        <div className="store-reels__grid">
          {activeReels.map((reel) => <GalleryReel key={reel.id} reel={reel} inView={inView} />)}
        </div>
      </section>
    );
  }

  if (displayType === 'stories') {
    const activeReel = activeReels[currentIndex];
    return (
      <section id="store-reels" ref={sectionRef} className="store-reels store-reels--stories">
        <ReelsHeading eyebrow="New stories" title="See what is happening" />
        <div className="store-reels__story-picker" aria-label="Video stories">
          {activeReels.map((reel, idx) => (
            <button key={reel.id} type="button" className={`store-reels__story${idx === currentIndex ? ' store-reels__story--active' : ''}`} onClick={() => setCurrentIndex(idx)}>
              <span className="store-reels__story-ring"><ReelThumb reel={reel} /></span>
              <span>{reel.sub || reel.category || `Story ${idx + 1}`}</span>
            </button>
          ))}
        </div>
        <div className="store-reels__story-player">
          <ReelPlayer key={activeReel.id} reel={activeReel} inView={inView} />
          <VideoDetails reel={activeReel} />
        </div>
      </section>
    );
  }

  if (displayType === 'pop') {
    const activeReel = activeReels[currentIndex];
    return (
      <section id="store-reels" ref={sectionRef} className="store-reels store-reels--pop">
        <ReelsHeading eyebrow="Featured video" title="See it in action" />
        <p className="store-reels__pop-copy">Watch our latest product video while you continue shopping.</p>
        {isPopOpen ? (
          <aside className="store-reels__pop-card" aria-label="Featured shopping video">
            <button type="button" className="store-reels__pop-close" onClick={() => setIsPopOpen(false)} aria-label="Close video">×</button>
            <ReelPlayer key={activeReel.id} reel={activeReel} inView={inView} />
            <VideoDetails reel={activeReel} compact />
            {activeReels.length > 1 && <button type="button" className="store-reels__pop-next" onClick={handleNext}>Next video ›</button>}
          </aside>
        ) : (
          <button type="button" className="store-reels__pop-reopen" onClick={() => setIsPopOpen(true)}>▶ Watch video</button>
        )}
      </section>
    );
  }

  if (displayType === 'sales-page') {
    const activeReel = activeReels[currentIndex];
    return (
      <section id="store-reels" ref={sectionRef} className="store-reels store-reels--sales">
        <div className="store-reels__sales-player"><ReelPlayer key={activeReel.id} reel={activeReel} inView={inView} /></div>
        <div className="store-reels__sales-content">
          <ReelsHeading eyebrow={activeReel.sub || 'Video shopping'} title={activeReel.title || 'Watch it. Love it. Shop it.'} />
          {reelCta(activeReel) && <a className="store-reels__cta" href={reelCta(activeReel)!.href}>{reelCta(activeReel)!.label}</a>}
          <div className="store-reels__sales-thumbs">
            {activeReels.map((reel, idx) => (
              <button key={reel.id} type="button" className={idx === currentIndex ? 'is-active' : ''} onClick={() => setCurrentIndex(idx)}>
                <ReelThumb reel={reel} /><span>{reel.title || `Video ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayType === 'ugc') {
    return (
      <section id="store-reels" ref={sectionRef} className="store-reels store-reels--ugc">
        <div className="store-reels__ugc-intro">
          <span className="store-reels__ugc-icon">＋</span><p className="store-reels__eyebrow">Community spotlight</p>
          <h2>Real stories from our customers</h2><p>Explore product reviews, unboxings and everyday inspiration shared by our community.</p>
        </div>
        <div className="store-reels__ugc-grid">{activeReels.map((reel) => <GalleryReel key={reel.id} reel={reel} compact inView={inView} />)}</div>
      </section>
    );
  }

  return (
    <section id="store-reels" ref={sectionRef} className="store-reels">
      <div
        className="store-reels__track"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Desktop navigation arrows */}
        <button onClick={handlePrev} className="store-reels__nav store-reels__nav--prev" aria-label="Previous reel">
          ‹
        </button>
        <button onClick={handleNext} className="store-reels__nav store-reels__nav--next" aria-label="Next reel">
          ›
        </button>

        {activeReels.map((reel, idx) => {
          const diff = idx - currentIndex;
          let offset = diff;
          const halfLen = Math.floor(activeReels.length / 2);
          if (offset > halfLen) offset -= activeReels.length;
          if (offset < -halfLen) offset += activeReels.length;

          let translateX = '0';
          let scale = '1';
          let zIndex = 30;
          let opacity = 1;
          let blur = false;

          if (offset === 0) {
            translateX = '0';
            scale = '1';
            zIndex = 30;
            opacity = 1;
          } else if (offset === -1) {
            translateX = isMobile ? '-105%' : isTablet ? '-90%' : '-65%';
            scale = isMobile ? '0.9' : '0.85';
            zIndex = 20;
            opacity = isMobile ? 0.5 : 0.85;
            blur = true;
          } else if (offset === 1) {
            translateX = isMobile ? '105%' : isTablet ? '90%' : '65%';
            scale = isMobile ? '0.9' : '0.85';
            zIndex = 20;
            opacity = isMobile ? 0.5 : 0.85;
            blur = true;
          } else if (offset === -2) {
            translateX = isMobile || isTablet ? '-200%' : '-130%';
            scale = isMobile || isTablet ? '0.5' : '0.7';
            zIndex = 10;
            opacity = isMobile || isTablet ? 0 : 0.5;
            blur = true;
          } else if (offset === 2) {
            translateX = isMobile || isTablet ? '200%' : '130%';
            scale = isMobile || isTablet ? '0.5' : '0.7';
            zIndex = 10;
            opacity = isMobile || isTablet ? 0 : 0.5;
            blur = true;
          }

          return (
            <ReelCard
              key={reel.id}
              reel={reel}
              offset={offset}
              isMuted={isMuted}
              inView={inView}
              translateX={translateX}
              scale={scale}
              zIndex={zIndex}
              opacity={opacity}
              blur={blur}
              onToggleMute={() => setIsMuted(!isMuted)}
              onSoundBlocked={() => setIsMuted(true)}
              onClick={() => handleReelClick(idx)}
            />
          );
        })}
      </div>

      {/* Mobile controls */}
      <div className="store-reels__mobile-controls">
        <button onClick={handlePrev} className="store-reels__arrow" aria-label="Previous">‹</button>
        <div className="store-reels__dots">
          {activeReels.map((_, i) => (
            <div
              key={i}
              className={`store-reels__dot${i === currentIndex ? ' store-reels__dot--active' : ''}`}
            />
          ))}
        </div>
        <button onClick={handleNext} className="store-reels__arrow" aria-label="Next">›</button>
      </div>

      {/* Desktop dots */}
      <div className="store-reels__dots-desktop">
        {activeReels.map((_, i) => (
          <div
            key={i}
            className={`store-reels__dot${i === currentIndex ? ' store-reels__dot--active' : ''}`}
          />
        ))}
      </div>

      {/* Caption */}
      <div className="store-reels__caption">
        <span className="store-reels__sub">{activeReels[currentIndex].sub}</span>
        <h4 className="store-reels__title">{activeReels[currentIndex].title}</h4>
        {reelCta(activeReels[currentIndex]) && (
          <a href={reelCta(activeReels[currentIndex])!.href} className="store-reels__cta">
            {reelCta(activeReels[currentIndex])!.label}
          </a>
        )}
      </div>
    </section>
  );
}

function ReelsHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <header className="store-reels__heading"><p className="store-reels__eyebrow">{eyebrow}</p><h2>{title}</h2></header>;
}

function VideoDetails({ reel, compact = false }: { reel: Reel; compact?: boolean }) {
  return (
    <div className={`store-reels__details${compact ? ' store-reels__details--compact' : ''}`}>
      {reel.sub && <span>{reel.sub}</span>}{reel.title && <h3>{reel.title}</h3>}
      {reelCta(reel) && <a href={reelCta(reel)!.href}>{reelCta(reel)!.label}</a>}
    </div>
  );
}

function GalleryReel({ reel, compact = false, inView }: { reel: Reel; compact?: boolean; inView: boolean }) {
  return (
    <article className={`store-reels__gallery-card${compact ? ' store-reels__gallery-card--compact' : ''}`}>
      <video src={inView ? reel.videoUrl : undefined} poster={reel.thumbnail || undefined} controls muted loop playsInline preload="none" /><VideoDetails reel={reel} compact={compact} />
    </article>
  );
}

function ReelCard({
  reel, offset, isMuted, inView, translateX, scale, zIndex, opacity, blur, onToggleMute, onSoundBlocked, onClick,
}: {
  reel: Reel;
  offset: number;
  isMuted: boolean;
  inView: boolean;
  translateX: string;
  scale: string;
  zIndex: number;
  opacity: number;
  blur: boolean;
  onToggleMute: () => void;
  onSoundBlocked: () => void;
  onClick: () => void;
}) {
  const isActive = offset === 0;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      const video = videoRef.current;
      video.play().catch(() => {
        // Browsers refuse autoplay with sound until the visitor interacts; fall back to muted.
        onSoundBlocked();
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive, inView]);

  return (
    <div
      onClick={onClick}
      className={`store-reels__card${blur ? ' store-reels__card--blur' : ''}`}
      style={{
        transform: `translateX(${translateX}) scale(${scale})`,
        zIndex,
        opacity,
      }}
    >
      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className="store-reels__mute"
          aria-label="Toggle mute"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {inView && (
        <video
          ref={videoRef}
          muted={!isActive || isMuted}
          loop
          playsInline
          preload={isActive ? 'auto' : 'metadata'}
          poster={reel.thumbnail || undefined}
          className="store-reels__video"
        >
          <source src={reel.videoUrl} type={videoMimeType(reel.videoUrl)} />
        </video>
      )}
    </div>
  );
}

/** Small preview tile: the merchant's thumbnail, or the video's first frame when none is set. */
function ReelThumb({ reel }: { reel: Reel }) {
  if (reel.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={reel.thumbnail} alt="" loading="lazy" decoding="async" />;
  }
  return <video src={`${reel.videoUrl}#t=0.1`} muted playsInline preload="metadata" />;
}

/**
 * Main player. Starts with sound on; if the browser blocks that (it does until the
 * visitor has interacted with the page) it plays muted and shows a "Tap for sound" button.
 */
function ReelPlayer({ reel, inView }: { reel: Reel; inView: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView) return;
    video.muted = false;
    video.play().then(() => setSoundBlocked(false)).catch(() => {
      video.muted = true;
      setSoundBlocked(true);
      video.play().catch(() => {});
    });
  }, [inView, reel.id]);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setSoundBlocked(false);
  };

  return (
    <div className="store-reels__player">
      <video
        ref={videoRef}
        src={inView ? reel.videoUrl : undefined}
        poster={reel.thumbnail || undefined}
        controls
        loop
        playsInline
        preload={inView ? 'auto' : 'none'}
      />
      {soundBlocked && (
        <button type="button" className="store-reels__sound" onClick={enableSound}>
          🔇 Tap for sound
        </button>
      )}
    </div>
  );
}
