'use client';

import { useState, useEffect } from 'react';
import { fetchAnnouncements } from '@/lib/api';
import './AnnouncementBar.css';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 3, seconds: 0 });

  useEffect(() => {
    fetchAnnouncements().then(setAnnouncements).catch(() => {});
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

  const apiMessages = announcements.length > 0
    ? announcements.map(a => [a.title, a.message].filter(Boolean).join(' — '))
    : [];

  const staticMessages = [
    'Extra discounts of Rs.650 at checkout',
    'Hurry Up, Shop Now!',
    '50% Off',
    `Limited Time: ${pad(timeLeft.hours)}H:${pad(timeLeft.minutes)}M:${pad(timeLeft.seconds)}S`,
    'Save Min 50% on all orders and get free shipping',
  ];

  const messages = apiMessages.length > 0 ? apiMessages : staticMessages;
  const barStyle = announcements[0]?.backgroundColor
    ? { backgroundColor: announcements[0].backgroundColor, color: announcements[0].textColor || '#fff' }
    : {};

  return (
    <div className="announcement-bar" style={barStyle}>
      <div className="announcement-marquee">
        <div className="announcement-track">
          {[...messages, ...messages, ...messages, ...messages].map((msg, i) => (
            <span key={i} className="announcement-item">
              <span className="announcement-diamond">◆</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}