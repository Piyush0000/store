'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAnalytics } from './AnalyticsProvider';
import { variantImages, variantSelection, type ProductWithVariants } from '@/lib/product-variants';
import { isVideoUrl } from '@/lib/media-type';
import VariantPicker from './VariantPicker';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  images?: string[];
  variants?: Record<string, string>;
  variantId?: string;
  // Bundle support
  type?: 'PRODUCT' | 'BUNDLE';
  bundleId?: string;
  productIds?: string[];
  items?: Array<{ id: string; name: string; price: number; image?: string }>;
  discountAmount?: number;
  discountPercentage?: number;
  regularTotal?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number, variants?: Record<string, string>) => void;
  openVariantPicker: (product: ProductWithVariants, initialVariantId?: string, initialQuantity?: number) => void;
  addBundleToCart: (
    bundleId: string,
    title: string,
    payablePrice: number,
    items: Array<{ id: string; name: string; price: number; image?: string }>,
    discountAmount: number,
    discountPercentage?: number
  ) => void;
  removeFromCart: (productId: string, variants?: Record<string, string>, variantId?: string) => void;
  updateQuantity: (productId: string, variants?: Record<string, string>, quantity?: number, variantId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { track } = useAnalytics();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [variantPicker, setVariantPicker] = useState<{ product: ProductWithVariants; initialVariantId?: string; initialQuantity?: number } | null>(null);

  const sameCartLine = (item: CartItem, id: string, variants: Record<string, string>, variantId?: string) =>
    item.id === id && (variantId || item.variantId
      ? Boolean(variantId && item.variantId === variantId)
      : JSON.stringify(item.variants || {}) === JSON.stringify(variants));

  const openVariantPicker = (product: ProductWithVariants, initialVariantId?: string, initialQuantity?: number) => {
    setIsCartOpen(false);
    setVariantPicker({ product, initialVariantId, initialQuantity });
  };

  const addPickedVariant = (product: ProductWithVariants, index: number, quantity: number) => {
    const variant = product.variants?.[index];
    if (!variant?.id) return;
    const image = [...variantImages(variant), ...(product.images || [])].find((url) => !isVideoUrl(url));
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(variant.price ?? product.price),
      compareAtPrice: Number(variant.options?.compareAtPrice ?? product.compareAtPrice ?? 0) || undefined,
      images: image ? [image] : [],
      variantId: variant.id,
    }, quantity, variantSelection(product, variant, index));
  };

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        setCartItems([]);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1, variants = {}) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => sameCartLine(item, product.id, variants, product.variantId)
      );

      if (existing) {
        return prev.map((item) =>
          sameCartLine(item, product.id, variants, product.variantId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity, variants }];
    });

    // Track AddToCart event
    try {
      track('AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'INR'
      });
    } catch (e) {
      console.warn('[Analytics] Failed to track AddToCart:', e);
    }

    setIsCartOpen(true);
  };

  const addBundleToCart = (
    bundleId: string,
    title: string,
    payablePrice: number,
    items: Array<{ id: string; name: string; price: number; image?: string }>,
    discountAmount: number,
    discountPercentage?: number
  ) => {
    setCartItems((prev) => {
      const sortedProductIds = items.map(i => i.id).sort();
      const uniqueId = `bundle_${bundleId}_${sortedProductIds.join('_')}`;

      const existing = prev.find((item) => item.id === uniqueId);
      if (existing) {
        return prev.map((item) =>
          item.id === uniqueId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const regularTotal = items.reduce((sum, item) => sum + item.price, 0);

      const bundleItem: CartItem = {
        id: uniqueId,
        name: title,
        price: payablePrice,
        quantity: 1,
        images: items.map((i) => i.image).filter(Boolean) as string[],
        type: 'BUNDLE',
        bundleId,
        productIds: sortedProductIds,
        items,
        discountAmount,
        discountPercentage,
        regularTotal,
      };

      return [...prev, bundleItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variants = {}, variantId?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !sameCartLine(item, productId, variants, variantId)
      )
    );
  };

  const updateQuantity = (productId: string, variants = {}, quantity?: number, variantId?: string) => {
    if (quantity === undefined || quantity <= 0) {
      removeFromCart(productId, variants, variantId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        sameCartLine(item, productId, variants, variantId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(() =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(() =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        openVariantPicker,
        addBundleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isHydrated,
      }}
    >
      {children}
      {variantPicker && (
        <VariantPicker
          product={variantPicker.product}
          initialVariantId={variantPicker.initialVariantId}
          initialQuantity={variantPicker.initialQuantity}
          onClose={() => setVariantPicker(null)}
          onAdd={(index, quantity) => addPickedVariant(variantPicker.product, index, quantity)}
        />
      )}
    </CartContext.Provider>
  );
}
