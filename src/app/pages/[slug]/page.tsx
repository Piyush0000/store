export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/api';
import { getServerSubdomain } from '@/lib/server-utils';
import '@/app/policy.css';

const formatContent = (text: string) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  return text
    .split(/\n\s*\n/)
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;
  const subdomain = await getServerSubdomain();

  let page: any = null;

  try {
    page = await fetchPageBySlug(slug, subdomain);
  } catch (error) {
    console.error(`Failed to fetch custom page for slug "${slug}":`, error);
  }

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <div className="policy-page">
      <div className="policy-page__header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>{page.title}</h1>
      </div>
      <div 
        className="policy-content" 
        dangerouslySetInnerHTML={{ __html: formatContent(page.content) }} 
      />
    </div>
  );
}
