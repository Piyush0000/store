'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, XCircle } from 'lucide-react';
import { confirmAndSyncPayUOrder } from '@/actions/order-actions';
import { completeCartSession } from '@/actions/cart-actions';
import { useCart } from '@/components/CartProvider';
import { useAnalytics } from '@/components/AnalyticsProvider';
import OrderSuccessAnimation from '@/components/OrderSuccessAnimation';
import '../checkout.css';

export default function SuccessClient() {
  const { track } = useAnalytics();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txn');
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handledOrderRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!orderId) {
      setError('We could not verify your order. Please check your orders or contact support.');
      setLoading(false);
      return;
    }

    confirmAndSyncPayUOrder(orderId, txnId || '')
      .then(res => {
        if (cancelled) return;
        if (!res.success || !res.data || res.data.paymentStatus !== 'PAID') {
          setError('We could not confirm your payment yet. Please check your orders before trying again.');
          return;
        }

        setOrder(res.data);
        clearCart();
        const activeCartId = sessionStorage.getItem('active_cart_id');
        if (activeCartId) {
          completeCartSession(activeCartId).catch(console.error);
          sessionStorage.removeItem('active_cart_id');
        }

        if (handledOrderRef.current !== orderId) {
          handledOrderRef.current = orderId;
          try {
            track('Purchase', {
              content_ids: res.data.items?.map((item: any) => item.productId || item.id) || [],
              value: Number(res.data.total),
              currency: 'INR',
              transaction_id: txnId || orderId,
            });
          } catch (e) {
            console.warn('[Analytics] Failed to track Purchase:', e);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError('We could not confirm your payment yet. Please check your orders before trying again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [orderId, txnId, clearCart, track]);



  if (loading) {
    return (
      <div className="checkout__success-wrapper">
        <Loader2 size={48} className="checkout__loading-spinner" />
      </div>
    );
  }

  return (
    <div className="checkout__success-wrapper">
      {error ? (
        <div className="checkout__success-card checkout__success-card--error">
          <XCircle size={48} aria-hidden="true" />
          <h1 className="checkout__success-title">Order confirmation unavailable</h1>
          <p className="checkout__success-subtitle">{error}</p>
          <Link href="/orders" className="checkout__btn-primary">Check My Orders</Link>
        </div>
      ) : order ? (
        <OrderSuccessAnimation
          orderId={order.id || orderId}
          paymentMethod={order.paymentMethod === "PARTIAL" ? "Partial payment" : order.paymentMethod}
          amount={Number(order.total)}
          prepaidAmount={Number(order.shippingAddress?.partialPayment?.prepaidAmount) || undefined}
          codDue={Number(order.shippingAddress?.partialPayment?.codDue) || undefined}
          orderHref={`/orders/${encodeURIComponent(order.id || orderId!)}`}
        />
      ) : null}
    </div>
  );
}
