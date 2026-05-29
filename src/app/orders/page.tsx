'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { validateSession } from '@/actions/otp-actions';
import { getOrdersByUser } from '@/actions/order-actions';
import { getUserByPhone } from '@/actions/user-actions';
import './orders.css';

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

  useEffect(() => {
    const fetchOrders = async () => {
      // Check session
      const session = await validateSession();
      if (!session.valid || !session.phone) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setPhone(session.phone);

      // Get user and fetch orders
      const userResult = await getUserByPhone(session.phone);
      if (!userResult.success || !userResult.data) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const ordersResult = await getOrdersByUser(userResult.data.id);
      if (ordersResult.success) {
        setOrders((ordersResult.data as any) || []);
      } else {
        setOrders([]);
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'confirmed' || s === 'delivered') return 'success';
    if (s === 'cancelled' || s === 'refunded') return 'error';
    if (s === 'shipped') return 'info';
    return 'pending';
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

  if (!isAuthenticated) {
    return (
      <div className="orders">
        <div className="orders__header">
          <h1>MY ORDERS</h1>
        </div>
        <div className="orders__empty">
          <div className="orders__empty-icon">
            <Package size={48} strokeWidth={1} />
          </div>
          <h2>Sign in to view your orders</h2>
          <p>Please verify your phone number to see your order history.</p>
          <Link href="/checkout" className="orders__cta">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders__header">
        <h1>MY ORDERS</h1>
        {phone && <span className="orders__phone">+91 {phone}</span>}
      </div>

      {orders.length === 0 ? (
        <div className="orders__empty">
          <div className="orders__empty-icon">
            <Package size={48} strokeWidth={1} />
          </div>
          <h2>No orders yet</h2>
          <p>When you place an order, it will appear here.</p>
          <Link href="/catalogue" className="orders__cta">
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders__list">
          {orders.map((order) => (
            <div key={order.id} className="orders__item">
              <div className="orders__item-header">
                <span className="orders__order-id">Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}</span>
                <span className={`orders__status orders__status--${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="orders__item-details">
                <span>{formatDate(order.createdAt)}</span>
                <span className="orders__payment">{order.paymentMethod}</span>
                <span className="orders__total">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
              <div className="orders__items-preview">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="orders__item-name">
                    {item.quantity}x {item.name}
                  </span>
                ))}
                {order.items?.length > 3 && (
                  <span className="orders__more-items">+{order.items.length - 3} more</span>
                )}
              </div>
              <Link href={`/orders/${order.id}`} className="orders__view">
                View Details <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}