'use client';

import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/components/WishlistProvider';
import { useCart } from '@/components/CartProvider';
import './wishlist.css';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isHydrated } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="wishlist">
      <div className="wishlist__header">
        <h1>MY WISHLIST</h1>
        <span className="wishlist__count">
          {isHydrated ? wishlistItems.length : 0} items
        </span>
      </div>

      {isHydrated && wishlistItems.length === 0 ? (
        <div className="wishlist__empty">
          <Heart size={48} strokeWidth={1} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon on any product.</p>
          <Link href="/catalogue" className="wishlist__cta">
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist__grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist__item">
              <button
                className="wishlist__remove"
                onClick={() => removeFromWishlist(item.id)}
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <Trash2 size={16} />
              </button>
              {item.images?.[0] && (
                <img src={item.images[0]} alt={item.name} />
              )}
              <div className="wishlist__item-info">
                <h3>{item.name}</h3>
                <span className="wishlist__price">₹{Number(item.price).toLocaleString('en-IN')}</span>
                <button
                  className="wishlist__add-cart"
                  onClick={() =>
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      images: item.images,
                      variantId: item.variantId,
                    })
                  }
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}