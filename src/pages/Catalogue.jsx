import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import './Catalogue.css';

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');
  const { storeData } = useStore();

  const apiCategories = storeData?.categories || [];
  const apiProducts = storeData?.products || [];

  const categories = apiCategories.length > 0
    ? [{ id: 'all', label: 'All' }, ...apiCategories.map(c => ({ id: c, label: c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))]
    : [
        { id: 'all', label: 'All' },
        { id: 'jewellery-sets', label: 'Jewellery Sets' },
        { id: 'necklace', label: 'Necklace' },
        { id: 'earrings', label: 'Earrings' },
        { id: 'best-seller', label: 'Best Seller' },
      ];

  const products = apiProducts.length > 0
    ? apiProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.images?.[0] || p.image,
        images: p.images || [p.image],
        category: p.category?.id || p.category,
        rating: p.rating || 4.5,
        reviewCount: p.reviewCount || 0,
        description: p.description || '',
        variants: p.variants,
      }))
    : [];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => {
        if (typeof p.category === 'string') {
          return p.category.toLowerCase() === selectedCategory.toLowerCase();
        }
        return p.category?.id === selectedCategory;
      });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || 'All Products';

  return (
    <div className="catalogue">
      <div className="catalogue__header">
        <h1>{categoryLabel.toUpperCase()}</h1>
        <span className="catalogue__count">{sortedProducts.length} items</span>
      </div>

      <div className="catalogue__layout">
        {/* Sidebar Filters */}
        <aside className="catalogue__sidebar">
          <div className="catalogue__filter-group">
            <h3>Categories</h3>
            {categories.map((cat) => (
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
        </aside>

        {/* Product Grid */}
        <div className="catalogue__main">
          <div className="catalogue__toolbar">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {sortedProducts.length === 0 ? (
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
        </div>
      </div>
    </div>
  );
}