'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CreditCard, Banknote, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { validateSession } from '@/actions/otp-actions';
import { getOrderById } from '@/actions/order-actions';
import { getUserByPhone } from '@/actions/user-actions';
import './order-detail.css';

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
  paymentMethod: string;
  total: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: any;
  items: OrderItem[];
  payuTxnId?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // Validate session first
      const session = await validateSession();
      if (!session.valid || !session.phone) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Get user to verify ownership
      const userResult = await getUserByPhone(session.phone);
      if (!userResult.success || !userResult.data) {
        setError('Unable to load order');
        setIsLoading(false);
        return;
      }

      // Fetch the order
      const orderResult = await getOrderById(orderId);
      if (!orderResult.success || !orderResult.data) {
        setError('Order not found');
        setIsLoading(false);
        return;
      }

      // Verify order belongs to this user
      const orderData = orderResult.data as any;
      if (orderData.userId !== userResult.data.id) {
        setError('Order not found');
        setIsLoading(false);
        return;
      }

      setOrder(orderData);
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    const s = status?.toLowerCase() || '';
    const statusMap: Record<string, { label: string; icon: any; className: string }> = {
      pending: { label: 'Order Placed', icon: Clock, className: 'pending' },
      confirmed: { label: 'Confirmed', icon: CheckCircle2, className: 'confirmed' },
      shipped: { label: 'Shipped', icon: Truck, className: 'shipped' },
      delivered: { label: 'Delivered', icon: Package, className: 'delivered' },
      cancelled: { label: 'Cancelled', icon: XCircle, className: 'cancelled' },
      refunded: { label: 'Refunded', icon: XCircle, className: 'refunded' },
    };
    return statusMap[s] || { label: status, icon: Clock, className: 'pending' };
  };

  if (isLoading) {
    return (
      <div className="order-detail">
        <div className="order-detail__loading">
          <div className="order-detail__spinner" />
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="order-detail">
        <div className="order-detail__error">
          <XCircle size={48} strokeWidth={1.5} />
          <h2>Sign in required</h2>
          <p>Please verify your phone number to view order details.</p>
          <Link href="/checkout" className="order-detail__btn order-detail__btn--primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail">
        <div className="order-detail__error">
          <XCircle size={48} strokeWidth={1.5} />
          <h2>Order not found</h2>
          <p>{error || 'This order does not exist or has been removed.'}</p>
          <Link href="/orders" className="order-detail__btn order-detail__btn--secondary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="order-detail">
      <div className="order-detail__header">
        <Link href="/orders" className="order-detail__back">
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="order-detail__title-section">
        <h1>ORDER DETAILS</h1>
        <p className="order-detail__order-number">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
      </div>

      {/* Status Card */}
      <div className={`order-detail__status-card order-detail__status-card--${statusInfo.className}`}>
        <div className="order-detail__status-icon">
          <StatusIcon size={24} />
        </div>
        <div className="order-detail__status-info">
          <span className="order-detail__status-label">{statusInfo.label}</span>
          <span className="order-detail__status-date">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      <div className="order-detail__grid">
        {/* Items Section */}
        <div className="order-detail__section order-detail__section--full">
          <h2 className="order-detail__section-title">Items Ordered</h2>
          <div className="order-detail__items">
            {order.items?.map((item, index) => (
              <div key={index} className="order-detail__item">
                <div className="order-detail__item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <Package size={32} strokeWidth={1} />
                  )}
                </div>
                <div className="order-detail__item-info">
                  <span className="order-detail__item-name">{item.name}</span>
                  <span className="order-detail__item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="order-detail__item-price">
                  ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-detail__section">
          <h2 className="order-detail__section-title">Order Summary</h2>
          <div className="order-detail__summary-rows">
            <div className="order-detail__summary-row">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal || order.total).toLocaleString('en-IN')}</span>
            </div>
            {(order.discountAmount ?? 0) > 0 && (
              <div className="order-detail__summary-row order-detail__summary-row--discount">
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="order-detail__summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="order-detail__summary-divider" />
            <div className="order-detail__summary-row order-detail__summary-row--total">
              <span>Total</span>
              <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="order-detail__section">
          <h2 className="order-detail__section-title">Payment</h2>
          <div className="order-detail__payment-info">
            <div className="order-detail__payment-method">
              {order.paymentMethod === 'COD' ? (
                <><Banknote size={20} /><span>Cash on Delivery</span></>
              ) : (
                <><CreditCard size={20} /><span>Online Payment</span></>
              )}
            </div>
            <div className="order-detail__payment-status">
              <span>Status: </span>
              <span className={`order-detail__payment-badge order-detail__payment-badge--${order.paymentStatus?.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.payuTxnId && (
              <p className="order-detail__txn-id">Transaction ID: {order.payuTxnId}</p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="order-detail__section order-detail__section--full">
          <h2 className="order-detail__section-title">Shipping Address</h2>
          <div className="order-detail__address">
            <p className="order-detail__address-name">{order.customerName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
            {order.shippingAddress?.phone && (
              <p className="order-detail__address-phone">+91 {order.shippingAddress.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="order-detail__actions">
        <Link href="/catalogue" className="order-detail__btn order-detail__btn--primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}