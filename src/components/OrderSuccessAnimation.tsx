'use client';

import Link from 'next/link';

const ribbons = [
  { tone: 'pink', left: '4%', delay: '0s', duration: '2.5s', path: 'M18 0 C2 28 40 39 18 69 C-2 96 35 111 12 142' },
  { tone: 'blue', left: '12%', delay: '.16s', duration: '2.8s', path: 'M12 0 C36 29 -2 44 22 72 C44 99 2 116 27 145' },
  { tone: 'gold', left: '22%', delay: '.08s', duration: '2.6s', path: 'M20 0 C-2 26 38 45 15 72 C-4 98 31 116 10 144' },
  { tone: 'green', left: '78%', delay: '.12s', duration: '2.7s', path: 'M14 0 C37 28 -3 42 20 72 C42 99 0 115 25 144' },
  { tone: 'pink', left: '88%', delay: '.22s', duration: '2.5s', path: 'M22 0 C0 28 39 42 17 70 C-4 98 35 116 13 144' },
  { tone: 'blue', left: '96%', delay: '.04s', duration: '2.9s', path: 'M14 0 C36 30 -3 45 20 72 C43 99 1 117 25 145' },
];

interface OrderSuccessAnimationProps {
  orderId: string | null;
  paymentMethod?: string | null;
  amount?: number | null;
  orderHref?: string;
  compact?: boolean;
}

export default function OrderSuccessAnimation({
  orderId,
  paymentMethod,
  amount,
  orderHref,
  compact = false,
}: OrderSuccessAnimationProps) {
  return (
    <div className={`order-success ${compact ? 'order-success--compact' : ''}`}>
      <div className="order-success__ribbons" aria-hidden="true">
        {ribbons.map((ribbon, index) => (
          <svg
            key={index}
            className={`order-success__ribbon order-success__ribbon--${ribbon.tone}`}
            style={{ left: ribbon.left, animationDelay: ribbon.delay, animationDuration: ribbon.duration }}
            viewBox="0 0 48 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`order-ribbon-gradient-${index}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="currentColor" stopOpacity=".5" />
                <stop offset=".42" stopColor="currentColor" stopOpacity=".95" />
                <stop offset=".68" stopColor="white" stopOpacity=".48" />
                <stop offset="1" stopColor="currentColor" stopOpacity=".72" />
              </linearGradient>
            </defs>
            <path d={ribbon.path} fill="none" stroke={`url(#order-ribbon-gradient-${index})`} strokeWidth="9" strokeLinecap="round" />
            <path d={ribbon.path} fill="none" stroke="white" strokeOpacity=".32" strokeWidth="1.2" />
          </svg>
        ))}
      </div>

      <div className="order-success__card">
        <div className="order-success__icon" role="img" aria-label="Order successfully placed">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="order-success__circle" cx="26" cy="26" r="24" />
            <path className="order-success__check" d="m15 26.5 7.2 7.2L37.5 18" />
          </svg>
        </div>
        <h1 className="order-success__title">Order Placed Successfully!</h1>
        <p className="order-success__message">Thank you for your purchase. Your order has been confirmed.</p>

        <div className="order-success__details">
          {orderId && <div className="order-success__row"><span>Order ID</span><strong>{orderId}</strong></div>}
          {typeof amount === 'number' && Number.isFinite(amount) && (
            <div className="order-success__row"><span>Order total</span><strong>₹{amount.toLocaleString('en-IN')}</strong></div>
          )}
          {paymentMethod && <div className="order-success__row"><span>Payment</span><strong>{paymentMethod}</strong></div>}
        </div>

        <div className="order-success__actions">
          {orderHref && <Link href={orderHref} className="order-success__primary">View Order</Link>}
          <Link href="/catalogue" className="order-success__secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
