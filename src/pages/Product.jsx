import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProduct, submitReview } from '../lib/api';
import { useCart } from '../context/CartContext';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({ userName: '', userEmail: '', rating: 5, title: '', content: '' });
  const [reviewStatus, setReviewStatus] = useState('idle'); // idle | loading | success | error
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProduct(id);
        setProduct(data);
        // API: variants is an array — pre-select first variant
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-page__container">
          <div className="product-page__gallery">
            <div className="product-page__main-image skeleton" />
            <div className="product-page__thumbnails skeleton" />
          </div>
          <div className="product-page__info skeleton" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <Link to="/catalogue">Back to Catalogue</Link>
      </div>
    );
  }

  // API: product.compareAtPrice (not product.originalPrice)
  const originalPrice = product.compareAtPrice || null;
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  // Use selected variant price if available
  const displayPrice = selectedVariant?.price || product.price;

  const handleAddToCart = () => {
    addToCart({ ...product, price: displayPrice }, quantity, selectedVariant?.options || {});
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, price: displayPrice }, quantity, selectedVariant?.options || {});
    setTimeout(() => { window.location.href = '/cart'; }, 500);
  };

  const nextImage = () => setSelectedImage(prev => (prev + 1) % product.images.length);
  const prevImage = () => setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill={i < Math.floor(rating) ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth={1.5} />
    ));

  // API: variants is [{ id, name, sku, price, stock, options: { size, color } }]
  // Group variants by option keys for display
  const variantOptionKeys = product.variants?.length > 0
    ? [...new Set(product.variants.flatMap(v => Object.keys(v.options || {})))]
    : [];

  const getOptionValues = (key) =>
    [...new Set(product.variants.map(v => v.options?.[key]).filter(Boolean))];

  const handleOptionChange = (key, value) => {
    const match = product.variants.find(v =>
      v.options?.[key] === value &&
      Object.keys(selectedVariant?.options || {})
        .filter(k => k !== key)
        .every(k => v.options?.[k] === selectedVariant?.options?.[k])
    );
    if (match) setSelectedVariant(match);
  };

  // Review submit
  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewStatus('loading');
    try {
      const res = await submitReview({ productId: product.id, ...reviewForm });
      setReviewStatus('success');
      // API returns approval message — show it exactly
      setReviewMessage(res.message || 'Review submitted! It will appear after merchant approval.');
      setReviewForm({ userName: '', userEmail: '', rating: 5, title: '', content: '' });
    } catch (err) {
      setReviewStatus('error');
      setReviewMessage(err.message || 'Failed to submit review');
    }
  }

  return (
    <div className="product-page">
      <div className="product-page__container">
        {/* Image Gallery */}
        <div className="product-page__gallery">
          <div className="product-page__main-image">
            <img src={product.images[selectedImage]} alt={product.name} />
            {product.images.length > 1 && (
              <>
                <button className="product-page__nav product-page__nav--prev" onClick={prevImage}>
                  <ChevronLeft size={20} />
                </button>
                <button className="product-page__nav product-page__nav--next" onClick={nextImage}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          <div className="product-page__thumbnails">
            {product.images.map((img, index) => (
              <button
                key={index}
                className={`product-page__thumb ${index === selectedImage ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-page__info">
          <span className="product-page__brand">Swarajya Imperial</span>
          <h1 className="product-page__title">{product.name}</h1>

          {/* API: product.averageRating + product.reviewCount */}
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

          {/* API: variants[].options — group by key (size, color, etc.) */}
          {variantOptionKeys.length > 0 && (
            <div className="product-page__variants">
              {variantOptionKeys.map(key => (
                <div key={key} className="product-page__variant-group">
                  <label>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                    <strong>{selectedVariant?.options?.[key]}</strong>
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

          {/* Quantity */}
          <div className="product-page__quantity">
            <label>Quantity:</label>
            <div className="product-page__quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Actions */}
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

      {/* Tabs */}
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
              product.reviews?.map((review) => (
                <div key={review.id} className="product-page__review">
                  <div className="product-page__review-header">
                    <div className="product-page__review-author">
                      {/* API: review.userName (not review.name) */}
                      <span className="product-page__review-name">{review.userName}</span>
                    </div>
                    <div className="product-page__review-rating">
                      {renderStars(review.rating)}
                      {/* API: review.createdAt (not review.date) */}
                      <span>{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <strong>{review.title}</strong>
                  {/* API: review.content (not review.text) */}
                  <p className="product-page__review-text">{review.content}</p>
                </div>
              ))
            )}

            {/* Review submission form */}
            <div className="product-page__review-form">
              <h3>Write a Review</h3>
              {reviewStatus === 'success' ? (
                <p style={{ color: 'green' }}>✅ {reviewMessage}</p>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  {reviewStatus === 'error' && <p style={{ color: 'red' }}>❌ {reviewMessage}</p>}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {[1,2,3,4,5].map(star => (
                      <span key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        style={{ fontSize: '22px', cursor: 'pointer', color: star <= reviewForm.rating ? '#c9a84c' : '#ddd' }}>★</span>
                    ))}
                  </div>
                  <input required placeholder="Your name" value={reviewForm.userName}
                    onChange={e => setReviewForm(f => ({ ...f, userName: e.target.value }))}
                    className="product-page__review-input" />
                  <input required type="email" placeholder="Your email" value={reviewForm.userEmail}
                    onChange={e => setReviewForm(f => ({ ...f, userEmail: e.target.value }))}
                    className="product-page__review-input" />
                  <input required placeholder="Review title" value={reviewForm.title}
                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                    className="product-page__review-input" />
                  <textarea required placeholder="Your review..." value={reviewForm.content} rows={4}
                    onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))}
                    className="product-page__review-input" />
                  <button type="submit" className="product-page__add-cart" disabled={reviewStatus === 'loading'}>
                    {reviewStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
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
    </div>
  );
}