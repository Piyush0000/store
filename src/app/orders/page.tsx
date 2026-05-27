'use client';

import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import './orders.css';

export default function OrdersPage() {
  // TODO: Implement orders with API (requires authentication)
  const orders: any[] = [];

  return (
    <div className="orders">
      <div className="orders__header">
        <h1>MY ORDERS</h1>
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
                <span className="orders__order-id">Order #{order.id}</span>
                <span className="orders__status">{order.status}</span>
              </div>
              <div className="orders__item-details">
                <span>{order.date}</span>
                <span className="orders__total">₹{order.total}</span>
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