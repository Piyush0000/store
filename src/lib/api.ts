import { getApiUrl } from './config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  headerBackground: string;
  headerText: string;
  footerBackground: string;
  footerText: string;
  textColor: string;
}

export interface Customization {
  logo: string | null;
  favicon: string | null;
  brandColors: BrandColors;
  typography: { headingFont: string; bodyFont: string };
  heroSection: { title: string; subtitle: string; backgroundImage: string; ctaText: string; ctaLink: string };
  aboutSection: { title: string; content: string; image: string };
  contactInfo: { email: string; phone: string; address: string };
  headerConfig: { showSearch: boolean; showCart: boolean; showWishlist: boolean; storeName: string; logoUrl: string };
  footerConfig: { showAbout: boolean; showContact: boolean; showSocial: boolean; showNewsletter: boolean };
  homePageConfig: { heroEnabled: boolean; featuredEnabled: boolean; categoriesEnabled: boolean; images: string[] };
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
  navLinks: { label: string; href: string }[];
  ctaButtons: any[];
  features: { title: string; description: string; icon: string }[];
  productSections: { id: string; type: string; title: string; limit: number }[];
  newsletter: { heading: string; subtext: string };
  announcementBar: { text: string };
  metaTitle: string;
  metaDescription: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  sku: string;
  stock: number;
  images: string[];
  category: string;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  variants: ProductVariant[];
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  link: string;
  backgroundColor: string;
  textColor: string;
}

export interface LegalPage {
  type: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'REFUND_POLICY';
  title: string;
  content: string;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  description: string;
  logo: string | null;
  category: string;
  theme: string;
  createdAt: string;
}

export interface StorefrontData {
  success: boolean;
  store: Store;
  customization: Customization;
  settings: {
    currency: string;
    timezone: string;
    contactEmail: string;
    contactPhone: string;
    enabledGateways: Record<string, { enabled: boolean; keyId: string }>;
  };
  announcements: Announcement[];
  legalPages: LegalPage[];
  products: Product[];
  categories: string[];
  theme: { id: string; name: string; slug: string; category: string };
}

// ─── Public Endpoints ────────────────────────────────────────────────────────

/** Main call — fetches everything in one request (cached 5 min on server) */
export async function fetchStorefront(): Promise<StorefrontData> {
  const res = await fetch(getApiUrl());
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch storefront');
  return data;
}

/** Single product with full variants + reviews */
export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${getApiUrl()}/products/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || `Failed to fetch product ${id}`);
  return data.product;
}

/** Fresh announcements for sliding carousel (not cached) */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${getApiUrl()}/announcements`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch announcements');
  return data.announcements || [];
}

/** All legal pages */
export async function fetchLegal(): Promise<LegalPage[]> {
  const res = await fetch(`${getApiUrl()}/legal`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch legal pages');
  return data.legalPages || [];
}

/** Submit a product review — requires merchant approval before showing */
export async function submitReview(review: {
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
}): Promise<{ message: string; review: Partial<ProductReview> }> {
  const res = await fetch(`${getApiUrl()}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to submit review');
  return data;
}