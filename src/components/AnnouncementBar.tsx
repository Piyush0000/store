'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAnnouncements } from '@/lib/api';
import Link from 'next/link';
import './AnnouncementBar.css';

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
}

export default function AnnouncementBar({ initialCustomization }: AnnouncementBarProps) {
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
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return initialCustomization?.announcementBar?.backgroundColor || '#000000';
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (initialCustomization) return; // Skip fetch since we have initialCustomization!

    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log('[ANNOUNCEMENT] Fetching announcements from API');
    fetchAnnouncements()
      .then((data) => {
        console.log('[ANNOUNCEMENT] Announcements fetched:', data.length);
        // Map database structure (message/link) to unified list format (text/link)
        setAnnouncements(data.map(a => ({
          text: [a.title, a.message].filter(Boolean).join(' — '),
          link: a.link || ""
        })));
      })
      .catch((err) => {
        console.error('[ANNOUNCEMENT] Failed to fetch:', err);
      });
  }, [initialCustomization]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        const cust = e.data.data;
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

  const staticMessages = [
    { text: 'Hurry Up, Shop Now!', link: '' },
    { text: '50% Off', link: '' },
    { text: `Limited Time: ${pad(timeLeft.hours)}H:${pad(timeLeft.minutes)}M:${pad(timeLeft.seconds)}S`, link: '' },
    { text: 'Save Min 50% on all orders and get free shipping', link: '' },
  ];

  const displayList = announcements.length > 0 ? announcements : staticMessages;

  const textColor = getContrastColor(backgroundColor);
  const barStyle = {
    backgroundColor: backgroundColor,
    color: textColor,
  };

  // Duplicate items to ensure smooth continuous infinite scrolling marquee
  const trackItems = [...displayList, ...displayList, ...displayList, ...displayList];

  return (
    <div className="announcement-bar" style={barStyle}>
      <div className="announcement-marquee">
        <div className="announcement-track">
          {trackItems.map((ann, i) => {
            const itemContent = (
              <span className="announcement-item">
                <span className="announcement-diamond">◆</span>
                {ann.text}
              </span>
            );

            if (ann.link) {
              return (
                <Link key={i} href={ann.link} className="announcement-link hover:underline transition-all">
                  {itemContent}
                </Link>
              );
            }

            return (
              <span key={i}>
                {itemContent}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}