import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import './wishlist.css';

export default function WishlistPage() {
  // TODO: Implement wishlist with localStorage or API
  const wishlistItems: any[] = [];

  return (
    <div className="wishlist">
      <div className="wishlist__header">
        <h1>MY WISHLIST</h1>
        <span className="wishlist__count">{wishlistItems.length} items</span>
      </div>

      {wishlistItems.length === 0 ? (
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
              <button className="wishlist__remove">
                <Trash2 size={16} />
              </button>
              <img src={item.image} alt={item.name} />
              <div className="wishlist__item-info">
                <h3>{item.name}</h3>
                <span className="wishlist__price">₹{item.price}</span>
                <button className="wishlist__add-cart">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}