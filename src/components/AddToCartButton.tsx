'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { isOutOfStock } from '@/lib/stock';

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = isOutOfStock(product);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      className="product-page__add-btn"
      onClick={handleAddToCart}
      disabled={outOfStock}
    >
      <ShoppingBag size={20} />
      {outOfStock ? 'Out of stock' : added ? 'Added to Bag!' : 'Add to Bag'}
    </button>
  );
}