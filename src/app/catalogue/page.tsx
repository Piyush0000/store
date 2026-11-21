import { Suspense } from 'react';
import { fetchCataloguePage, fetchStorefront } from '@/lib/api';
import { getServerSubdomain, getServerStoreId } from '@/lib/server-utils';
import CatalogueClient from './CatalogueClient';
import { CategorySkeleton, ProductGridSkeleton } from './Skeleton';
import './catalogue.css';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  let products: any[] = [];
  let categories: string[] = [];
  let total = 0;
  let hasMore = false;
  let subdomain = '';
  let storeId = '';
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const sort = value('sort');
  const ratingMode = sort === 'rating';

  try {
    subdomain = await getServerSubdomain();
    storeId = await getServerStoreId();
    const categoryKey = value('category').toLowerCase();
    const filters = {
      search: value('q') || value('search') || value('query'),
      stream: value('stream'),
      sort: sort === 'price-low' || sort === 'price-high' ? sort : undefined,
    };
    const dataPromise = fetchStorefront(subdomain, storeId, { includeProducts: false, includeLegal: false });
    const firstPagePromise = !ratingMode && (!categoryKey || categoryKey === 'all')
      ? fetchCataloguePage(subdomain, storeId, filters)
      : null;
    const data = await dataPromise;
    categories = data.categories || [];
    if (ratingMode) {
      const full = await fetchStorefront(subdomain, storeId);
      products = full.products || [];
      total = products.length;
    } else {
      const category = categories.find(name => name.toLowerCase().replace(/\s+/g, '-') === categoryKey);
      const page = firstPagePromise ? await firstPagePromise : await fetchCataloguePage(subdomain, storeId, {
        ...filters,
        category: categoryKey && categoryKey !== 'all' ? category || categoryKey : undefined,
      });
      products = page.products;
      total = page.pagination.total;
      hasMore = page.pagination.hasMore;
    }
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
      <CatalogueClient
        key={JSON.stringify(params)}
        products={products}
        categories={categories}
        total={total}
        hasMore={hasMore}
        subdomain={subdomain}
        storeId={storeId}
        ratingMode={ratingMode}
      />
    </Suspense>
  );
}
