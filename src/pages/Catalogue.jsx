import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts, useCategories } from '../context/StoreContext';
import './Catalogue.css';

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');

  // API: categories is string[] e.g. ["Jewellery Sets", "Necklace", "Earrings"]
  const apiCategories = useCategories();

  // API: products[] — use directly, no remapping needed (ProductCard already fixed)
  const apiProducts = useProducts();

  // Sync selectedCategory when URL param changes
  useEffect(() => {
  const timer = setTimeout(() => {
    setSelectedCategory(categoryParam);
  }, 0);
  return () => clearTimeout(timer);
}, [categoryParam]);

  const categories = apiCategories.length > 0
    ? [
        { id: 'all', label: 'All' },
        ...apiCategories.map(c => ({
          id: c.toLowerCase().replace(/\s+/g, '-'),
          label: c,
        })),
      ]
    : [
        { id: 'all', label: 'All' },
        { id: 'jewellery-sets', label: 'Jewellery Sets' },
        { id: 'necklace', label: 'Necklace' },
        { id: 'earrings', label: 'Earrings' },
        { id: 'best-seller', label: 'Best Seller' },
      ];

  // API: product.category is a string e.g. "Jewellery Sets"
  const filteredProducts = selectedCategory === 'all'
    ? apiProducts
    : apiProducts.filter(p =>
        p.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase()
      );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      // API: product.averageRating (not product.rating)
      case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
      default: return 0;
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

  const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || 'All Products';

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