import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './catalogue.css';

export default function CatalogueLoading() {
  return (
    <div className="catalogue" aria-busy="true">
      <div className="catalogue__header">
        <h1>ALL PRODUCTS</h1>
        <span className="catalogue__count">...</span>
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
