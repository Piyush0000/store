import { resolveMediaUrl } from './media';

export interface NormalizedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  averageRating?: number;
  reviewCount?: number;
  images: string[];
}

export interface HydratedSection {
  id: string;
  title: string;
  subtitle?: string;
  categoryFilter?: string;
  limit?: number;
  layout?: 'curated' | 'editorial' | 'spotlight' | 'shelf' | 'category-tabs';
  sliderMode?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  headingAlignment?: 'left' | 'center';
  desktopColumns?: number;
  mobileColumns?: number;
  showViewAll?: boolean;
  viewAllLabel?: string;
  viewAllUrl?: string;
  editorialEyebrow?: string;
  editorialTitle?: string;
  editorialImage?: string;
  editorialCtaLabel?: string;
  editorialCtaUrl?: string;
  products: NormalizedProduct[];
}

// ─── Normalization ──────────────────────────────────────────────────────────────

function normalizeProduct(raw: any): NormalizedProduct {
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  return {
    id: raw.id ?? raw._id ?? '',
    slug: raw.slug ?? raw.id ?? raw._id ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    image: resolveMediaUrl(images[0] ?? ''),
    price: Number(raw.price ?? 0),
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : undefined,
    category: raw.category ?? '',
    isFeatured: Boolean(raw.isFeatured),
    isBestSeller: Boolean(raw.isBestSeller),
    isNewArrival: Boolean(raw.isNewArrival),
    averageRating: raw.averageRating ? Number(raw.averageRating) : undefined,
    reviewCount: raw.reviewCount ? Number(raw.reviewCount) : undefined,
    images: images.map((img) => resolveMediaUrl(img)),
  };
}

// ─── Sorting ────────────────────────────────────────────────────────────────────

function prioritizeProducts(products: NormalizedProduct[]): NormalizedProduct[] {
  return [...products].sort((a, b) => {
    const score = (p: NormalizedProduct) =>
      (p.isFeatured ? 8 : 0) +
      (p.isBestSeller ? 4 : 0) +
      (p.isNewArrival ? 2 : 0);
    return score(b) - score(a);
  });
}

// ─── Category filter parsing ────────────────────────────────────────────────────

/**
 * categoryFilter is a space-separated list of category slugs.
 * e.g. "flower phone-cases" → ["flower", "phone cases"]
 * Hyphens within a slug are converted to spaces to match API category names.
 */
function parseCategoryFilter(filter: string): string[] {
  if (!filter) return [];
  if (filter.includes(',')) {
    return filter.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [filter.trim()];
}

// ─── Fetching ───────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5002/api/storefront/public';

export async function getProductsByCategory(
  subdomain: string,
  category: string
): Promise<NormalizedProduct[]> {
  if (!API_BASE || !subdomain) return [];
  try {
    const url = `${API_BASE}/${subdomain}/products?category=${encodeURIComponent(category)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Handle multiple response shapes from the API
    const raw: any[] =
      (Array.isArray(data.products) ? data.products : null) ??
      (Array.isArray(data.data) ? data.data : null) ??
      (Array.isArray(data.data?.products) ? data.data.products : null) ??
      (Array.isArray(data.data?.data) ? data.data.data : null) ??
      [];
    return raw.filter(product => product.isActive !== false).map(normalizeProduct);
  } catch {
    return [];
  }
}

// ─── Section Hydration ──────────────────────────────────────────────────────────

export async function buildSectionData(
  productSections: Array<{
    id: string;
    title: string;
    subtitle?: string;
    categoryFilter?: string;
    limit?: number;
    type?: string;
    layout?: HydratedSection['layout'];
    sliderMode?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
    headingAlignment?: HydratedSection['headingAlignment'];
    desktopColumns?: number;
    mobileColumns?: number;
    showViewAll?: boolean;
    viewAllLabel?: string;
    viewAllUrl?: string;
    editorialEyebrow?: string;
    editorialTitle?: string;
    editorialImage?: string;
    editorialCtaLabel?: string;
    editorialCtaUrl?: string;
  }> | undefined,
  subdomain: string
): Promise<HydratedSection[]> {
  if (!productSections || productSections.length === 0) return [];

  const results = await Promise.all(
    productSections.map(async (section) => {
      let products: NormalizedProduct[] = [];

      if (section.categoryFilter?.trim()) {
        const categories = parseCategoryFilter(section.categoryFilter);

        // Fetch all categories in parallel
        const fetchedArrays = await Promise.all(
          categories.map(cat => getProductsByCategory(subdomain, cat))
        );

        // Merge and deduplicate by id
        const seen = new Set<string>();
        for (const arr of fetchedArrays) {
          for (const p of arr) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              products.push(p);
            }
          }
        }
      } else {
        // Fetch all products if no category filter is specified
        products = await getProductsByCategory(subdomain, "");
      }

      const sorted = prioritizeProducts(products);
      const limit = section.limit ?? 8;

      return {
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        categoryFilter: section.categoryFilter,
        limit,
        layout: section.layout || (section.sliderMode ? 'shelf' : 'curated'),
        sliderMode: Boolean(section.sliderMode),
        backgroundColor: section.backgroundColor,
        titleColor: section.titleColor,
        textColor: section.textColor,
        accentColor: section.accentColor,
        headingAlignment: section.headingAlignment,
        desktopColumns: section.desktopColumns,
        mobileColumns: section.mobileColumns,
        showViewAll: section.showViewAll,
        viewAllLabel: section.viewAllLabel,
        viewAllUrl: section.viewAllUrl,
        editorialEyebrow: section.editorialEyebrow,
        editorialTitle: section.editorialTitle,
        editorialImage: section.editorialImage ? resolveMediaUrl(section.editorialImage) : undefined,
        editorialCtaLabel: section.editorialCtaLabel,
        editorialCtaUrl: section.editorialCtaUrl,
        products: sorted.slice(0, limit),
      } satisfies HydratedSection;
    })
  );

  return results;
}
