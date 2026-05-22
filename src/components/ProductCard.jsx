import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
          src={product.image}
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

        {product.rating && (
          <div className="product-card__rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < Math.floor(product.rating) ? '#c9a84c' : 'none'}
                stroke="#c9a84c"
                strokeWidth={1.5}
              />
            ))}
            <span className="product-card__rating-count">({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="product-card__prices">
          <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="product-card__original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <button className="product-card__add-btn" onClick={handleAddToCart}>
          ADD TO CART
        </button>
      </div>
    </div>
  );
}