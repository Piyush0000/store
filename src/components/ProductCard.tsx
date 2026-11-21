'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';
import { isVideoUrl } from '@/lib/media-type';
import { availableStock, isOutOfStock } from '@/lib/stock';
import type { StorefrontVariant } from '@/lib/product-variants';
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
  stock?: number;
  variants?: StorefrontVariant[];
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  // Above-the-fold cards start immediately in view; below-the-fold cards load on scroll
  const [inView, setInView] = useState(() => priority);
  const [imgLoaded, setImgLoaded] = useState(() => priority);
  const [imgError, setImgError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState<Set<number>>(() => new Set([0]));
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { addToCart, openVariantPicker } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  // Viewport intersection observer: detects when card scrolls into view
  useEffect(() => {
    if (inView) return;
    const el = cardRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '60px 0px 20px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'];

  const originalPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const rating = product.averageRating || 0;
  const numericPrice = Number(product.price);
  const discount = originalPrice && numericPrice && originalPrice > numericPrice
    ? Math.round(((originalPrice - numericPrice) / originalPrice) * 100)
    : 0;

  // Once in view, check cached decode or trigger safety reveal
  useEffect(() => {
    if (!inView) return;

    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
      return;
    }

    // Safety timeout ensures no card ever stays stuck in skeleton state
    const timer = setTimeout(() => {
      setImgLoaded(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [inView, currentImageIndex]);

  const handleImageLoad = () => {
    setImgLoaded(true);
  };

  const handleImageError = () => {
    setImgError(true);
    setImgLoaded(true);
  };

  const handleMouseEnter = () => {
    if (images.length <= 1) return;
    setLoadedSlideIndexes(previous => new Set([...previous, 1]));
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1500);
  };

  useEffect(() => {
    if (currentImageIndex === 0 || images.length <= 1) return;
    const nextIndex = (currentImageIndex + 1) % images.length;
    setLoadedSlideIndexes(previous => previous.has(nextIndex)
      ? previous
      : new Set([...previous, nextIndex]));
  }, [currentImageIndex, images.length]);

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

  const stockLeft = availableStock(product);
  const lowStock = stockLeft > 0 && stockLeft < 100;
  const outOfStock = isOutOfStock(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (product.variants?.length) {
      openVariantPicker(product);
      return;
    }
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
      variants: product.variants,
    });
  };

  return (
    <div ref={cardRef} className="product-card scroll-fade-up">
      <Link 
        href={`/product/${product.slug || product.id}`} 
        prefetch
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
          {images.map((img, index) => {
            const isFirst = index === 0;
            const isEager = priority && isFirst;
            const src = imgError && isFirst ? 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' : img;
            const shouldLoad = isFirst ? inView : loadedSlideIndexes.has(index);
            if (isVideoUrl(src)) {
              return (
                <div key={index} style={{ position: 'relative', flex: '0 0 100%', width: '100%', height: '100%' }}>
                  <video
                    src={shouldLoad ? src : undefined}
                    className={`product-card__slider-image ${imgLoaded ? 'loaded' : ''}`}
                    muted
                    playsInline
                    loop
                    preload={isFirst ? "metadata" : "none"}
                    onLoadedMetadata={isFirst ? () => setImgLoaded(true) : undefined}
                    onError={isFirst ? handleImageError : undefined}
                  />
                </div>
              );
            }
            return (
              <div key={index} style={{ position: 'relative', flex: '0 0 100%', width: '100%', height: '100%' }}>
                {shouldLoad && (
                  <Image
                    ref={isFirst ? imgRef : undefined}
                    src={src}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    quality={75}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`product-card__slider-image ${imgLoaded ? 'loaded' : ''}`}
                    onLoad={isFirst ? handleImageLoad : undefined}
                    onError={isFirst ? handleImageError : undefined}
                    priority={isEager}
                    loading={isEager ? undefined : "lazy"}
                  />
                )}
              </div>
            );
          })}
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
          <button
            className="product-card__quick-btn"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            <ShoppingBag size={14} />
            {outOfStock ? "Out of stock" : "Quick Add"}
          </button>
        </div>
      </Link>

      <button
        className={`product-card__heart ${liked ? 'product-card__heart--active' : ''}`}
        onClick={handleWishlistToggle}
        aria-label="Add to wishlist"
      >
        <Heart size={16} fill={liked ? '#c9a84c' : 'none'} stroke={liked ? '#c9a84c' : 'currentColor'} />
      </button>

      <div className="product-card__info">
        <Link href={`/product/${product.slug || product.id}`} prefetch className="product-card__name">
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
          <span className="product-card__price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="product-card__original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        {lowStock ? <p className="product-card__low-stock">Low stock</p> : null}

        <button
          className="product-card__add-btn"
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
        {outOfStock ? (
          <p className="product-card__out-of-stock">This is out of stock</p>
        ) : null}
      </div>
    </div>
  );
}
