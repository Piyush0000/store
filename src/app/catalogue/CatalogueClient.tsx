'use client';

import { Suspense } from 'react';
import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './skeleton.css';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  compareAtPrice?: number;
  averageRating?: number;
  reviewCount?: number;
}

interface CatalogueClientProps {
  products: Product[];
  categories: string[];
}

export default function CatalogueClient({ products, categories }: CatalogueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(false);

  const categoryList = categories.length > 0
    ? [{ id: 'all', label: 'All' }, ...categories.map(c => ({ id: c.toLowerCase().replace(/\s+/g, '-'), label: c }))]
    : [{ id: 'all', label: 'All' }, { id: 'jewellery-sets', label: 'Jewellery Sets' }, { id: 'necklace', label: 'Necklace' }, { id: 'earrings', label: 'Earrings' }];

  const handleCategoryChange = useCallback((categoryId: string) => {
    setIsLoading(true);
    setSelectedCategory(categoryId);

    if (categoryId === 'all') {
      router.push('/catalogue', { scroll: false });
    } else {
      router.push(`/catalogue?category=${categoryId}`, { scroll: false });
    }

    setTimeout(() => setIsLoading(false), 300);
  }, [router]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase());

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
      default: return 0;
    }
  });

  const categoryLabel = categoryList.find(c => c.id === selectedCategory)?.label || 'All Products';

  if (products.length === 0 && categories.length === 0) {
    return (
      <div className="catalogue">
        <div className="catalogue__header">
          <h1>ALL PRODUCTS</h1>
          <span className="catalogue__count">0 items</span>
        </div>
        <div className="catalogue__layout">
          <aside className="catalogue__sidebar">
            <div className="catalogue__filter-group">
              <h3>Categories</h3>
              <CategorySkeleton />
            </div>
          </aside>
          <div className="catalogue__main">
            <ProductGridSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogue">
      <div className="catalogue__header">
        <h1>{categoryLabel.toUpperCase()}</h1>
        <span className="catalogue__count">{sortedProducts.length} items</span>
      </div>

      <div className="catalogue__layout">
        <aside className="catalogue__sidebar">
          <div className="catalogue__filter-group">
            <h3>Categories</h3>
            <Suspense fallback={<CategorySkeleton />}>
              <div className="catalogue__filter-options">
                {categoryList.map((cat) => (
                  <label key={cat.id} className="catalogue__filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.id}
                      onChange={() => handleCategoryChange(cat.id)}
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </Suspense>
          </div>
        </aside>

        <div className="catalogue__main">
          <div className="catalogue__toolbar">
            <span>{sortedProducts.length} products</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <Suspense fallback={<ProductGridSkeleton count={6} />}>
            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : sortedProducts.length === 0 ? (
              <div className="catalogue__empty">
                <p>No products found in this category.</p>
              </div>
            ) : (
              <div className="catalogue__grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}