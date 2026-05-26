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

export async function fetchStorefront(): Promise<StorefrontData> {
  const apiUrl = getApiUrl();
  console.log('[API] fetchStorefront called');
  console.log('[API] URL:', apiUrl);

  const res = await fetch(apiUrl, { cache: 'no-store' });
  console.log('[API] Response status:', res.status);

  const data = await res.json();
  console.log('[API] Success:', data.success);

  if (data.success) {
    console.log('[API] Store:', data.store?.name);
    console.log('[API] Products:', data.products?.length);
    console.log('[API] Categories:', data.categories);
    console.log('[API] Customization keys:', Object.keys(data.customization || {}));
  } else {
    console.log('[API] Error:', data.message);
  }

  if (!data.success) throw new Error(data.message || 'Failed to fetch storefront');
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const apiUrl = `${getApiUrl()}/products/${id}`;
  console.log('[API] fetchProduct called');
  console.log('[API] URL:', apiUrl);
  console.log('[API] Product ID:', id);

  const res = await fetch(apiUrl, { cache: 'no-store' });
  console.log('[API] Response status:', res.status);

  const data = await res.json();
  console.log('[API] Success:', data.success);

  if (data.success) {
    console.log('[API] Product:', data.product?.name);
    console.log('[API] Price:', data.product?.price);
    console.log('[API] Stock:', data.product?.stock);
  } else {
    console.log('[API] Error:', data.message);
  }

  if (!data.success) throw new Error(data.message || `Failed to fetch product ${id}`);
  return data.product;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const apiUrl = `${getApiUrl()}/announcements`;
  console.log('[API] fetchAnnouncements called');
  console.log('[API] URL:', apiUrl);

  const res = await fetch(apiUrl, { cache: 'no-store' });
  console.log('[API] Response status:', res.status);

  const data = await res.json();
  console.log('[API] Success:', data.success);
  console.log('[API] Announcements count:', data.announcements?.length);

  if (!data.success) throw new Error(data.message || 'Failed to fetch announcements');
  return data.announcements || [];
}

export async function fetchLegal(): Promise<LegalPage[]> {
  const apiUrl = `${getApiUrl()}/legal`;
  console.log('[API] fetchLegal called');
  console.log('[API] URL:', apiUrl);

  const res = await fetch(apiUrl, { cache: 'no-store' });
  console.log('[API] Response status:', res.status);

  const data = await res.json();
  console.log('[API] Success:', data.success);
  console.log('[API] Legal pages count:', data.legalPages?.length);

  if (data.legalPages) {
    data.legalPages.forEach((page: LegalPage) => {
      console.log('[API] Legal page type:', page.type);
    });
  }

  if (!data.success) throw new Error(data.message || 'Failed to fetch legal pages');
  return data.legalPages || [];
}

export async function submitReview(review: {
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
}): Promise<{ message: string; review: Partial<ProductReview> }> {
  const apiUrl = `${getApiUrl()}/reviews`;
  console.log('[API] submitReview called');
  console.log('[API] URL:', apiUrl);
  console.log('[API] Review data:', { productId: review.productId, rating: review.rating, title: review.title });

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  console.log('[API] Response status:', res.status);

  const data = await res.json();
  console.log('[API] Success:', data.success);
  console.log('[API] Message:', data.message);

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
  console.log('[API] getUserByPhone called');
  console.log('[API] Phone:', phone);
  console.log('[API] ⚠️ MOCK FUNCTION - returns dummy data');

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
  console.log('[API] createOrUpdateUser called');
  console.log('[API] Data:', data);
  console.log('[API] ⚠️ MOCK FUNCTION - returns dummy data');

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
  console.log('[API] createAddress called');
  console.log('[API] User ID:', data.userId);
  console.log('[API] ⚠️ MOCK FUNCTION - returns dummy data');

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
  console.log('[API] createOrder called');
  console.log('[API] User ID:', data.userId);
  console.log('[API] Items:', data.items.length);
  console.log('[API] Total:', data.totalAmount);
  console.log('[API] Payment:', data.paymentMethod);
  console.log('[API] ⚠️ MOCK FUNCTION - returns dummy order');

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  console.log('[API] Generated Order ID:', orderId);

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
  console.log('[API] createCheckoutSession called');
  console.log('[API] Phone:', phone);

  const session = {
    phone,
    deviceId: crypto.randomUUID?.() || Math.random().toString(36),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };

  console.log('[API] Session created:', session);

  if (typeof window !== 'undefined') {
    localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
    console.log('[API] Session saved to localStorage');
  }
}

export function validateCheckoutSession(): { valid: boolean; phone?: string } {
  console.log('[API] validateCheckoutSession called');

  if (typeof window === 'undefined') {
    console.log('[API] Server-side, returning invalid');
    return { valid: false };
  }

  try {
    const stored = localStorage.getItem(CHECKOUT_SESSION_KEY);
    console.log('[API] Stored session:', stored);

    if (!stored) {
      console.log('[API] No session found');
      return { valid: false };
    }

    const session = JSON.parse(stored);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    console.log('[API] Session expires:', expiresAt);
    console.log('[API] Current time:', now);
    console.log('[API] Is expired:', expiresAt < now);

    if (expiresAt < now) {
      localStorage.removeItem(CHECKOUT_SESSION_KEY);
      console.log('[API] Session expired, removed');
      return { valid: false };
    }

    console.log('[API] Session valid, phone:', session.phone);
    return { valid: true, phone: session.phone };
  } catch {
    console.error('[API] Session parse error');
    return { valid: false };
  }
}

export function deleteCheckoutSession(): void {
  console.log('[API] deleteCheckoutSession called');

  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHECKOUT_SESSION_KEY);
    console.log('[API] Session removed from localStorage');
  }
}