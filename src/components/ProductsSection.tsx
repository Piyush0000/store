import { useRef } from 'react';
import ProductCard from './ProductCard';
import type { NormalizedProduct } from '@/lib/products';
import './ProductsSection.css';

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  products: NormalizedProduct[];
  className?: string;
  sliderMode?: boolean;
}

export default function ProductsSection({ title, subtitle, products, className = '', sliderMode = false }: ProductsSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section className={`products-section animate-slide-up ${className}`}>
      <div className="products-section__header">
        <h2 className="products-section__title">{title}</h2>
        {subtitle && <p className="products-section__subtitle">{subtitle}</p>}
        <div className="products-section__divider" />
      </div>

      {sliderMode ? (
        <div className="products-section__slider-wrapper">
          <button
            className="products-section__slider-nav products-section__slider-nav--prev"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <div className="products-section__slider" ref={sliderRef}>
            {products.map((product) => (
              <div key={product.id} className="products-section__slider-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            className="products-section__slider-nav products-section__slider-nav--next"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      ) : (
        <div className="products-section__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

