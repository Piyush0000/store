import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './Wishlist.css';

export default function Wishlist() {
  return (
    <div className="wishlist">
      <h1 className="wishlist__title">My Wishlist</h1>

      <div className="wishlist__empty">
        <Heart size={64} strokeWidth={1} />
        <p>Your wishlist is empty</p>
        <Link to="/catalogue" className="wishlist__empty-link">Browse Products</Link>
      </div>
    </div>
  );
}