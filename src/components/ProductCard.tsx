'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import './ProductCard.css';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  averageRating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'];

  const originalPrice = product.compareAtPrice || null;
  const rating = product.averageRating || 0;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  const handleMouseEnter = () => {
    if (images.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
    }, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    });
  };

  return (
    <div className="product-card">
      <a 
        href={`/product/${product.slug || product.id}`} 
        className="product-card__image-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!imgLoaded && <div className="product-card__skeleton" />}
        <div 
          className="product-card__image-slider"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.name} - Image ${index + 1}`}
              className={`product-card__slider-image ${imgLoaded ? 'loaded' : ''}`}
              onLoad={index === 0 ? () => setImgLoaded(true) : undefined}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
        {images.length > 1 && (
          <div className="product-card__slider-dots">
            {images.map((_, idx) => (
              <span 
                key={idx} 
                className={`product-card__slider-dot ${idx === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        {discount > 0 && (
          <span className="product-card__badge">{discount}% OFF</span>
        )}
        <div className="product-card__overlay">
          <button className="product-card__quick-btn" onClick={handleAddToCart}>
            <ShoppingBag size={14} /> Quick Add
          </button>
        </div>
      </a>

      <button
        className={`product-card__heart ${liked ? 'product-card__heart--active' : ''}`}
        onClick={handleWishlistToggle}
        aria-label="Add to wishlist"
      >
        <Heart size={16} fill={liked ? '#c9a84c' : 'none'} stroke={liked ? '#c9a84c' : 'currentColor'} />
      </button>

      <div className="product-card__info">
        <a href={`/product/${product.slug || product.id}`} className="product-card__name">
          {product.name}
        </a>

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