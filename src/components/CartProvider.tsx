'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  variants?: Record<string, string>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string, variants?: Record<string, string>) => void;
  updateQuantity: (productId: string, variants?: Record<string, string>, quantity?: number) => void;
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
    console.error('[CART] ❌ useCart called outside CartProvider');
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  console.log('[CART] CartProvider initializing');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    console.log('[CART] Loading cart from localStorage');
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('[CART] Loaded items:', parsed.length);
        setCartItems(parsed);
      } catch {
        console.error('[CART] Failed to parse cart from localStorage');
        setCartItems([]);
      }
    } else {
      console.log('[CART] No cart found in localStorage');
    }
    setIsHydrated(true);
    console.log('[CART] Cart hydrated');
  }, []);

  useEffect(() => {
    if (isHydrated) {
      console.log('[CART] Saving cart to localStorage:', cartItems.length, 'items');
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1, variants = {}) => {
    console.log('[CART] addToCart:', product.name, 'x', quantity);
    console.log('[CART] Product ID:', product.id);
    console.log('[CART] Variants:', variants);

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && JSON.stringify(item.variants) === JSON.stringify(variants)
      );

      if (existing) {
        console.log('[CART] Item exists, incrementing quantity from', existing.quantity, 'to', existing.quantity + quantity);
        return prev.map((item) =>
          item.id === product.id && JSON.stringify(item.variants) === JSON.stringify(variants)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      console.log('[CART] New item, adding to cart');
      return [...prev, { ...product, quantity, variants }];
    });
    setIsCartOpen(true);
    console.log('[CART] Cart drawer opened');
  };

  const removeFromCart = (productId: string, variants = {}) => {
    console.log('[CART] removeFromCart:', productId);
    console.log('[CART] Variants:', variants);

    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && JSON.stringify(item.variants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (productId: string, variants = {}, quantity?: number) => {
    console.log('[CART] updateQuantity:', productId, '->', quantity);
    console.log('[CART] Variants:', variants);

    if (quantity === undefined || quantity <= 0) {
      console.log('[CART] Quantity is 0 or undefined, removing item');
      removeFromCart(productId, variants);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && JSON.stringify(item.variants) === JSON.stringify(variants)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    console.log('[CART] Clearing entire cart');
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  console.log('[CART] Cart state:', { items: cartItems.length, total: cartTotal, count: cartCount });

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
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
    </CartContext.Provider>
  );
}