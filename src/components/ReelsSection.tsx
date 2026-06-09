'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ReelsSection.css';

interface Reel {
  id: string;
  title: string;
  sub: string;
  category: string;
  videoUrl: string;
  ctaLink?: string;
}

interface ReelsSectionProps {
  reels: Reel[];
}

export default function ReelsSection({ reels }: ReelsSectionProps) {
  const activeReels = (reels || []).filter(reel => reel && typeof reel.videoUrl === 'string' && reel.videoUrl.trim() !== "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
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
      setIsMuted(true);
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
        {activeReels[currentIndex].category && (
          <a
            href={activeReels[currentIndex].ctaLink || '/catalogue'}
            className="store-reels__cta"
          >
            Shop {activeReels[currentIndex].category}
          </a>
        )}
      </div>
    </section>
  );
}

function ReelCard({
  reel, offset, isMuted, inView, translateX, scale, zIndex, opacity, blur, onToggleMute, onClick,
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
  onClick: () => void;
}) {
  const isActive = offset === 0;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

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
          src={reel.videoUrl}
          muted={!isActive || isMuted}
          loop
          playsInline
          preload={isActive ? 'auto' : 'metadata'}
          className="store-reels__video"
        />
      )}
    </div>
  );
}
