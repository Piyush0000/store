'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  variants?: Record<string, string>;
  variantId?: string;
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
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        (item) => item.id === product.id && JSON.stringify(item.variants) === JSON.stringify(variants)
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && JSON.stringify(item.variants) === JSON.stringify(variants)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity, variants }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variants = {}) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && JSON.stringify(item.variants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (productId: string, variants = {}, quantity?: number) => {
    if (quantity === undefined || quantity <= 0) {
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