import { fetchStorefront, type Customization, type StorefrontData } from '@/lib/api';
import { buildSectionData, type HydratedSection } from '@/lib/products';
import { getServerSubdomain, getServerStoreId } from '@/lib/server-utils';
import HomeClient from './HomeClient';
import './page.css';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<any> | any }) {
  let customization: Customization | null = null;
  let categories: string[] = [];
  let bestSellers: any[] = [];
  let productSections: HydratedSection[] = [];

  try {
    const params = await searchParams;
    const querySubdomain = params?.subdomain;
    const queryStoreId = params?.storeId;
    const resolvedSubdomain = querySubdomain || (await getServerSubdomain());
    const storeId = queryStoreId || (await getServerStoreId());
    const data: StorefrontData = await fetchStorefront(resolvedSubdomain, storeId);

    customization = data.customization;
    categories = data.categories || [];
    bestSellers = data.products || [];

    if (customization?.productSections?.length) {
      productSections = await buildSectionData(customization.productSections, resolvedSubdomain);
    }
  } catch (error) {
    console.error('[HomePage] Failed to fetch storefront data:', error);
  }

  return (
    <HomeClient
      bestSellers={bestSellers}
      customization={customization}
      categories={categories}
      productSections={productSections}
    />
  );
}
