import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import './Orders.css';

export default function Orders() {
  return (
    <div className="orders">
      <h1 className="orders__title">My Orders</h1>

      <div className="orders__empty">
        <Package size={64} strokeWidth={1} />
        <p>No orders yet</p>
        <Link to="/catalogue" className="orders__empty-link">Start Shopping</Link>
      </div>
    </div>
  );
}