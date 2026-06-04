import { notFound } from 'next/navigation';
import { fetchStorefront } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import ProductClient from './ProductClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  let products: any[] = [];
  let product: any = null;

  try {
    // Cache for 60 seconds to avoid hammering the API
    const subdomain = await getServerSubdomain();
    const data = await fetchStorefront(subdomain);
    products = data.products || [];
    product = products.find((p: any) => p.id === id);
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((p: any) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}