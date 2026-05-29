import { fetchStorefront, type Customization, type StorefrontData } from '@/lib/api';
import HomeClient from './HomeClient';
import './page.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  console.log('[PAGE:Home] Rendering HomePage');
  console.log('[PAGE:Home] Force dynamic mode enabled');

  let customization: Customization | null = null;
  let categories: string[] = [];
  let bestSellers: any[] = [];

  try {
    console.log('[PAGE:Home] Fetching storefront data...');
    const data: StorefrontData = await fetchStorefront();
    console.log('[PAGE:Home] Storefront fetched successfully');
    console.log('[PAGE:Home] Store name:', data.store?.name);
    console.log('[PAGE:Home] Total products:', data.products?.length);
    console.log('[PAGE:Home] Categories:', data.categories);

    customization = data.customization;
    categories = data.categories || [];
    bestSellers = data.products || [];
    console.log('[PAGE:Home] Products count:', bestSellers.length);
  } catch (error) {
    console.error('[PAGE:Home] Failed to fetch data:', error);
  }

  console.log('[PAGE:Home] Rendering HomeClient with', bestSellers.length, 'products');

  return <HomeClient
    bestSellers={bestSellers}
    customization={customization}
    categories={categories}
  />;
}