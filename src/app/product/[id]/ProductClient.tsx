"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import ProductCard from "@/components/ProductCard";
import TestimonialsSection from "@/components/TestimonialsSection";
import SpecialOffersCard from "@/components/SpecialOffersCard";
import ReelsSection from "@/components/ReelsSection";
import { trackViewContent } from "@/lib/pixel";
import type { TestimonialSection } from "@/lib/api";
import "./product.css";

const pad = (num: number) => String(num).padStart(2, "0");

const decodeAndFormatHtml = (content: string) => {
  if (!content) return "";
  let formatted = content;
  if (formatted.includes("&lt;") && formatted.includes("&gt;")) {
    formatted = formatted
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }
  if (formatted.includes("<")) {
    return formatted;
  }
  return formatted.replace(/\n/g, "<br/>");
};

interface ProductClientProps {
  product: any;
  relatedProducts: any[];
  testimonials: TestimonialSection | null;
  reelsSection?: {
    enabled?: boolean;
    displayType?: "carousel" | "grid" | "stories" | "pop";
    reels?: Array<{
      id: string;
      title: string;
      sub: string;
      category: string;
      videoUrl: string;
      ctaLink?: string;
    }>;
  };
}

export default function ProductClient({
  product,
  relatedProducts,
  testimonials,
  reelsSection,
}: ProductClientProps) {
  const showReelsSection = Boolean(
    product.customFields?.showReelsSection ?? true
  );
  const showFloatingReel = Boolean(
    product.customFields?.showFloatingReel ?? false
  );
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/storefront/public/coupons");
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            setCoupons(json.data || json.coupons || []);
          }
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const specifications: Array<{ key: string; value: string }> = (() => {
    const raw = product.customFields?.specifications || product.specifications;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.filter(
        (s: any) =>
          s && (String(s.key || "").trim() || String(s.value || "").trim()),
      );
    }
    if (typeof raw === "object") {
      return Object.entries(raw).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [];
  })();

  const isBestseller = Boolean(
    product.customFields?.showBestsellerBadge ?? product.isBestSeller
  );
  const isFastSelling = Boolean(
    product.customFields?.showFastSellingBadge ??
      product.customFields?.isFastSelling
  );
  const recentSalesCount =
    product.customFields?.recentSalesCount || product.recentSalesCount;
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [saleTime, setSaleTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);

  // Update sale countdown every second (resets every 12 hours)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = currentHour < 12 ? 12 : 24;
      const targetDate = new Date(now);
      targetDate.setHours(targetHour, 0, 0, 0);

      const diffMs = targetDate.getTime() - now.getTime();
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setSaleTime({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if image is already loaded (e.g. from cache) upon mounting or changing image index
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoading(false);
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    if (product.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    if (product) {
      trackViewContent(product.name, product.id, Number(product.price));
    }
  }, [product]);

  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.price);

  const originalPrice =
    selectedVariant?.options?.compareAtPrice !== undefined &&
    selectedVariant?.options?.compareAtPrice !== null
      ? Number(selectedVariant.options.compareAtPrice)
      : product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null;

  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const IGNORED_OPTION_KEYS = [
    "isActive",
    "compareAtPrice",
    "status",
    "sku",
    "price",
    "stock",
    "id",
    "name",
  ];

  const customOptionKeys =
    product.variants?.length > 0
      ? [
          ...new Set<string>(
            product.variants.flatMap((v: any) =>
              Object.keys(v.options || {}).filter(
                (k) => !IGNORED_OPTION_KEYS.includes(k),
              ),
            ),
          ),
        ]
      : [];

  const getOptionValues = (key: string) => [
    ...new Set<string>(
      product.variants.map((v: any) => v.options?.[key]).filter(Boolean),
    ),
  ];

  const handleOptionChange = (key: string, value: string) => {
    const match = product.variants.find(
      (v: any) =>
        v.options?.[key] === value &&
        customOptionKeys
          .filter((k) => k !== key)
          .every((k) => v.options?.[k] === selectedVariant?.options?.[k]),
    );
    if (match) setSelectedVariant(match);
  };

  const isSizeVariant =
    product.variants?.every((v: any) =>
      /^(xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl)$/i.test(v.name.trim()),
    ) ?? false;
  const optionLabel = isSizeVariant ? "Size" : "Option";

  const handleAddToCart = () => {
    const variantSelection = selectedVariant
      ? customOptionKeys.length > 0
        ? Object.fromEntries(
            customOptionKeys.map((k) => [
              k.charAt(0).toUpperCase() + k.slice(1),
              selectedVariant.options?.[k],
            ]),
          )
        : { [optionLabel]: selectedVariant.name }
      : {};

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        compareAtPrice: originalPrice || undefined,
        images: product.images,
        variantId: selectedVariant?.id,
      },
      quantity,
      variantSelection,
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    const variantSelection = selectedVariant
      ? customOptionKeys.length > 0
        ? Object.fromEntries(
            customOptionKeys.map((k) => [
              k.charAt(0).toUpperCase() + k.slice(1),
              selectedVariant.options?.[k],
            ]),
          )
        : { [optionLabel]: selectedVariant.name }
      : {};

    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      compareAtPrice: originalPrice || undefined,
      images: product.images,
      variantId: selectedVariant?.id,
      quantity,
      variants: variantSelection,
    };

    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    setIsCartOpen(false);
    
    // Redirect with buyNow parameter
    setTimeout(() => {
      window.location.href = "/checkout?buyNow=true";
    }, 100);
  };

  const renderStars = (rating: number) => {
    const finalRating = rating || 4.5;
    return (
      <>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient
              id="star-half-gold"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        {[...Array(5)].map((_, i) => {
          const isFull = i < Math.floor(finalRating);
          const isHalf =
            !isFull && i === Math.floor(finalRating) && finalRating % 1 >= 0.5;
          const fillValue = isFull
            ? "#FFC107"
            : isHalf
              ? "url(#star-half-gold)"
              : "none";
          return (
            <Star
              key={i}
              size={14}
              fill={fillValue}
              stroke="#FFC107"
              strokeWidth={1.5}
            />
          );
        })}
      </>
    );
  };

  // Auto-play slideshow loop
  useEffect(() => {
    if (!product.images || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
      setImageLoading(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [product.images, selectedImageIndex]);

  return (
    <>
      <section className="product-page">
        <div className="product-page__container">
          <div className="product-page__gallery">
            {product.images.length > 1 && (
              <div className="product-page__thumbnails">
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    className={`product-page__thumb ${index === selectedImageIndex ? "active" : ""}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageLoading(true);
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
            <div className="product-page__main-image">
              {discount > 0 && (
                <span className="product-page__discount">{discount}% OFF</span>
              )}
              {imageLoading && (
                <div className="product-page__loading-spinner">
                  <img
                    src="/spinner.svg"
                    alt="Loading..."
                    className="spinner-icon"
                  />
                </div>
              )}
              <img
                ref={imgRef}
                src={
                  product.images?.[selectedImageIndex] ||
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
                }
                alt={product.name}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                style={{ borderRadius: "4px", backgroundColor: "#fff" }}
              />
            </div>
          </div>

          <div className="product-page__info">
            {product.brand && (
              <span className="product-page__brand">{product.brand}</span>
            )}

            {(isBestseller || isFastSelling) && (
              <div className="product-page__badge-capsules">
                {isBestseller && (
                  <span className="badge-capsule badge-capsule--bestseller">
                    <Star size={12} className="badge-capsule__icon" />
                    <span>Bestseller</span>
                  </span>
                )}
                {isFastSelling && (
                  <span className="badge-capsule badge-capsule--fast-selling">
                    <TrendingUp size={12} className="badge-capsule__icon" />
                    <span>Fast Selling</span>
                  </span>
                )}
              </div>
            )}

            <h1 className="product-page__title">{product.name}</h1>

            <div className="product-page__rating">
              <span>Ratings : </span>
              {renderStars(product.averageRating || 0)}
            </div>

            <div className="product-page__pricing">
              <span className="product-page__price">
                ₹{displayPrice?.toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <>
                  <span className="product-page__original-price">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="product-page__discount">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="product-page__sale-timer">
              <span className="sale-live-badge">Sale Is Live!</span>
              <span className="sale-countdown">
                <Clock size={13} className="sale-clock-icon" />
                {pad(saleTime.hours)}H:{pad(saleTime.minutes)}M:
                {pad(saleTime.seconds)}S
              </span>
            </div>

            {recentSalesCount && Number(recentSalesCount) > 0 && (
              <div className="product-page__recent-sales-strip">
                <Users size={16} className="recent-sales-icon" />
                <span className="recent-sales-text">
                  <strong className="recent-sales-highlight">
                    {recentSalesCount} +
                  </strong>{" "}
                  customers bought this in the last 7 days
                </span>
              </div>
            )}

            {product.variants?.length > 0 && (
              <div className="product-page__variants">
                {customOptionKeys.length > 0 ? (
                  customOptionKeys.map((key: string) => (
                    <div key={key} className="product-page__variant-group">
                      <label>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                        <strong>{selectedVariant?.options?.[key]}</strong>
                      </label>
                      <div className="product-page__variant-options">
                        {getOptionValues(key).map((value: string) => (
                          <button
                            key={value}
                            className={`product-page__variant-btn ${selectedVariant?.options?.[key] === value ? "active" : ""}`}
                            onClick={() => handleOptionChange(key, value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="product-page__variant-group">
                    <label>
                      {optionLabel}: <strong>{selectedVariant?.name}</strong>
                    </label>
                    <div className="product-page__variant-options">
                      {product.variants.map((v: any) => (
                        <button
                          key={v.id}
                          className={`product-page__variant-btn ${selectedVariant?.id === v.id ? "active" : ""}`}
                          onClick={() => setSelectedVariant(v)}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedVariant && (
                  <p className="product-page__variant-stock">
                    {selectedVariant.stock > 0
                      ? `${selectedVariant.stock} in stock`
                      : "Out of stock"}
                  </p>
                )}
              </div>
            )}

            <div className="product-page__quantity">
              <label>Quantity:</label>
              <div className="product-page__quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="product-page__actions">
              <button
                className="product-page__add-cart"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={16} />
                {addedToCart ? "Added!" : "Add to Cart"}
              </button>
              <button className="product-page__buy-now" onClick={handleBuyNow}>
                <span>Buy Now</span>
                <img
                  src="/buynow.png"
                  alt="Buy Now"
                  className="product-page__buy-now-img"
                />
              </button>
            </div>

            <button
              className={`product-page__wishlist ${liked ? "product-page__wishlist--active" : ""}`}
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: displayPrice,
                  images: product.images,
                })
              }
            >
              <Heart
                size={16}
                fill={liked ? "var(--gold-light, #c9a84c)" : "none"}
                stroke={liked ? "var(--gold-light, #c9a84c)" : "currentColor"}
              />
              {liked ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>

            {coupons && coupons.length > 0 && (
              <SpecialOffersCard coupons={coupons} />
            )}

            <div className="product-page__benefits">
              <div className="product-page__benefits-grid">
                <div className="product-page__benefit">
                  <div className="benefit-icon-wrapper">
                    <span className="benefit-icon-text">₹</span>
                  </div>
                  <span>Cash on Delivery</span>
                </div>
                <div className="product-page__benefit">
                  <div className="benefit-icon-wrapper">
                    <RotateCcw size={16} />
                  </div>
                  <span className="underline-text">Secure Checkout</span>
                </div>
                <div className="product-page__benefit">
                  <div className="benefit-icon-wrapper">
                    <Truck size={16} />
                  </div>
                  <span>Free Delivery on orders above ₹999</span>
                </div>
              </div>
              <div className="product-page__delivery-banner">
                Get it delivered in 3-6 days
              </div>
            </div>
          </div>
        </div>

        <div className="product-page__tabs">
          <button
            className={`product-page__tab ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          {/* 
          <button
            className={`product-page__tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({product.reviewCount || 0})
          </button>
          */}
          <button
            className={`product-page__tab ${activeTab === "shipping" ? "active" : ""}`}
            onClick={() => setActiveTab("shipping")}
          >
            Shipping
          </button>
        </div>

        <div className="product-page__tab-content">
          {activeTab === "description" && (
            <div className="product-page__description-container">
              {/* 1. Product Information (Table) */}
              {specifications.length > 0 && (
                <div className="product-page__info-card">
                  <h3 className="product-page__section-title">
                    Product Information
                  </h3>
                  <div className="product-page__specs-table">
                    {specifications.map((spec, idx) => (
                      <div key={idx} className="product-page__spec-row">
                        <span className="product-page__spec-key">
                          {spec.key}
                        </span>
                        <span className="product-page__spec-value">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Product Description (Rich HTML or Text) */}
              <div className="product-page__desc-card">
                <h3 className="product-page__section-title">
                  Product Description
                </h3>
                {product.description ? (
                  <div
                    className="product-page__rich-description"
                    dangerouslySetInnerHTML={{
                      __html: decodeAndFormatHtml(product.description),
                    }}
                  />
                ) : (
                  <p className="product-page__empty-desc">
                    No description available for this product.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 
          {activeTab === "reviews" && (
            <div className="product-page__reviews">
              {product.reviews?.length === 0 ? (
                <p className="product-page__no-reviews">
                  No reviews yet. Be the first!
                </p>
              ) : (
                product.reviews?.map((review: any) => (
                  <div key={review.id} className="product-page__review">
                    <div className="product-page__review-header">
                      <span className="product-page__review-name">
                        {review.userName}
                      </span>
                    </div>
                    <div className="product-page__review-rating">
                      {renderStars(review.rating)}
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <strong>{review.title}</strong>
                    <p className="product-page__review-text">
                      {review.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
          */}

          {activeTab === "shipping" && (
            <div className="product-page__shipping-info">
              <h3>Shipping Information</h3>
              <ul>
                <li>Free shipping on orders above ₹999</li>
                <li>Standard delivery: 5-7 business days</li>
                <li>Express delivery: 2-3 business days</li>
                <li>Orders are processed within 24 hours</li>
                <li>Track your order in real-time</li>
              </ul>
            </div>
          )}
        </div>

        {/* testimonial section */}
        {testimonials &&
          testimonials.enabled !== false &&
          testimonials.testimonials &&
          testimonials.testimonials.length > 0 && (
            <div
              className="w-full flex flex-col items-center justify-center"
              style={{ marginTop: "60px" }}
            >
              <div style={{ width: "100%" }}>
                <TestimonialsSection
                  testimonials={testimonials.testimonials}
                  title={testimonials.title || ""}
                />
              </div>
            </div>
          )}

        {/* Dedicated Product Video Reels Section */}
        {showReelsSection &&
          reelsSection &&
          reelsSection.enabled !== false &&
          reelsSection.reels &&
          reelsSection.reels.length > 0 && (
            <div
              className="w-full"
              style={{ marginTop: "48px", marginBottom: "32px" }}
            >
              <ReelsSection
                reels={reelsSection.reels}
                displayType={
                  showFloatingReel
                    ? "pop"
                    : reelsSection.displayType || "carousel"
                }
              />
            </div>
          )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="featured-collection">
          <h2 className="section-title inline-block mb-2">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4  lg:grid-cols-6 grid-rows-auto gap-2">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
