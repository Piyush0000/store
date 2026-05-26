import { fetchStorefront } from '@/lib/api';
import HomeClient from './HomeClient';
import './page.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  console.log('[PAGE:Home] Rendering HomePage');
  console.log('[PAGE:Home] Force dynamic mode enabled');

  let bestSellers: any[] = [];

  try {
    console.log('[PAGE:Home] Fetching storefront data...');
    const data = await fetchStorefront();
    console.log('[PAGE:Home] Storefront fetched successfully');
    console.log('[PAGE:Home] Store name:', data.store?.name);
    console.log('[PAGE:Home] Total products:', data.products?.length);

    bestSellers = (data.products || []).filter((p: any) => p.isBestSeller).slice(0, 4);
    console.log('[PAGE:Home] Best sellers count:', bestSellers.length);
  } catch (error) {
    console.error('[PAGE:Home] Failed to fetch data:', error);
  }

  console.log('[PAGE:Home] Rendering HomeClient with', bestSellers.length, 'best sellers');

  return <HomeClient bestSellers={bestSellers} />;
}