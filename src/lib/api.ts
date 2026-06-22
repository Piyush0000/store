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
  homePageConfig: { heroEnabled: boolean; featuredEnabled: boolean; categoriesEnabled: boolean; images: string[]; videoUrl?: string };
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
  navLinks: { label: string; href: string }[];
  ctaButtons: any[];
  features: { title: string; description: string; icon: string }[];
  productSections: { id: string; type: string; title: string; subtitle?: string; categoryFilter?: string; limit: number }[];
  newsletter: { heading: string; subtext: string };
  announcementBar: { text: string };
  metaTitle: string;
  metaDescription: string;
  headerStyle?: any;
  footerStyle?: any;
  footerContent?: any;
  categoryImages?: Record<string, string>;
  reelsSection?: {
    enabled?: boolean;
    reels?: Array<{ id: string; title: string; sub: string; category: string; videoUrl: string; ctaLink?: string }>;
  };
  testimonialsSection?: {
    enabled?: boolean;
    title?: string;
    testimonials?: Array<{ id: string; name: string; description: string; image?: string; rating?: number; date?: string; ctaLink?: string }>;
  };
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
  type: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'REFUND_POLICY' | 'SHIPPING_POLICY';
  title: string;
  content: string;
}

export interface StorePage {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
    codFee?: number;
  };
  announcements: Announcement[];
  legalPages: LegalPage[];
  products: Product[];
  categories: string[];
  theme: { id: string; name: string; slug: string; category: string };
}

// ─── Public Endpoints ────────────────────────────────────────────────────────

const DUMMY_PRODUCTS = [
  {
    id: 'prod-1',
    slug: 'sample-product-1',
    name: 'Sample Product',
    description: 'This is a sample product description. It highlights the features of the item.',
    price: 1999,
    compareAtPrice: 2999,
    sku: 'SMP-001',
    stock: 10,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
    category: 'sample-category',
    tags: ['sample', 'new'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variants: [],
    reviews: [],
    averageRating: 4.5,
    reviewCount: 12,
  },
  {
    id: 'prod-2',
    slug: 'sample-product-2',
    name: 'Featured Item',
    description: 'Another sample product to demonstrate layout and styling.',
    price: 3499,
    compareAtPrice: 4999,
    sku: 'SMP-002',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'],
    category: 'sample-category',
    tags: ['featured', 'premium'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    variants: [],
    reviews: [],
    averageRating: 4.8,
    reviewCount: 24,
  }
] as Product[];

const MOCK_STOREFRONT: StorefrontData = {
  success: true,
  store: { id: 's-1', name: 'Demo Store', subdomain: 'demo', customDomain: null, description: 'Welcome to our generic demo store.', logo: null, category: 'General', theme: 'default', createdAt: '' },
  customization: {} as any,
  settings: { currency: 'INR', timezone: 'Asia/Kolkata', contactEmail: 'contact@example.com', contactPhone: '', enabledGateways: {}, codFee: 40 },
  announcements: [],
  legalPages: [],
  products: DUMMY_PRODUCTS,
  categories: ['sample-category', 'featured-items'],
  theme: { id: '1', name: 'default', slug: 'default', category: 'all' }
};

export async function fetchStorefront(subdomain?: string): Promise<StorefrontData> {
  try {
    const apiUrl = getApiUrl(subdomain);
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch storefront');
    return data;
  } catch (err) {
    return MOCK_STOREFRONT;
  }
}

export async function fetchProduct(id: string, subdomain?: string): Promise<Product> {
  try {
    const apiUrl = `${getApiUrl(subdomain)}/products/${id}`;
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || `Failed to fetch product ${id}`);
    return data.product;
  } catch (err) {
    return DUMMY_PRODUCTS.find(p => p.id === id) || DUMMY_PRODUCTS[0];
  }
}

export async function fetchAnnouncements(subdomain?: string): Promise<Announcement[]> {
  const apiUrl = `${getApiUrl(subdomain)}/announcements`;

  const res = await fetch(apiUrl, { cache: 'no-store' });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || 'Failed to fetch announcements');
  return data.announcements || [];
}

export async function fetchLegal(subdomain?: string): Promise<LegalPage[]> {
  const apiUrl = `${getApiUrl(subdomain)}/legal`;

  const res = await fetch(apiUrl, { cache: 'no-store' });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || 'Failed to fetch legal pages');
  return data.legalPages || [];
}

export async function fetchPages(subdomain?: string): Promise<StorePage[]> {
  const apiUrl = `${getApiUrl(subdomain)}/pages`;

  const res = await fetch(apiUrl, { cache: 'no-store' });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || 'Failed to fetch pages');
  return data.pages || [];
}

export async function fetchPageBySlug(slug: string, subdomain?: string): Promise<StorePage> {
  const apiUrl = `${getApiUrl(subdomain)}/pages/${slug}`;

  const res = await fetch(apiUrl, { cache: 'no-store' });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || `Failed to fetch page ${slug}`);
  return data.page;
}

export async function submitReview(review: {
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
}, subdomain?: string): Promise<{ message: string; review: Partial<ProductReview> }> {
  const apiUrl = `${getApiUrl(subdomain)}/reviews`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || 'Failed to submit review');
  return data;
}

// ─── Checkout API Endpoints ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AddressData {
  id: string;
  type: string;
  flatHouse: string;
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  isDefault: boolean;
}

export interface UserData {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  addresses: AddressData[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export interface OrderData {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

// ─── User Services ─────────────────────────────────────────────────────────────

export async function getUserByPhone(phone: string): Promise<ApiResponse<UserData>> {
  return {
    success: true,
    data: {
      id: `user_${phone.replace(/\D/g, "")}`,
      phone,
      email: '',
      firstName: '',
      lastName: '',
      isVerified: true,
      addresses: [],
    },
  };
}

export async function createOrUpdateUser(data: {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<ApiResponse<UserData>> {
  return {
    success: true,
    data: {
      id: `user_${data.phone.replace(/\D/g, "")}`,
      phone: data.phone,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      isVerified: true,
      addresses: [],
    },
  };
}

// ─── Address Services ─────────────────────────────────────────────────────────

export async function createAddress(data: {
  userId: string;
  type: string;
  flatHouse: string;
  areaStreet: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  isDefault: boolean;
}): Promise<ApiResponse<AddressData>> {
  return {
    success: true,
    data: {
      id: `addr_${Date.now()}`,
      ...data,
    },
  };
}

// ─── Order Services ────────────────────────────────────────────────────────────

export async function createOrder(data: {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  shippingAddress?: AddressData;
}): Promise<ApiResponse<OrderData>> {
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    data: {
      id: orderId,
      items: data.items,
      totalAmount: data.totalAmount,
      status: data.paymentMethod === 'COD' ? 'COD_CONFIRMED' : 'PENDING',
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    },
  };
}

// ─── Checkout Session ────────────────────────────────────────────────────────

const CHECKOUT_SESSION_KEY = 'checkout_session';
const SESSION_DURATION_MS = 60 * 60 * 1000;

export function createCheckoutSession(phone: string): void {
  if (typeof window === 'undefined') return;

  const session = {
    phone,
    deviceId: crypto.randomUUID?.() || Math.random().toString(36),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };

  localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
}

export function validateCheckoutSession(): { valid: boolean; phone?: string } {
  if (typeof window === 'undefined') {
    return { valid: false };
  }

  try {
    const stored = localStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!stored) {
      return { valid: false };
    }

    const session = JSON.parse(stored);
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < new Date()) {
      localStorage.removeItem(CHECKOUT_SESSION_KEY);
      return { valid: false };
    }

    return { valid: true, phone: session.phone };
  } catch {
    return { valid: false };
  }
}

export function deleteCheckoutSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHECKOUT_SESSION_KEY);
  }
}