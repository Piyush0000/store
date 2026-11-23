'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState<Set<number>>(() => new Set([0]));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const productHref = `/product/${product.slug || product.id}`;
  const handlePrefetch = () => {
    try {
      router.prefetch(productHref);
    } catch {}
  };

  const { addToCart, openVariantPicker } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'];

  const originalPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const rating = product.averageRating || 0;
  const numericPrice = Number(product.price);
  const discount = originalPrice && numericPrice && originalPrice > numericPrice
    ? Math.round(((originalPrice - numericPrice) / originalPrice) * 100)
    : 0;

  // Handle cached image or decoding check on mount and image index switch
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    let isMounted = true;

    if (img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    } else if (typeof img.decode === 'function') {
      img.decode()
        .then(() => {
          if (isMounted) setImgLoaded(true);
        })
        .catch(() => {
          // Fallback to onLoad event if decode fails
        });
    }

    return () => {
      isMounted = false;
    };
  }, [currentImageIndex, images]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (typeof target.decode === 'function') {
      target.decode()
        .then(() => {
          setImgLoaded(true);
        })
        .catch(() => {
          setImgLoaded(true);
        });
    } else {
      setImgLoaded(true);
    }
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
    <div className="product-card">
      <Link 
        href={productHref} 
        prefetch={false}
        onClick={() => { try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch {} }}
        onPointerEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
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
            const shouldLoad = loadedSlideIndexes.has(index);
            if (isVideoUrl(src)) {
              return (
                <video
                  key={index}
                  src={shouldLoad ? src : undefined}
                  className={`product-card__slider-image ${imgLoaded ? 'loaded' : ''}`}
                  muted
                  playsInline
                  loop
                  preload={isFirst ? "metadata" : "none"}
                  onLoadedMetadata={isFirst ? () => setImgLoaded(true) : undefined}
                  onError={isFirst ? handleImageError : undefined}
                />
              );
            }
            return (
              <img
                key={index}
                ref={isFirst ? imgRef : undefined}
                src={shouldLoad ? src : undefined}
                alt={`${product.name} - Image ${index + 1}`}
                className={`product-card__slider-image ${imgLoaded ? 'loaded' : ''}`}
                onLoad={isFirst ? handleImageLoad : undefined}
                onError={isFirst ? handleImageError : undefined}
                loading={isEager ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                {...(isEager ? { fetchPriority: "high" as const } : {})}
              />
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
        <Link 
          href={productHref} 
          prefetch={false}
          onClick={() => { try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch {} }}
          onPointerEnter={handlePrefetch}
          onTouchStart={handlePrefetch}
          className="product-card__name"
        >
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
