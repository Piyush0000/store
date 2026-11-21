'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { fetchAnnouncements } from '@/lib/api';
import Link from 'next/link';
import './AnnouncementBar.css';

const ANNOUNCEMENT_ANIMATIONS = new Set([
  'rotate',
  'marquee',
  'slide-up',
  'typewriter',
  'floating-emoji',
  'bounce-emoji',
  'wiggle-icon',
  'sparkle-sweep',
  'pulse',
  'staggered',
  'none',
]);

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getContrastColor(hexColor: string) {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return '#ffffff';
  
  let r = 0, g = 0, b = 0;
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  }
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function parseDate(value: unknown): number | null {
  if (typeof value !== 'string' || !value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function readSchedule(bar: any) {
  return {
    startsAt: parseDate(bar?.startsAt),
    endsAt: parseDate(bar?.endsAt),
    showCountdown: bar?.showCountdown === true,
    hidden: bar?.hidden === true,
  };
}

// Style choices are saved as keys and mapped to real values here.
const GRADIENTS: Record<string, string> = {
  sunset: 'linear-gradient(90deg, #f97316, #db2777)',
  ocean: 'linear-gradient(90deg, #0ea5e9, #4f46e5)',
  gold: 'linear-gradient(90deg, #b45309, #f59e0b)',
  royal: 'linear-gradient(90deg, #4c1d95, #7e22ce)',
  forest: 'linear-gradient(90deg, #14532d, #16a34a)',
};
const SPEED_FACTOR = { slow: 1.6, normal: 1, fast: 0.6 } as const;

function pickOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function readStyle(bar: any) {
  const iconUrl = typeof bar?.iconUrl === 'string' && /^(https?:\/\/|\/(?!\/))/i.test(bar.iconUrl) ? bar.iconUrl : '';
  return {
    speed: pickOption(bar?.speed, ['slow', 'normal', 'fast'] as const, 'normal'),
    fontSize: pickOption(bar?.fontSize, ['small', 'medium', 'large'] as const, 'medium'),
    fontWeight: pickOption(bar?.fontWeight, ['normal', 'bold'] as const, 'normal'),
    barSize: pickOption(bar?.barSize, ['compact', 'default', 'large'] as const, 'default'),
    uppercase: bar?.uppercase !== false,
    showDividers: bar?.showDividers === true,
    gradient: typeof bar?.gradient === 'string' && bar.gradient in GRADIENTS ? bar.gradient : '',
    iconUrl,
  };
}

function formatRemaining(ms: number) {
  const total = Math.max(Math.floor(ms / 1000), 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${days > 0 ? `${days}d ` : ''}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

interface AnnouncementBarProps {
  initialCustomization?: any;
  storeSubdomain?: string;
}

export default function AnnouncementBar({ initialCustomization, storeSubdomain }: AnnouncementBarProps) {
  const getInitialAnnouncements = () => {
    if (initialCustomization?.announcementBar?.announcements) {
      return initialCustomization.announcementBar.announcements;
    }
    if (initialCustomization?.announcementBar?.text) {
      return [{
        text: initialCustomization.announcementBar.text,
        link: initialCustomization.announcementBar.link || ""
      }];
    }
    return [];
  };

  const [announcements, setAnnouncements] = useState<any[]>(getInitialAnnouncements);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 3, seconds: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState(() => {
    const value = initialCustomization?.announcementBar?.animation;
    return typeof value === 'string' && ANNOUNCEMENT_ANIMATIONS.has(value)
      ? value
      : 'rotate';
  });
  const [emoji, setEmoji] = useState(() => {
    const value = initialCustomization?.announcementBar?.emoji;
    return typeof value === 'string' && value.trim() ? value : '✨';
  });
  const [emojiSize, setEmojiSize] = useState(() => {
    const value = Number(initialCustomization?.announcementBar?.emojiSize);
    return Number.isFinite(value) && value > 0 ? Math.min(32, Math.max(14, value)) : 20;
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return initialCustomization?.announcementBar?.backgroundColor || '#000000';
  });
  const [customTextColor, setCustomTextColor] = useState<string | undefined>(
    initialCustomization?.announcementBar?.textColor,
  );
  const [schedule, setSchedule] = useState(() => readSchedule(initialCustomization?.announcementBar));
  const [styleCfg, setStyleCfg] = useState(() => readStyle(initialCustomization?.announcementBar));
  const [now, setNow] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  // The builder preview always shows the bar so merchants can edit it outside its schedule.
  const [isPreview, setIsPreview] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (initialCustomization) return; // Skip fetch since we have initialCustomization!

    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log('[ANNOUNCEMENT] Fetching announcements from API');
    fetchAnnouncements(storeSubdomain)
      .then((data) => {
        console.log('[ANNOUNCEMENT] Announcements fetched:', data.length);
        // Map database structure (message/link) to unified list format (text/link)
        setAnnouncements(data.map(a => ({
          text: [a.title, a.message].filter(Boolean).join(' — '),
          link: a.link || ""
        })));
      })
      .catch((err) => {
        console.warn('[ANNOUNCEMENT] Failed to fetch:', err);
      });
  }, [initialCustomization]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        const cust = e.data.data;
        setIsPreview(true);
        setStyleCfg(readStyle(cust?.announcementBar));
        setSchedule(readSchedule(cust?.announcementBar));
        const nextAnimation = cust?.announcementBar?.animation;
        setAnimation(
          typeof nextAnimation === 'string' && ANNOUNCEMENT_ANIMATIONS.has(nextAnimation)
            ? nextAnimation
            : 'rotate',
        );
        const nextEmoji = cust?.announcementBar?.emoji;
        setEmoji(typeof nextEmoji === 'string' && nextEmoji.trim() ? nextEmoji : '✨');
        const nextEmojiSize = Number(cust?.announcementBar?.emojiSize);
        setEmojiSize(Number.isFinite(nextEmojiSize) && nextEmojiSize > 0
          ? Math.min(32, Math.max(14, nextEmojiSize))
          : 20);
        if (cust?.announcementBar?.announcements) {
          setAnnouncements(cust.announcementBar.announcements);
        } else if (cust?.announcementBar?.text) {
          setAnnouncements([{
            text: cust.announcementBar.text,
            link: cust.announcementBar.link || ""
          }]);
        } else {
          setAnnouncements([]);
        }
        if (cust?.announcementBar?.backgroundColor) {
          setBackgroundColor(cust.announcementBar.backgroundColor);
        }
        setCustomTextColor(cust?.announcementBar?.textColor);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else { hours = 0; minutes = 3; seconds = 0; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasSchedule = schedule.startsAt !== null || schedule.endsAt !== null;
  const showEndCountdown = schedule.showCountdown && schedule.endsAt !== null;

  useEffect(() => {
    setNow(Date.now());
    if (!hasSchedule && !showEndCountdown) return;
    const timer = setInterval(() => setNow(Date.now()), showEndCountdown ? 1000 : 30000);
    return () => clearInterval(timer);
  }, [hasSchedule, showEndCountdown]);

  const timeLeftText = `Limited Time: ${pad(timeLeft.hours)}H:${pad(timeLeft.minutes)}M:${pad(timeLeft.seconds)}S`;

  const staticMessages = [
    { text: 'Hurry Up, Shop Now!', link: '' },
    { text: '50% Off', link: '' },
    { text: timeLeftText, link: '' },
    { text: 'Save Min 50% on all orders and get free shipping', link: '' },
  ];

  const allMessages = announcements.length > 0 ? announcements : staticMessages;
  const displayList = animation === 'none' ? allMessages.slice(0, 1) : allMessages;

  // Reset current index if content list length changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [displayList.length]);

  // Autoplay cycle
  useEffect(() => {
    if (displayList.length <= 1 || animation === 'marquee' || animation === 'none' || hovering) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [displayList.length, animation, hovering]);

  const textColor = customTextColor && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(customTextColor)
    ? customTextColor
    : getContrastColor(backgroundColor);
  const barStyle = {
    backgroundColor: backgroundColor,
    ...(styleCfg.gradient ? { backgroundImage: GRADIENTS[styleCfg.gradient] } : {}),
    color: textColor,
  };

  const isOutsideSchedule = schedule.startsAt !== null && (now === null || now < schedule.startsAt)
    || schedule.endsAt !== null && (now === null || now >= schedule.endsAt);
  // Hidden bars stay hidden in the editor preview too, so the toggle is visible.
  if (schedule.hidden || (!isPreview && isOutsideSchedule)) return null;

  // "{timer}" inside an announcement is replaced by the live countdown. Without an
  // inline placeholder the countdown is appended to every announcement, so it shares
  // the bar's animation.
  const timerText = showEndCountdown && schedule.endsAt !== null && now !== null && schedule.endsAt > now
    ? formatRemaining(schedule.endsAt - now)
    : '';
  const usesInlineTimer = showEndCountdown && allMessages.some((m: any) => String(m.text || '').includes('{timer}'));
  const fillTimer = (text: string) => (
    text.includes('{timer}') ? text.replace(/\{timer\}/g, timerText).replace(/\s+/g, ' ').trim() : text
  );

  const isMarquee = animation === 'marquee';
  const isSingleSlideAnimation = animation === 'rotate' || animation === 'slide-up';
  // The ticker loops by moving the track left by half its width, so each half must be
  // wider than the screen. Repeat short lists (e.g. a single announcement) to fill it.
  const marqueeHalf = isMarquee ? displayList.length * Math.max(1, Math.ceil(16 / displayList.length)) : 0;
  const renderedMessages = isMarquee
    ? Array.from({ length: marqueeHalf * 2 })
    : isSingleSlideAnimation
      ? [displayList[currentIndex]]
      : displayList;
  const renderIcon = () => (styleCfg.iconUrl
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={styleCfg.iconUrl} alt="" className="announcement-icon" style={{ height: `${emojiSize}px` }} />
    : emoji);
  const barClassName = [
    'announcement-bar',
    `announcement-bar--${animation}`,
    `announcement-bar--size-${styleCfg.barSize}`,
    `announcement-bar--font-${styleCfg.fontSize}`,
    styleCfg.fontWeight === 'bold' ? 'announcement-bar--bold' : '',
    styleCfg.uppercase ? '' : 'announcement-bar--no-uppercase',
    styleCfg.showDividers ? 'announcement-bar--dividers' : '',
  ].filter(Boolean).join(' ');
  return (
    <div
      className={barClassName}
      style={{ ...barStyle, '--announcement-emoji-size': `${emojiSize}px`, '--announcement-bg': backgroundColor, '--announcement-fg': textColor } as CSSProperties}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {animation === 'floating-emoji' && (
        <>
          <span className="announcement-decoration announcement-decoration--one" aria-hidden="true">{renderIcon()}</span>
          <span className="announcement-decoration announcement-decoration--two" aria-hidden="true">{renderIcon()}</span>
          <span className="announcement-decoration announcement-decoration--three" aria-hidden="true">{renderIcon()}</span>
        </>
      )}
      <div className="announcement-marquee">
        <div
          className="announcement-track"
          style={isMarquee
            ? { animationDuration: `${Math.max(marqueeHalf * 5.5, 20) * SPEED_FACTOR[styleCfg.speed]}s` }
            : isSingleSlideAnimation
              ? undefined
              : { transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {renderedMessages.map((_, i) => {
            const ann = isSingleSlideAnimation ? displayList[currentIndex] : displayList[i % displayList.length];
            const isDuplicate = isMarquee && i >= marqueeHalf;
            const itemContent = (
              <span className="announcement-item">
                <span className="announcement-diamond" aria-hidden="true">{renderIcon()}</span>
                <span className="announcement-copy" key={`${currentIndex}-${animation}`}>
                  {fillTimer(ann.text === 'Limited Time: 00H:03M:00S' ? timeLeftText : ann.text)}
                  {!usesInlineTimer && timerText ? (
                    <span className="announcement-timer">Ends in {timerText}</span>
                  ) : null}
                </span>
                {ann.badge ? <span className="announcement-badge">{ann.badge}</span> : null}
                {ann.ctaLabel && ann.link ? <span className="announcement-cta">{ann.ctaLabel} →</span> : null}
              </span>
            );

            const slideContent = ann.link ? (
              <Link
                href={ann.link}
                tabIndex={isDuplicate ? -1 : undefined}
                target={ann.newTab ? '_blank' : undefined}
                rel={ann.newTab ? 'noopener noreferrer' : undefined}
                className="announcement-link hover:underline transition-all"
              >
                {itemContent}
              </Link>
            ) : (
              <span>
                {itemContent}
              </span>
            );

            return (
              <div
                key={`${i}-${ann.text}-${isSingleSlideAnimation ? currentIndex : ''}`}
                className="announcement-slide"
                aria-hidden={isDuplicate || undefined}
              >
                {slideContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
