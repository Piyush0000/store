import { Suspense } from 'react';
import { fetchStorefront } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import CatalogueClient from './CatalogueClient';
import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './catalogue.css';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  let products: any[] = [];
  let categories: string[] = [];

  try {
    const subdomain = await getServerSubdomain();
    const data = await fetchStorefront(subdomain);
    products = data.products || [];
    categories = data.categories || [];
  } catch (error) {
    console.error('[PAGE:Catalogue] Failed to fetch:', error);
  }

  return (
    <Suspense fallback={
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
    }>
      <CatalogueClient products={products} categories={categories} />
    </Suspense>
  );
}