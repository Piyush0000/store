'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Reel {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface ReelsSectionProps {
  reels: Reel[];
  visible?: boolean;
}

export default function ReelsSection({ reels, visible = true }: ReelsSectionProps) {
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!visible || !reels?.length) return null;

  const openReel = (idx: number) => {
    setActiveReel(idx);
    setPlaying(true);
    setMuted(true);
  };

  const closeReel = () => {
    setActiveReel(null);
    setPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  };

  const nextReel = () => {
    if (activeReel !== null && activeReel < reels.length - 1) {
      setActiveReel(activeReel + 1);
      setPlaying(true);
    }
  };

  const prevReel = () => {
    if (activeReel !== null && activeReel > 0) {
      setActiveReel(activeReel - 1);
      setPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); }
    else { videoRef.current.play().catch(() => {}); }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' });

  useEffect(() => {
    if (activeReel === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeReel();
      if (e.key === 'ArrowRight') nextReel();
      if (e.key === 'ArrowLeft') prevReel();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeReel, playing]);

  useEffect(() => {
    if (activeReel !== null && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [activeReel]);

  const currentReel = activeReel !== null ? reels[activeReel] : null;

  return (
    <>
      <section style={{ padding: '64px 24px', maxWidth: '1200px', margin: '0 auto', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h2 className="section-title" style={{ marginBottom: 0, paddingBottom: 0 }}>VIDEO REELS</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={scrollLeft}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e5e5',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'background 200ms'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e5e5',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'background 200ms'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Reels Row */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '12px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => openReel(idx)}
              style={{
                flexShrink: 0,
                width: '200px',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '9/16',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#111',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04) translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1) translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                }}
              >
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt={reel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={40} color="rgba(255,255,255,0.3)" />
                  </div>
                )}
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 200ms' }}>
                    <Play size={20} color="#fff" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                {/* Title */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reel.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fullscreen Modal */}
      {activeReel !== null && currentReel && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeReel}
        >
          <div
            style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '450px', margin: '0 auto', display: 'flex', alignItems: 'center', borderRadius: '16px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={currentReel.videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              loop muted={muted} playsInline autoPlay
              onClick={togglePlay}
            />

            {/* Top Controls */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <button onClick={closeReel} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <X size={18} color="#fff" />
              </button>
              <button onClick={toggleMute} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                {muted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
              </button>
            </div>

            {/* Bottom Info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.5), transparent)', zIndex: 10 }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>{currentReel.title}</h3>
              {currentReel.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{currentReel.description}</p>}
              {currentReel.ctaText && currentReel.ctaLink && (
                <a href={currentReel.ctaLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: '999px', background: '#fff', color: '#000', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  {currentReel.ctaText} <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Prev/Next Nav */}
            {activeReel > 0 && (
              <button onClick={prevReel} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                <ChevronLeft size={22} color="#fff" />
              </button>
            )}
            {activeReel < reels.length - 1 && (
              <button onClick={nextReel} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                <ChevronRight size={22} color="#fff" />
              </button>
            )}

            {/* Paused Indicator */}
            {!playing && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <Play size={28} color="#fff" style={{ marginLeft: 4 }} />
                </div>
              </div>
            )}
          </div>

          {/* Dot Indicators */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 20 }}>
            {reels.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setActiveReel(i); }}
                style={{ width: i === activeReel ? 24 : 8, height: 8, borderRadius: 999, background: i === activeReel ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 200ms, background 200ms' }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
