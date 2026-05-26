'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import ProductCard from '@/components/ProductCard';
import './product.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  category: string;
  averageRating: number;
  reviewCount: number;
  variants: any[];
  reviews: any[];
}

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

const heroSlides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80' },
  { id: 2, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1400&q=80' },
];

const brandCategories = [
  { name: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
  { name: 'NECKLACE', path: '/catalogue?category=necklace', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { name: 'EARRINGS', path: '/catalogue?category=earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
];

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (product.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const displayPrice = selectedVariant?.price || product.price;
  const originalPrice = product.compareAtPrice || null;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      images: product.images,
    }, quantity, selectedVariant?.options || {});
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      images: product.images,
    }, quantity, selectedVariant?.options || {});
    setTimeout(() => { window.location.href = '/cart'; }, 500);
  };

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill={i < Math.floor(rating) ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth={1.5} />
    ));

  const variantOptionKeys = product.variants?.length > 0
    ? [...new Set(product.variants.flatMap(v => Object.keys(v.options || {})))]
    : [];

  const getOptionValues = (key: string) =>
    [...new Set(product.variants.map(v => v.options?.[key]).filter(Boolean))];

  const handleOptionChange = (key: string, value: string) => {
    const match = product.variants.find((v: any) =>
      v.options?.[key] === value &&
      Object.keys(selectedVariant?.options || {})
        .filter(k => k !== key)
        .every(k => v.options?.[k] === selectedVariant?.options?.[k])
    );
    if (match) setSelectedVariant(match);
  };

  return (
    <div className="home">
      <section className="hero-carousel">
        <div className="hero-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroSlides.map((slide) => (
            <div key={slide.id} className="hero-carousel__slide">
              <img src={slide.image} alt="" className="hero-carousel__image" />
              <div className="hero-carousel__content">
                <h1>Premium Jewellery Collection</h1>
                <p>Handcrafted with love and precision</p>
                <a href="/catalogue" className="hero-carousel__cta">Shop Now</a>
              </div>
            </div>
          ))}
        </div>
        <button className="hero-carousel__nav hero-carousel__nav--prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>
        <button className="hero-carousel__nav hero-carousel__nav--next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>
        <div className="hero-carousel__dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel__dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="brand-category">
        <h2 className="section-title">BRAND CATEGORY</h2>
        <div className="brand-category__grid">
          {brandCategories.map((cat) => (
            <a key={cat.name} href={cat.path} className="brand-category__item">
              <div className="brand-category__image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="brand-category__name">{cat.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="shop-category">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div className="shop-category__grid">
          {brandCategories.map((cat) => (
            <a key={`shop-${cat.name}`} href={cat.path} className="shop-category__card">
              <img src={cat.image} alt={cat.name} className="shop-category__image" />
              <div className="shop-category__overlay">
                <span className="shop-category__name">{cat.name}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="product-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="product-page__container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <div className="product-page__gallery" style={{ position: 'sticky', top: '120px', alignSelf: 'start' }}>
            <div className="product-page__main-image">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'}
                alt={product.name}
                style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '4px' }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="product-page__thumbnails">
                {product.images.map((img, index) => (
                  <button key={index} className="product-page__thumb">
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-page__info">
            <span className="product-page__brand">Swarajya Imperial</span>
            <h1 className="product-page__title">{product.name}</h1>

            <div className="product-page__rating">
              {renderStars(product.averageRating || 0)}
              <span className="product-page__rating-count">
                {product.averageRating || 0} | {product.reviewCount || 0} reviews
              </span>
            </div>

            <div className="product-page__pricing">
              <span className="product-page__price">₹{displayPrice?.toLocaleString('en-IN')}</span>
              {originalPrice && (
                <>
                  <span className="product-page__original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                  <span className="product-page__discount">{discount}% OFF</span>
                </>
              )}
            </div>

            {variantOptionKeys.length > 0 && (
              <div className="product-page__variants">
                {variantOptionKeys.map(key => (
                  <div key={key} className="product-page__variant-group">
                    <label>
                      {key.charAt(0).toUpperCase() + key.slice(1)}: <strong>{selectedVariant?.options?.[key]}</strong>
                    </label>
                    <div className="product-page__variant-options">
                      {getOptionValues(key).map(value => (
                        <button
                          key={value}
                          className={`product-page__variant-btn ${selectedVariant?.options?.[key] === value ? 'active' : ''}`}
                          onClick={() => handleOptionChange(key, value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedVariant && (
                  <p className="product-page__variant-stock">
                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
            )}

            <div className="product-page__quantity">
              <label>Quantity:</label>
              <div className="product-page__quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="product-page__actions">
              <button className="product-page__add-cart" onClick={handleAddToCart}>
                <ShoppingBag size={16} />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button className="product-page__buy-now" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <button className="product-page__wishlist">
              <Heart size={16} /> Add to Wishlist
            </button>

            <div className="product-page__benefits">
              <div className="product-page__benefit"><Truck size={16} /><span>Free Delivery on orders ₹499+</span></div>
              <div className="product-page__benefit"><Shield size={16} /><span>100% Authentic</span></div>
              <div className="product-page__benefit"><RotateCcw size={16} /><span>7-Day Easy Returns</span></div>
            </div>

            <p className="product-page__promo">Extra ₹650 off at checkout</p>
          </div>
        </div>

        <div className="product-page__tabs">
          <button className={`product-page__tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`product-page__tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({product.reviewCount || 0})</button>
          <button className={`product-page__tab ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>Shipping</button>
        </div>

        <div className="product-page__tab-content">
          {activeTab === 'description' && (
            <div className="product-page__description">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="product-page__reviews">
              {product.reviews?.length === 0 ? (
                <p className="product-page__no-reviews">No reviews yet. Be the first!</p>
              ) : (
                product.reviews?.map((review: any) => (
                  <div key={review.id} className="product-page__review">
                    <div className="product-page__review-header">
                      <span className="product-page__review-name">{review.userName}</span>
                    </div>
                    <div className="product-page__review-rating">
                      {renderStars(review.rating)}
                      <span>{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <strong>{review.title}</strong>
                    <p className="product-page__review-text">{review.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="product-page__shipping-info">
              <h3>Shipping Information</h3>
              <ul>
                <li>Free shipping on orders above ₹499</li>
                <li>Standard delivery: 5-7 business days</li>
                <li>Express delivery: 2-3 business days</li>
                <li>Orders are processed within 24 hours</li>
                <li>Track your order in real-time</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="featured-collection">
          <h2 className="section-title">YOU MAY ALSO LIKE</h2>
          <div className="featured-collection__grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}