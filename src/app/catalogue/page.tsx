import { Suspense } from 'react';
import { fetchStorefront } from '@/lib/api';
import CatalogueClient from './CatalogueClient';
import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './catalogue.css';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  console.log('[PAGE:Catalogue] Rendering CataloguePage');
  console.log('[PAGE:Catalogue] Force dynamic mode enabled');

  let products: any[] = [];
  let categories: string[] = [];

  try {
    console.log('[PAGE:Catalogue] Fetching storefront...');
    const data = await fetchStorefront();
    console.log('[PAGE:Catalogue] Storefront fetched');
    console.log('[PAGE:Catalogue] Products:', data.products?.length);
    console.log('[PAGE:Catalogue] Categories:', data.categories);

    products = data.products || [];
    categories = data.categories || [];
  } catch (error) {
    console.error('[PAGE:Catalogue] Failed to fetch:', error);
  }

  console.log('[PAGE:Catalogue] Rendering with', products.length, 'products and', categories.length, 'categories');

  return (
    <Suspense fallback={<CatalogueSkeletonLoading />}>
      <CatalogueClient products={products} categories={categories} />
    </Suspense>
  );
}

function CatalogueSkeletonLoading() {
  console.log('[PAGE:Catalogue] Showing skeleton loading state');
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