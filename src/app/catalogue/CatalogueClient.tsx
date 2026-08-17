'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from './Skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  compareAtPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isValueCombo?: boolean;
}

interface CatalogueClientProps {
  products: Product[];
  categories: string[];
}

function CatalogueClientInner({ products, categories }: CatalogueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize category state when search parameters change via external navigation (e.g. navbar clicks)
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setSelectedCategory(category);
    setIsLoading(false);
  }, [searchParams]);

  const categoryList = categories.length > 0
    ? [{ id: 'all', label: 'All' }, ...categories.map(c => ({ id: c.toLowerCase().replace(/\s+/g, '-'), label: c }))]
    : [{ id: 'all', label: 'All' }, { id: 'jewellery-sets', label: 'Jewellery Sets' }, { id: 'necklace', label: 'Necklace' }, { id: 'earrings', label: 'Earrings' }];

  const selectedStream = searchParams.get('stream') || '';
  const searchQueryParam = searchParams.get('q') || searchParams.get('search') || searchParams.get('query') || '';

  const handleClearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('search');
    params.delete('query');
    const newQuery = params.toString() ? `?${params.toString()}` : '';
    router.push(`/catalogue${newQuery}`, { scroll: false });
  }, [router, searchParams]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === selectedCategory && !searchQueryParam) return;
    setIsLoading(true);
    setSelectedCategory(categoryId);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('search');
    params.delete('query');
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }

    const newQuery = params.toString() ? `?${params.toString()}` : '';
    router.push(`/catalogue${newQuery}`, { scroll: false });
  }, [router, searchParams, selectedCategory, searchQueryParam]);

  const filteredProducts = products.filter(p => {
    // 1. Filter by search query
    if (searchQueryParam) {
      const q = searchQueryParam.toLowerCase().trim();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const categoryMatch = p.category?.toLowerCase().includes(q);
      if (!nameMatch && !categoryMatch) return false;
    }
    // 2. Filter by category
    if (selectedCategory !== 'all') {
      const matchCat = p.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }
    // 3. Filter by stream
    if (selectedStream) {
      const s = selectedStream.toLowerCase();
      if (s === 'featured' && !p.isFeatured) return false;
      if (s === 'best-seller' && !p.isBestSeller) return false;
      if (s === 'new-arrival' && !p.isNewArrival) return false;
      if (s === 'value-combo' && !p.isValueCombo) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
      default: return 0;
    }
  });

  let categoryLabel = categoryList.find(c => c.id === selectedCategory)?.label || 'All Products';
  if (searchQueryParam) {
    categoryLabel = `Results for "${searchQueryParam}"`;
  } else if (selectedStream) {
    const streamName = selectedStream.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    categoryLabel = `${streamName} Products`;
  }

  return (
    <div className="catalogue">
      <div className="catalogue__header">
        <div>
          <h1>{categoryLabel.toUpperCase()}</h1>
          {searchQueryParam && (
            <button 
              onClick={handleClearSearch}
              style={{
                background: 'none',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '16px',
                padding: '2px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Clear search ✕
            </button>
          )}
        </div>
        <span className="catalogue__count">{sortedProducts.length} items</span>
      </div>

      <div className="catalogue__layout">
        <aside className="catalogue__sidebar">
          <div className="catalogue__filter-group">
            <h3>Categories</h3>
            <div className="catalogue__filter-options">
              {categoryList.map((cat) => (
                <label key={cat.id} className="catalogue__filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.id && !searchQueryParam}
                    onChange={() => handleCategoryChange(cat.id)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
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

          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : sortedProducts.length === 0 ? (
            <div className="catalogue__empty">
              <p>No products found {searchQueryParam ? `matching "${searchQueryParam}"` : 'in this category'}.</p>
              {searchQueryParam && (
                <button 
                  onClick={handleClearSearch}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#2f4156',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="catalogue__grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogueClient(props: CatalogueClientProps) {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} />}>
      <CatalogueClientInner {...props} />
    </Suspense>
  );
}