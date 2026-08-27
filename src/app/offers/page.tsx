'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { getSubdomain } from '@/lib/config';
import { Loader2, Tag, Gift, Percent, Check, ShoppingCart } from 'lucide-react';
import './offers.css';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category?: string;
  stock?: number;
}

interface Bundle {
  id: string;
  title: string;
  bundlePrice: number;
  discountPercentage?: number | null;
  pricingType: 'PERCENTAGE' | 'FIXED';
  requiredQuantity: number;
  bundleMode: 'CATEGORY' | 'PRODUCTS';
  category?: { id: string; name: string } | null;
  selectedProducts: Product[];
}

export default function OffersPage() {
  const { addBundleToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Tracks selected product IDs for each bundle: { [bundleId]: string[] }
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const subdomain = getSubdomain();
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.evoclabs.com/api/storefront/public';
        
        let bundlesUrl = '';
        let productsUrl = '';
        
        if (apiBase.includes('/storefront/public')) {
          const sanitizedBase = apiBase.replace(/\/+$/, '');
          bundlesUrl = sanitizedBase.replace('/storefront/public', '/bundles/public') + '/' + subdomain;
          productsUrl = sanitizedBase + '/' + subdomain + '/frontend';
        } else {
          const sanitizedBase = apiBase.replace(/\/+$/, '');
          if (sanitizedBase.endsWith('/api')) {
            bundlesUrl = sanitizedBase + '/bundles/public/' + subdomain;
            productsUrl = sanitizedBase + '/storefront/public/' + subdomain + '/frontend';
          } else {
            bundlesUrl = sanitizedBase + '/api/bundles/public/' + subdomain;
            productsUrl = sanitizedBase + '/api/storefront/public/' + subdomain + '/frontend';
          }
        }
        
        // 1. Fetch active bundles
        const bundlesRes = await fetch(bundlesUrl, { cache: 'no-store' });
        const bundlesData = await bundlesRes.json();
        
        if (!bundlesRes.ok || !bundlesData.success) {
          throw new Error(bundlesData.message || 'Failed to fetch bundle offers');
        }

        // 2. Fetch all products to resolve Category bundles
        const productsRes = await fetch(productsUrl, { cache: 'no-store' });
        const productsData = await productsRes.json();

        if (productsRes.ok && productsData.success) {
          setStoreProducts(productsData.products || []);
        }

        setBundles(bundlesData.bundles || []);
      } catch (err: any) {
        console.error('[OffersPage] Error:', err);
        setError(err.message || 'Could not load bundle offers. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Resolves all eligible products for a specific bundle
  const getEligibleProducts = (bundle: Bundle): Product[] => {
    if (bundle.bundleMode === 'PRODUCTS') {
      return bundle.selectedProducts || [];
    }
    if (bundle.bundleMode === 'CATEGORY' && bundle.category?.name) {
      return storeProducts.filter(
        (p) => p.category?.toLowerCase() === bundle.category?.name.toLowerCase()
      );
    }
    return [];
  };

  const handleProductToggle = (bundleId: string, productId: string, requiredQty: number) => {
    setSelections((prev) => {
      const current = prev[bundleId] || [];
      if (current.includes(productId)) {
        return {
          ...prev,
          [bundleId]: current.filter((id) => id !== productId),
        };
      } else {
        // Limit selection to the required quantity
        if (current.length >= requiredQty) {
          // Replace the first selection or ignore
          return {
            ...prev,
            [bundleId]: [...current.slice(1), productId],
          };
        }
        return {
          ...prev,
          [bundleId]: [...current, productId],
        };
      }
    });
  };

  const handleAddBundle = async (bundle: Bundle) => {
    const selectedIds = selections[bundle.id] || [];
    if (selectedIds.length !== bundle.requiredQuantity) return;

    setAddingBundleId(bundle.id);
    
    // Resolve full product items selected
    const eligible = getEligibleProducts(bundle);
    const selectedItems = eligible.filter((p) => selectedIds.includes(p.id));
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);

    // Calculate bundle pricing details
    const isPercentage = bundle.pricingType === 'PERCENTAGE';
    const discountAmount = isPercentage
      ? subtotal * (bundle.bundlePrice / 100)
      : Math.max(0, subtotal - bundle.bundlePrice);
    
    const payable = isPercentage ? subtotal - discountAmount : bundle.bundlePrice;

    // Add to cart context
    addBundleToCart(
      bundle.id,
      bundle.title,
      payable,
      selectedItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.images?.[0] || '',
      })),
      discountAmount,
      isPercentage ? bundle.bundlePrice : undefined
    );

    // Show visual confirmation then reset selection
    setTimeout(() => {
      setSelections((prev) => ({ ...prev, [bundle.id]: [] }));
      setAddingBundleId(null);
    }, 800);
  };

  if (loading) {
    return (
      <div className="offers-loading">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p>Loading active offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-error">
        <p>{error}</p>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="offers-empty">
        <Gift className="empty-icon" size={64} />
        <h2>No Active Bundle Offers</h2>
        <p>We don't have any dynamic combos active right now. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="offers-container">
      <header className="offers-header">
        <Tag className="header-tag-icon" />
        <h1>Bundle Offers & Combos</h1>
        <p className="offers-tagline">Customize your package and unlock exclusive discounts!</p>
      </header>

      <div className="bundles-list">
        {bundles.map((bundle) => {
          const eligible = getEligibleProducts(bundle);
          if (eligible.length === 0) return null;

          const selectedIds = selections[bundle.id] || [];
          const isComplete = selectedIds.length === bundle.requiredQuantity;
          const selectedItems = eligible.filter((p) => selectedIds.includes(p.id));
          
          const currentSubtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
          
          const isPercentage = bundle.pricingType === 'PERCENTAGE';
          const discountAmt = isPercentage
            ? currentSubtotal * (bundle.bundlePrice / 100)
            : Math.max(0, currentSubtotal - bundle.bundlePrice);
          
          const payable = isPercentage ? currentSubtotal - discountAmt : bundle.bundlePrice;

          return (
            <section key={bundle.id} className="bundle-card">
              <div className="bundle-card__header">
                <div className="bundle-badge">
                  {isPercentage ? <Percent size={16} /> : <Gift size={16} />}
                  <span>
                    {isPercentage ? `${bundle.bundlePrice}% OFF` : `Special Deal`}
                  </span>
                </div>
                <h2>{bundle.title}</h2>
                <p className="bundle-condition">
                  Select exactly <strong>{bundle.requiredQuantity}</strong> products from the list below to activate the offer.
                </p>
              </div>

              {/* Selection Summary Overlay */}
              <div className="bundle-selection-bar">
                <div className="selection-status">
                  <span className={`status-badge ${isComplete ? 'complete' : ''}`}>
                    {selectedIds.length} / {bundle.requiredQuantity} Selected
                  </span>
                </div>

                {selectedIds.length > 0 && (
                  <div className="pricing-summary">
                    <span className="regular-price">₹{currentSubtotal.toLocaleString('en-IN')}</span>
                    <span className="payable-price">₹{payable.toLocaleString('en-IN')}</span>
                    {discountAmt > 0 && (
                      <span className="savings-badge">Save ₹{discountAmt.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                )}

                <button
                  className="add-bundle-btn"
                  disabled={!isComplete || addingBundleId === bundle.id}
                  onClick={() => handleAddBundle(bundle)}
                >
                  {addingBundleId === bundle.id ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add Combo to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Eligible Products Grid */}
              <div className="eligible-products-grid">
                {eligible.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`product-selector-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleProductToggle(bundle.id, product.id, bundle.requiredQuantity)}
                    >
                      <div className="image-wrapper">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} />
                        {isSelected && (
                          <div className="selection-overlay">
                            <Check className="check-icon" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <div className="pricing">
                          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="compare-price">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
