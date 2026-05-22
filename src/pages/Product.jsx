import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({
    color: product?.variants?.colors?.[0] || '',
    size: product?.variants?.sizes?.[0] || '',
    type: product?.variants?.types?.[0] || '',
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <Link to="/catalogue">Back to Catalogue</Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleVariantChange = (type, value) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = '/cart';
    }, 500);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.floor(rating) ? '#C9A84C' : 'none'}
        stroke="#C9A84C"
        strokeWidth={1.5}
      />
    ));
  };

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
          <h1 className="product-page__title">{product.name}</h1>

          <div className="product-page__rating">
            {renderStars(product.rating)}
            <span className="product-page__rating-count">({product.reviewCount} reviews)</span>
          </div>

          <div className="product-page__pricing">
            <span className="product-page__price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="product-page__original-price">₹{product.originalPrice.toLocaleString()}</span>
                <span className="product-page__discount">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants && (
            <div className="product-page__variants">
              {product.variants.colors && (
                <div className="product-page__variant-group">
                  <label>Color: <strong>{selectedVariants.color}</strong></label>
                  <div className="product-page__variant-options">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color}
                        className={`product-page__variant-btn ${selectedVariants.color === color ? 'active' : ''}`}
                        onClick={() => handleVariantChange('color', color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.sizes && (
                <div className="product-page__variant-group">
                  <label>Size: <strong>{selectedVariants.size}</strong></label>
                  <div className="product-page__variant-options">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        className={`product-page__variant-btn ${selectedVariants.size === size ? 'active' : ''}`}
                        onClick={() => handleVariantChange('size', size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.types && (
                <div className="product-page__variant-group">
                  <label>Type: <strong>{selectedVariants.type}</strong></label>
                  <div className="product-page__variant-options">
                    {product.variants.types.map((type) => (
                      <button
                        key={type}
                        className={`product-page__variant-btn ${selectedVariants.type === type ? 'active' : ''}`}
                        onClick={() => handleVariantChange('type', type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="product-page__quantity">
            <label>Quantity:</label>
            <div className="product-page__quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="product-page__actions">
            <button className="product-page__add-cart" onClick={handleAddToCart}>
              <ShoppingBag size={18} />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
            <button className="product-page__buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          <button className="product-page__wishlist">
            <Heart size={18} />
            Add to Wishlist
          </button>

          {/* Benefits */}
          <div className="product-page__benefits">
            <div className="product-page__benefit">
              <Truck size={16} />
              <span>Free Shipping on orders ₹499+</span>
            </div>
            <div className="product-page__benefit">
              <Shield size={16} />
              <span>100% Authentic</span>
            </div>
            <div className="product-page__benefit">
              <RotateCcw size={16} />
              <span>Easy Returns</span>
            </div>
          </div>

          <p className="product-page__promo">Extra ₹650 off at checkout</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-page__tabs">
        <button
          className={`product-page__tab ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          className={`product-page__tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({product.reviewCount})
        </button>
        <button
          className={`product-page__tab ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          Shipping
        </button>
      </div>

      <div className="product-page__tab-content">
        {activeTab === 'description' && (
          <div className="product-page__description">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="product-page__reviews">
            {product.reviews.length === 0 ? (
              <p className="product-page__no-reviews">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="product-page__review">
                  <div className="product-page__review-header">
                    <div className="product-page__review-author">
                      <span className="product-page__review-name">{review.name}</span>
                      {review.verified && <span className="product-page__review-verified">Verified</span>}
                    </div>
                    <div className="product-page__review-rating">
                      {renderStars(review.rating)}
                      <span>{review.date}</span>
                    </div>
                  </div>
                  <p className="product-page__review-text">{review.text}</p>
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
    </div>
  );
}