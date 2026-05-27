'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Truck, ArrowRight, Loader2, Package } from 'lucide-react';
import { getOrderById } from '@/actions/order-actions';
import { useCart } from '@/components/CartProvider';
import '../checkout.css';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txn');
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then(res => {
          if (res.success && res.data) setOrder(res.data);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    clearCart();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="checkout__success-wrapper">
        <Loader2 size={48} className="checkout__loading-spinner" />
      </div>
    );
  }

  return (
    <div className="checkout__success-wrapper">
      <div className="checkout__success-card">
        <div className="checkout__success-icon-wrapper">
          <CheckCircle2 size={48} className="checkout__success-icon" />
        </div>

        <h1 className="checkout__success-title">Order Confirmed!</h1>
        <p className="checkout__success-subtitle">
          Thank you for your purchase. Your order is being processed and will ship soon.
        </p>

        {orderId && (
          <div className="checkout__success-order-info">
            <div className="checkout__success-info-row">
              <span>Order ID</span>
              <span className="checkout__success-order-id">{orderId}</span>
            </div>
            {order && (
              <>
                <div className="checkout__success-info-row">
                  <span>Amount Paid</span>
                  <span>₹{Number(order.total)?.toLocaleString()}</span>
                </div>
                <div className="checkout__success-info-row">
                  <span>Payment</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="checkout__success-delivery-info">
          <Truck size={18} />
          <span>Expected delivery in 3-5 business days</span>
        </div>

        <div className="checkout__success-actions">
          <Link href="/catalogue" className="checkout__btn-primary">
            Continue Shopping <ArrowRight size={16} />
          </Link>
          <Link href="/orders" className="checkout__btn-secondary">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}