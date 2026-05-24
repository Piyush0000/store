import { Suspense } from 'react';
import { fetchStorefront } from '@/lib/api';
import CatalogueClient from './CatalogueClient';
import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './catalogue.css';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  let products: any[] = [];
  let categories: string[] = [];

  try {
    const data = await fetchStorefront();
    products = data.products || [];
    categories = data.categories || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <Suspense fallback={<CatalogueSkeletonLoading />}>
      <CatalogueClient products={products} categories={categories} />
    </Suspense>
  );
}

function CatalogueSkeletonLoading() {
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
          <div className="catalogue__toolbar">
            <span>0 products</span>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}