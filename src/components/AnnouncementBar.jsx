import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const { announcementText, showAnnouncement } = useAdmin();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  if (!showAnnouncement) return null;

  const messages = [
    announcementText,
    'Hurry Up, Shop Now!',
    '50% Off on All Orders',
    `${pad(timeLeft.hours)}H : ${pad(timeLeft.minutes)}M : ${pad(timeLeft.seconds)}S`,
    'Free Shipping on orders above ₹499',
  ];

  return (
    <div className="announcement-bar">
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