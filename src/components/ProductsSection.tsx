import { useMemo, useRef, useState, type CSSProperties } from 'react';
import ProductCard from './ProductCard';
import type { HydratedSection, NormalizedProduct } from '@/lib/products';
import './ProductsSection.css';

interface ProductsSectionProps extends Omit<HydratedSection, 'id'> {
  className?: string;
}

function safeLink(value: string | undefined, fallback = '/catalogue') {
  const candidate = value?.trim();
  if (!candidate) return fallback;
  if (candidate.startsWith('/') || candidate.startsWith('#')) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? candidate : fallback;
  } catch { return fallback; }
}

export default function ProductsSection({
  title, subtitle, products, className = '', layout: savedLayout, sliderMode = false,
  backgroundColor, titleColor, textColor, accentColor, headingAlignment = 'center',
  desktopColumns = 4, mobileColumns = 2, showViewAll = true, viewAllLabel = 'View all products',
  viewAllUrl = '/catalogue', editorialEyebrow = 'The wellness edit',
  editorialTitle = 'Everyday wellness, thoughtfully made', editorialImage,
  editorialCtaLabel = 'Explore collection', editorialCtaUrl = '/catalogue',
}: ProductsSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const layout = savedLayout || (sliderMode ? 'shelf' : 'curated');
  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).slice(0, 6), [products]);
  const activeCategory = selectedCategory === 'All' || categories.includes(selectedCategory) ? selectedCategory : 'All';
  const visibleProducts = layout === 'category-tabs' && activeCategory !== 'All' ? products.filter((product) => product.category === activeCategory) : products;

  if (!products || products.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const node = sliderRef.current;
    if (node) node.scrollBy({ left: dir === 'left' ? -Math.max(280, node.clientWidth * .72) : Math.max(280, node.clientWidth * .72), behavior: 'smooth' });
  };

  const style = {
    '--products-bg': backgroundColor || 'var(--page-background, #ffffff)', '--products-title': titleColor || '#1a1a1a',
    '--products-text': textColor || '#666666', '--products-accent': accentColor || '#c9a84c',
    '--products-columns': Math.min(5, Math.max(3, Number(desktopColumns) || 4)),
    '--products-mobile-columns': Math.min(2, Math.max(1, Number(mobileColumns) || 2)),
  } as CSSProperties;

  const cards = (items: NormalizedProduct[], wrapperClass: string) => <div className={wrapperClass}>{items.map((product, idx) => <div className="products-section__card-slot" key={product.id}><ProductCard product={product} priority={idx < 4} /></div>)}</div>;

  return (
    <section className={`products-section products-section--${layout} scroll-fade-up ${className}`} style={style}>
      <div className={`products-section__inner products-section__inner--${headingAlignment}`}>
        <header className="products-section__header"><div><h2 className="products-section__title">{title}</h2>{subtitle && <p className="products-section__subtitle">{subtitle}</p>}<div className="products-section__divider" /></div>{showViewAll && headingAlignment === 'left' && <a className="products-section__view-all products-section__view-all--header" href={safeLink(viewAllUrl)}>{viewAllLabel}<span aria-hidden="true">→</span></a>}</header>

        {layout === 'editorial' && <div className="products-section__editorial"><aside className="products-section__story" style={editorialImage || products[0]?.image ? { backgroundImage: `linear-gradient(180deg, transparent 28%, rgba(14,28,18,.78)), url("${editorialImage || products[0]?.image}")` } : undefined}><div className="products-section__story-copy"><span>{editorialEyebrow}</span><h3>{editorialTitle}</h3><a href={safeLink(editorialCtaUrl)}>{editorialCtaLabel} <b aria-hidden="true">→</b></a></div></aside>{cards(visibleProducts.slice(0, 4), 'products-section__editorial-products')}</div>}

        {layout === 'spotlight' && <div className="products-section__spotlight">{visibleProducts.map((product, idx) => <div key={product.id} className={`products-section__card-slot ${idx === 0 ? 'products-section__card-slot--hero' : ''}`}><ProductCard product={product} priority={idx < 4} /></div>)}</div>}

        {layout === 'shelf' && <div className="products-section__shelf-wrapper"><button className="products-section__nav products-section__nav--prev" onClick={() => scroll('left')} aria-label="Previous products">‹</button><div className="products-section__shelf" ref={sliderRef}>{visibleProducts.map((product, idx) => <div key={product.id} className="products-section__shelf-item"><ProductCard product={product} priority={idx < 4} /></div>)}</div><button className="products-section__nav products-section__nav--next" onClick={() => scroll('right')} aria-label="Next products">›</button></div>}

        {layout === 'category-tabs' && <>{categories.length > 1 && <div className="products-section__tabs" role="tablist" aria-label={`${title} categories`}><button role="tab" aria-selected={activeCategory === 'All'} className={activeCategory === 'All' ? 'active' : ''} onClick={() => setSelectedCategory('All')}>All</button>{categories.map((category) => <button role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)} key={category}>{category}</button>)}</div>}{cards(visibleProducts, 'products-section__collection')}</>}

        {layout === 'curated' && cards(visibleProducts, 'products-section__collection')}
        {showViewAll && headingAlignment !== 'left' && <a className="products-section__view-all" href={safeLink(viewAllUrl)}>{viewAllLabel}<span aria-hidden="true">→</span></a>}
      </div>
    </section>
  );
}

