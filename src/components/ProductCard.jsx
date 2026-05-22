import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
        <div className="product-card__overlay">
          <button className="product-card__quick-btn" aria-label="Quick add to cart">
            <ShoppingBag size={16} />
            <span>Quick Add</span>
          </button>
        </div>
      </Link>

      <button
        className={`product-card__heart ${liked ? 'product-card__heart--active' : ''}`}
        onClick={() => setLiked(!liked)}
        aria-label="Add to wishlist"
      >
        <Heart size={16} fill={liked ? '#C0392B' : 'none'} stroke={liked ? '#C0392B' : 'currentColor'} />
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
                fill={i < Math.floor(product.rating) ? '#C9A84C' : 'none'}
                stroke="#C9A84C"
                strokeWidth={1.5}
              />
            ))}
            <span className="product-card__rating-count">({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="product-card__prices">
          <span className="product-card__price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="product-card__original-price">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
