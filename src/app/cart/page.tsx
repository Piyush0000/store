'use client';

import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import './cart.css';

export default function CartPage() {
  console.log('[PAGE:Cart] Rendering CartPage');

  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity } = useCart();
  console.log('[PAGE:Cart] Cart items:', cartItems.length);
  console.log('[PAGE:Cart] Cart total:', cartTotal);
  console.log('[PAGE:Cart] Cart count:', cartCount);

  const discountAmount = 650;
  const shippingAmount = cartTotal > 499 ? 0 : 49;
  const finalTotal = cartTotal - discountAmount + shippingAmount;

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  if (cartItems.length === 0) {
    console.log('[PAGE:Cart] Cart is empty, showing empty state');
    return (
      <div className="cart">
        <h1 className="cart__title">MY BAG</h1>
        <div className="cart__empty">
          <ShoppingBag size={64} strokeWidth={1} />
          <p className="cart__empty-title">Your bag is empty</p>
          <p className="cart__empty-subtitle">Looks like you haven't added anything yet</p>
          <Link href="/catalogue" className="cart__empty-btn">START SHOPPING</Link>
        </div>
      </div>
    );
  }

  console.log('[PAGE:Cart] Rendering', cartItems.length, 'items');
  console.log('[PAGE:Cart] Shipping:', shippingAmount === 0 ? 'FREE' : formatPrice(shippingAmount));
  console.log('[PAGE:Cart] Final total:', formatPrice(finalTotal > 0 ? finalTotal : 0));

  return (
    <div className="cart">
      <h1 className="cart__title">MY BAG</h1>
      <p className="cart__subtitle">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>

      <div className="cart__layout">
        <div className="cart__items">
          {cartItems.map((item) => (
            <div key={`${item.id}-${JSON.stringify(item.variants || {})}`} className="cart__item">
              <div className="cart__item-image">
                <img src={item.images?.[0] || 'https://via.placeholder.com/120'} alt={item.name} />
              </div>

              <div className="cart__item-details">
                <h3 className="cart__item-name">{item.name}</h3>
                {item.variants && Object.keys(item.variants).length > 0 && (
                  <p className="cart__item-variants">
                    {Object.entries(item.variants).map(([key, val]) => `${key}: ${val}`).join(' | ')}
                  </p>
                )}
                <p className="cart__item-price">{formatPrice(item.price)}</p>

                <div className="cart__item-controls">
                  <div className="cart__quantity">
                    <button
                      className="cart__quantity-btn"
                      onClick={() => {
                        console.log('[PAGE:Cart] Decrement quantity for:', item.id);
                        updateQuantity(item.id, item.variants, item.quantity - 1);
                      }}
                    >
                      −
                    </button>
                    <span className="cart__quantity-value">{item.quantity}</span>
                    <button
                      className="cart__quantity-btn"
                      onClick={() => {
                        console.log('[PAGE:Cart] Increment quantity for:', item.id);
                        updateQuantity(item.id, item.variants, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart__item-remove"
                    onClick={() => {
                      console.log('[PAGE:Cart] Remove item:', item.id);
                      removeFromCart(item.id, item.variants);
                    }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="cart__item-subtotal">
                <span>Subtotal</span>
                <span className="cart__item-subtotal-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="cart__summary">
          <h2 className="cart__summary-title">ORDER SUMMARY</h2>

          <div className="cart__summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>

          <div className="cart__summary-row cart__summary-row--discount">
            <span>Discount (Extra ₹650 off)</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>

          <div className="cart__summary-row cart__summary-row--shipping">
            <span>Shipping</span>
            <span>{shippingAmount === 0 ? 'FREE' : formatPrice(shippingAmount)}</span>
          </div>

          <div className="cart__summary-divider" />

          <div className="cart__summary-row cart__summary-row--total">
            <span>Total</span>
            <span>{formatPrice(finalTotal > 0 ? finalTotal : 0)}</span>
          </div>

          <div className="cart__promo-input">
            <input type="text" placeholder="Promo code" />
            <button className="cart__promo-btn">APPLY</button>
          </div>

          <Link href="/checkout" className="cart__checkout-btn">
            PROCEED TO CHECKOUT
          </Link>

          <Link href="/catalogue" className="cart__continue-btn">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}