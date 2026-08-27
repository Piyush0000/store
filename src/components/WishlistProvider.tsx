'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  images?: string[];
  variantId?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  isHydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlistItems(JSON.parse(saved));
      } catch {
        setWishlistItems([]);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever wishlistItems changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isHydrated]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev; // idempotent
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (id: string) => wishlistItems.some((i) => i.id === id);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isHydrated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
