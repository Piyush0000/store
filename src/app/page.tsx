import { fetchStorefront } from '@/lib/api';
import HomeClient from './HomeClient';
import './page.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let bestSellers: any[] = [];

  try {
    const data = await fetchStorefront();
    bestSellers = (data.products || []).filter((p: any) => p.isBestSeller).slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  return <HomeClient bestSellers={bestSellers} />;
}