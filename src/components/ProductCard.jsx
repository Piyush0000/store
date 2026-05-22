import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart } = useCart();

  // API: product.images[] not product.image
  const image = product.images?.[0] || '';

  // API: product.compareAtPrice not product.originalPrice
  const originalPrice = product.compareAtPrice || product.originalPrice || null;

  // API: product.averageRating not product.rating
  const rating = product.averageRating || product.rating || 0;

  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`} className="product-card__image-wrap">
        {!imgLoaded && <div className="product-card__skeleton" />}
        <img
          src={image}
          alt={product.name}
          className={`product-card__image ${imgLoaded ? 'loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {discount > 0 && (
          <span className="product-card__badge">{discount}% OFF</span>
        )}
      </Link>

      <button
        className={`product-card__heart ${liked ? 'product-card__heart--active' : ''}`}
        onClick={() => setLiked(!liked)}
        aria-label="Add to wishlist"
      >
        <Heart size={16} fill={liked ? '#c9a84c' : 'none'} stroke={liked ? '#c9a84c' : 'currentColor'} />
      </button>

      <div className="product-card__info">
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        {rating > 0 && (
          <div className="product-card__rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < Math.floor(rating) ? '#c9a84c' : 'none'}
                stroke="#c9a84c"
                strokeWidth={1.5}
              />
            ))}
            <span className="product-card__rating-count">({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="product-card__prices">
          <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="product-card__original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <button className="product-card__add-btn" onClick={handleAddToCart}>
          ADD TO CART
        </button>
      </div>
    </div>
  );
}