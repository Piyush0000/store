import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import './Catalogue.css';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'jewellery-sets', label: 'Jewellery Sets' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'earrings', label: 'Earrings' },
  { id: 'best-seller', label: 'Best Seller' },
];

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

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