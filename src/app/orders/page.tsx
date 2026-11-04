'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Loader2,
  ShieldCheck,
  Phone,
  ArrowRight,
  LogOut,
  AlertCircle,
  RotateCcw,
  Truck,
} from 'lucide-react';
import {
  validateSession,
  deleteSession,
  sendOtp,
  sendOtpWhatsApp,
  verifyOtp,
  createSession,
} from '@/actions/otp-actions';
import { getOrdersByPhone } from '@/actions/order-actions';
import { getUserByPhone } from '@/actions/user-actions';
import './orders.css';

const IndiaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 30 20" className="orders__flag">
    <rect width="30" height="20" fill="#FFF" />
    <rect width="30" height="6.67" fill="#FF9933" />
    <rect y="13.33" width="30" height="6.67" fill="#138808" />
    <circle cx="15" cy="10" r="2" fill="#000080" />
    <circle cx="15" cy="10" r="2" fill="none" stroke="#000080" strokeWidth="0.5" />
    <circle cx="15" cy="10" r="0.4" fill="#000080" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.08 7.41 8.84 7.67C8.6 7.93 7.93 8.55 7.93 9.82C7.93 11.09 8.86 12.31 8.99 12.48C9.12 12.65 10.8 15.25 13.38 16.36C15.53 17.29 15.97 17.1 16.43 17.06C16.9 17.01 17.93 16.44 18.14 15.85C18.35 15.26 18.35 14.76 18.28 14.65C18.21 14.54 18.04 14.47 17.79 14.34C17.54 14.21 16.31 13.61 16.08 13.52C15.85 13.44 15.68 13.39 15.51 13.65C15.34 13.9 14.86 14.47 14.71 14.65C14.56 14.82 14.41 14.84 14.16 14.71C13.91 14.59 12.87 14.25 11.64 13.15C10.68 12.3 10.03 11.24 9.9 11.02C9.78 10.8 9.89 10.68 10.01 10.56C10.12 10.45 10.26 10.27 10.39 10.12C10.51 9.97 10.56 9.87 10.64 9.7C10.72 9.53 10.68 9.39 10.62 9.26C10.56 9.13 10.05 7.89 9.84 7.38C9.64 6.89 9.43 6.95 9.27 6.95L8.84 6.95C8.6 6.95 9.53 7.34 9.53 7.34Z"/>
  </svg>
);

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variantInfo?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus?: string;
  total: number;
  createdAt: string | Date;
  items: OrderItem[];
  paymentMethod: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  // Sign In / OTP form state
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Check initial session
  useEffect(() => {
    const fetchSessionAndOrders = async () => {
      try {
        const session = await validateSession();
        if (!session.valid || !session.phone) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setPhone(session.phone);

        const userResult = await getUserByPhone(session.phone);
        const ordersResult = await getOrdersByPhone(session.phone, userResult?.data?.id);

        if (ordersResult.success && ordersResult.data) {
          setOrders((ordersResult.data as any) || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('[OrdersPage] Init error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndOrders();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (channel: 'sms' | 'whatsapp' = 'sms') => {
    const clean = phoneInput.replace(/\D/g, '');
    if (!clean || clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = channel === 'whatsapp'
        ? await sendOtpWhatsApp({ phone: clean })
        : await sendOtp({ phone: clean });

      if (res.success) {
        setSessionId((res as any).sessionId || null);
        setOtpChannel(channel);
        setResendTimer(res.resendTimer || 60);
        setAuthStep('otp');
        setOtp(['', '', '', '']);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while sending OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '');

    // Pasted full or partial code
    if (digits.length > 1) {
      const nextOtp = [...otp];
      for (let i = 0; i < 4; i++) {
        if (digits[i]) nextOtp[i] = digits[i];
      }
      setOtp(nextOtp);
      const lastIdx = Math.min(digits.length, 4) - 1;
      otpInputsRef.current[Math.min(lastIdx + 1, 3)]?.focus();

      if (nextOtp.every((d) => d !== '')) {
        handleVerifyOtp(nextOtp.join(''));
      }
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digits.slice(-1);
    setOtp(nextOtp);

    if (digits && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (digits && index === 3 && nextOtp.every((d) => d !== '')) {
      handleVerifyOtp(nextOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = codeOverride || otp.join('');
    if (!code || code.length !== 4) {
      setError('Please enter the 4-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const clean = phoneInput.replace(/\D/g, '');

    try {
      const res = await verifyOtp({
        phone: clean,
        code,
        sessionId: sessionId || undefined,
      });

      if (res.success) {
        await createSession(clean);
        setPhone(clean);
        setIsAuthenticated(true);
        setAuthStep('phone');

        // Fetch user & past orders
        const userRes = await getUserByPhone(clean);
        const ordersRes = await getOrdersByPhone(clean, userRes?.data?.id);
        if (ordersRes.success && ordersRes.data) {
          setOrders((ordersRes.data as any) || []);
        } else {
          setOrders([]);
        }
      } else {
        setError(res.message || 'Invalid verification code. Please check and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await deleteSession();
      setIsAuthenticated(false);
      setPhone(null);
      setOrders([]);
      setPhoneInput('');
      setOtp(['', '', '', '']);
      setAuthStep('phone');
      setError(null);
    } catch (err) {
      console.error('[OrdersPage] Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  const getExpectedDeliveryDate = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 7);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  };

  const getStatusInfo = (status: string, fulfillmentStatus?: string) => {
    const f = (fulfillmentStatus || '').toUpperCase();
    if (f === 'DELIVERED') return { className: 'success', label: 'Delivered' };
    if (f === 'SHIPPED') return { className: 'info', label: 'Shipped' };

    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return { className: 'success', label: 'Delivered' };
      case 'CONFIRMED':
        return { className: 'success', label: 'Confirmed' };
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return { className: 'info', label: 'Shipped' };
      case 'CANCELLED':
      case 'FAILED':
        return { className: 'error', label: 'Cancelled' };
      case 'PROCESSING':
      case 'PACKED':
        return { className: 'pending', label: 'Processing' };
      default:
        return { className: 'pending', label: s || 'Placed' };
    }
  };

  if (isLoading) {
    return (
      <div className="orders">
        <div className="orders__loading">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Mobile Number & OTP Verification flow
  if (!isAuthenticated) {
    return (
      <div className="orders">
        <div className="orders__header">
          <h1>MY ORDERS</h1>
        </div>

        <div className="orders__auth-card">
          <div className="orders__auth-icon-badge">
            <ShieldCheck size={28} />
          </div>

          {authStep === 'phone' ? (
            <>
              <h2 className="orders__auth-title">Sign In to View Orders</h2>
              <p className="orders__auth-subtitle">
                Enter your 10-digit mobile number to view and track your orders.
              </p>

              {error && (
                <div className="orders__alert orders__alert--error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp('sms');
                }}
                className="orders__auth-form"
              >
                <div className="orders__phone-group">
                  <div className="orders__phone-prefix">
                    <IndiaFlag />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={phoneInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneInput(val);
                      if (error) setError(null);
                    }}
                    autoFocus
                    className="orders__phone-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || phoneInput.length !== 10}
                  className="orders__submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP via SMS</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="orders__auth-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendOtp('whatsapp')}
                  disabled={isSubmitting || phoneInput.length !== 10}
                  className="orders__whatsapp-btn"
                >
                  <WhatsAppIcon />
                  <span>Send OTP on WhatsApp</span>
                </button>
              </form>

              <div className="orders__auth-trust">
                <ShieldCheck size={14} />
                <span>We never share your number. Protected by OTP verification.</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="orders__auth-title">Verify Mobile Number</h2>
              <p className="orders__auth-subtitle">
                Enter the 4-digit code sent via {otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to{' '}
                <strong>+91 {phoneInput}</strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  setAuthStep('phone');
                  setError(null);
                }}
                className="orders__change-phone-btn"
              >
                Edit mobile number
              </button>

              {error && (
                <div className="orders__alert orders__alert--error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="orders__otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="orders__otp-box"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isSubmitting || otp.some((d) => !d)}
                className="orders__submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & View Orders</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="orders__resend-section">
                {resendTimer > 0 ? (
                  <span className="orders__resend-timer">
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </span>
                ) : (
                  <div className="orders__resend-actions">
                    <button
                      type="button"
                      onClick={() => handleSendOtp('sms')}
                      disabled={isSubmitting}
                      className="orders__resend-link"
                    >
                      <RotateCcw size={13} />
                      Resend SMS
                    </button>
                    <span className="orders__resend-divider">•</span>
                    <button
                      type="button"
                      onClick={() => handleSendOtp('whatsapp')}
                      disabled={isSubmitting}
                      className="orders__resend-link orders__resend-link--whatsapp"
                    >
                      <WhatsAppIcon />
                      Resend on WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Authenticated: Show order history
  return (
    <div className="orders">
      <div className="orders__topbar">
        <div>
          <h1 className="orders__topbar-title">MY ORDERS</h1>
          {phone && <p className="orders__topbar-phone">Orders placed with +91 {phone}</p>}
        </div>
        <button onClick={handleSignOut} className="orders__signout-btn" title="Sign Out">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="orders__empty">
          <div className="orders__empty-icon">
            <Package size={48} strokeWidth={1} />
          </div>
          <h2>No orders found</h2>
          <p>We couldn't find any orders placed with +91 {phone}.</p>
          <Link href="/catalogue" className="orders__cta">
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders__list">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status, order.fulfillmentStatus);
            const isDelivered =
              (order.status || '').toUpperCase() === 'DELIVERED' ||
              (order.fulfillmentStatus || '').toUpperCase() === 'DELIVERED';
            const isCancelled = ['CANCELLED', 'REFUNDED', 'FAILED'].includes(
              (order.status || '').toUpperCase()
            );
            const expectedDelivery = getExpectedDeliveryDate(order.createdAt);
            return (
              <div key={order.id} className="orders__item">
                <div className="orders__item-header">
                  <div>
                    <span className="orders__order-id">
                      Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="orders__item-date">Placed on {formatDate(order.createdAt)}</span>
                    {!isDelivered && !isCancelled && expectedDelivery && (
                      <div className="orders__delivery-badge">
                        <Truck size={13} />
                        <span>
                          Expected delivery by <strong>{expectedDelivery}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`orders__status orders__status--${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="orders__items-preview">
                  {order.items?.map((item, idx) => {
                    const itemImage = (item as any).image || (item.variantInfo as any)?.image;
                    return (
                      <div key={idx} className="orders__item-preview-card">
                        <div className="orders__item-thumb">
                          {itemImage ? (
                            <img src={itemImage} alt={item.name} />
                          ) : (
                            <Package size={20} strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="orders__item-info">
                          <span className="orders__item-title">{item.name}</span>
                          <span className="orders__item-qty">
                            Qty: {item.quantity} • ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="orders__item-footer">
                  <div className="orders__footer-meta">
                    <span className="orders__total-label">Total Amount</span>
                    <span className="orders__total">₹{Number(order.total).toLocaleString('en-IN')}</span>
                    {order.paymentMethod && (
                      <span className="orders__payment-badge">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid'}
                      </span>
                    )}
                  </div>
                  <Link href={`/orders/${order.id}`} className="orders__view">
                    <span>View Details</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
