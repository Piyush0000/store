'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './FakeSalesPopup.css';

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
  slug?: string;
}

interface FakeSalesPopupProps {
  config: {
    enabled?: boolean;
    intervalSeconds?: number;
    delaySeconds?: number;
  };
  products: Product[];
}

const INDIAN_NAMES = [
  'Priya', 'Aarav', 'Neha', 'Rohan', 'Ananya', 
  'Rahul', 'Sneha', 'Amit', 'Tanvi', 'Vikram', 
  'Kavya', 'Aditya', 'Meera', 'Arjun', 'Riya',
  'Siddharth', 'Ishita', 'Karan', 'Pooja', 'Deepak'
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 
  'Indore', 'Chandigarh', 'Coimbatore', 'Surat', 'Gurugram', 
  'Noida', 'Kochi', 'Bhopal', 'Patna', 'Dehradun'
];

const TIMES = [
  'just now', '1 minute ago', '2 minutes ago', '3 minutes ago', 
  '5 minutes ago', '8 minutes ago', '10 minutes ago', '12 minutes ago', 
  '15 minutes ago', '20 minutes ago', '25 minutes ago', '30 minutes ago'
];

export default function FakeSalesPopup({ config, products }: FakeSalesPopupProps) {
  const [show, setShow] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [buyerInfo, setBuyerInfo] = useState('');
  const [timeAgo, setTimeAgo] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const intervalMs = (config.intervalSeconds || 15) * 1000;
  const initialDelayMs = (config.delaySeconds || 5) * 1000;

  const triggerPopup = () => {
    if (!products || products.length === 0) return;
    
    // Select random values
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomName = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
    const randomCity = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

    setCurrentProduct(randomProduct);
    setBuyerInfo(`${randomName} from ${randomCity}`);
    setTimeAgo(randomTime);
    setShow(true);

    // Hide after 5 seconds
    hideTimerRef.current = setTimeout(() => {
      setShow(false);
      // Schedule the next one after the interval
      timerRef.current = setTimeout(triggerPopup, intervalMs);
    }, 5000);
  };

  useEffect(() => {
    if (!config.enabled || !products || products.length === 0) {
      setShow(false);
      return;
    }

    // Schedule the first popup after the initial delay
    timerRef.current = setTimeout(triggerPopup, initialDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [config.enabled, products, intervalMs, initialDelayMs]);

  const handleClose = () => {
    setShow(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Resume cycle after interval
    timerRef.current = setTimeout(triggerPopup, intervalMs);
  };

  if (!currentProduct) return null;

  const productLink = `/product/${currentProduct.slug || currentProduct.id}`;
  const productImage = currentProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100';

  return (
    <div className={`fake-sales-popup ${show ? 'show' : ''}`}>
      <div className="fake-sales-popup__img-wrapper">
        <img src={productImage} alt={currentProduct.name} className="fake-sales-popup__img" />
      </div>
      <div className="fake-sales-popup__content">
        <p className="fake-sales-popup__text">
          <span className="fake-sales-popup__name">{buyerInfo}</span> recently purchased
        </p>
        <a href={productLink} className="fake-sales-popup__product">
          {currentProduct.name}
        </a>
        <div className="fake-sales-popup__meta">
          <span className="fake-sales-popup__time">{timeAgo}</span>
          <span className="fake-sales-popup__verified">
            <svg className="fake-sales-popup__verified-icon" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" />
            </svg>
            Verified Purchase
          </span>
        </div>
      </div>
      <button 
        className="fake-sales-popup__close" 
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
