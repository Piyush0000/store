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
    if (displayList.length <= 1 || animation === 'marquee' || animation === 'none') return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [displayList.length, animation]);

  const textColor = customTextColor && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(customTextColor)
    ? customTextColor
    : getContrastColor(backgroundColor);
  const barStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
  };

  const isMarquee = animation === 'marquee';
  const isSingleSlideAnimation = animation === 'rotate' || animation === 'slide-up';
  const renderedMessages = isMarquee
    ? [...displayList, ...displayList]
    : isSingleSlideAnimation
      ? [displayList[currentIndex]]
      : displayList;
  return (
    <div
      className={`announcement-bar announcement-bar--${animation}`}
      style={{ ...barStyle, '--announcement-emoji-size': `${emojiSize}px` } as CSSProperties}
    >
      {animation === 'floating-emoji' && (
        <>
          <span className="announcement-decoration announcement-decoration--one" aria-hidden="true">{emoji}</span>
          <span className="announcement-decoration announcement-decoration--two" aria-hidden="true">{emoji}</span>
          <span className="announcement-decoration announcement-decoration--three" aria-hidden="true">{emoji}</span>
        </>
      )}
      <div className="announcement-marquee">
        <div
          className="announcement-track"
          style={isMarquee || isSingleSlideAnimation
            ? undefined
            : { transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {renderedMessages.map((_, i) => {
            const ann = isSingleSlideAnimation ? displayList[currentIndex] : displayList[i % displayList.length];
            const isDuplicate = isMarquee && i >= displayList.length;
            const itemContent = (
              <span className="announcement-item">
                <span className="announcement-diamond" aria-hidden="true">{emoji}</span>
                <span className="announcement-copy" key={`${currentIndex}-${animation}`}>
                  {ann.text === 'Limited Time: 00H:03M:00S' ? timeLeftText : ann.text}
                </span>
              </span>
            );

            const slideContent = ann.link ? (
              <Link href={ann.link} tabIndex={isDuplicate ? -1 : undefined} className="announcement-link hover:underline transition-all">
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
