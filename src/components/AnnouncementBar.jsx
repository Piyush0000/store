import { useState, useEffect } from 'react';
import './AnnouncementBar.css';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function AnnouncementBar() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 3, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
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
        } else {
          // Reset when reaches 00:00:00
          hours = 0;
          minutes = 3;
          seconds = 0;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    'Extra discounts of Rs.650 at checkout',
    'Hurry Up, Shop Now!',
    '50% Off',
    `Limited Time: ${pad(timeLeft.hours)}H:${pad(timeLeft.minutes)}M:${pad(timeLeft.seconds)}S`,
    'Save Min 50% on all orders and get free shipping',
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