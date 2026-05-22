import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  return (
    <div className="cart">
      <h1 className="cart__title">Shopping Bag</h1>

      <div className="cart__layout">
        <div className="cart__items">
          {/* Empty state */}
          <div className="cart__empty">
            <ShoppingBag size={64} strokeWidth={1} />
            <p>Your bag is empty</p>
            <Link to="/catalogue" className="cart__empty-link">Continue Shopping</Link>
          </div>
        </div>

        <div className="cart__summary">
          <h2>Order Summary</h2>
          <div className="cart__summary-row">
            <span>Subtotal</span>
            <span>₹0</span>
          </div>
          <div className="cart__summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cart__summary-row cart__summary-row--total">
            <span>Total</span>
            <span>₹0</span>
          </div>
          <button className="cart__checkout-btn">Proceed to Checkout</button>
          <p className="cart__promo">Extra ₹650 off on orders above ₹499</p>
        </div>
      </div>
    </div>
  );
}