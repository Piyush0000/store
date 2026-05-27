'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`cart-overlay ${isAnimating ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`cart-drawer ${isAnimating ? 'open' : ''}`}>
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <ShoppingBag size={20} />
            <span>Your Cart ({cartItems.length})</span>
          </div>
          <button
            className="cart-drawer__close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer__content">
          {cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <Link href="/catalogue" className="cart-drawer__browse-btn" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__items">
              {cartItems.map((item) => (
                <li key={`${item.id}-${JSON.stringify(item.variants || {})}`} className="cart-item">
                  <div className="cart-item__image">
                    <Image
                      src={item.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="cart-item__details">
                    <Link
                      href={`/product/${item.id}`}
                      className="cart-item__name"
                      onClick={() => setIsCartOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className="cart-item__variants">
                        {Object.entries(item.variants).map(([key, value]) => (
                          <span key={key}>{value}</span>
                        ))}
                      </p>
                    )}
                    <div className="cart-item__bottom">
                      <div className="cart-item__quantity">
                        <button
                          onClick={() => updateQuantity(item.id, item.variants, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variants, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="cart-item__price">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.id, item.variants)}
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <p className="cart-drawer__shipping">Shipping calculated at checkout</p>
            <Link href="/checkout" className="cart-drawer__checkout-btn" onClick={() => setIsCartOpen(false)}>
              Proceed to Checkout
            </Link>
            <Link href="/cart" className="cart-drawer__view-cart" onClick={() => setIsCartOpen(false)}>
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
