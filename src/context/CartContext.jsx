import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variants = {}) => {
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

  const removeFromCart = (productId, variants = {}) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && JSON.stringify(item.variants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (productId, variants = {}, quantity) => {
    if (quantity <= 0) {
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

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}