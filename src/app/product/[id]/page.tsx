import { notFound } from "next/navigation";
import { fetchStorefront, Testimonial, TestimonialSection } from "@/lib/api";
import { getServerSubdomain } from "@/lib/server-utils";
import ProductClient from "./ProductClient";
/**
 * Safely validates and sanitizes a URL.
 * - Rejects non-string inputs.
 * - Rejects any control characters, tabs, or newlines (prevents regex bypasses like `java\nscript:`).
 * - Allows safe relative URLs starting with `/`, `#`, or `?` (rejects `//` protocol-relative).
 * - Enforces an allowlist of protocols for absolute URLs: http:, https:, mailto:, tel:.
 */
function sanitizeCtaLink(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Reject ASCII control characters, newlines (\r, \n), tabs (\t), or null bytes
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return "";

  // Safe relative paths: must start with / (not //), #, or ?
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
    if (trimmed.startsWith("//")) return "";
    return trimmed;
  }

  // Absolute URLs: parse and enforce strict protocol allowlist
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:" || protocol === "tel:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }

  return "";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  let products: any[] = [];
  let product: any = null;
  let testimonialSection: TestimonialSection | null = null;
  let reelsSection: any = null;
  let subdomain = "";
  let codEnabled = false;
  try {
    // Cache for 60 seconds to avoid hammering the API
    subdomain = await getServerSubdomain();

    const data = await fetchStorefront(subdomain);
    products = data.products || [];
    product = products.find((p: any) => p.id === id || p.slug === id);
    testimonialSection =
      (data?.customization?.testimonialsSection as TestimonialSection) || null;
    reelsSection = data?.customization?.reelsSection || null;
    codEnabled = Boolean(data.settings?.enabledGateways?.cod?.enabled);
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  if (!product) {
    notFound();
  }

  let customFields: any = {};
  if (product.customFields) {
    if (typeof product.customFields === "string") {
      try {
        customFields = JSON.parse(product.customFields);
      } catch (e) {}
    } else {
      customFields = product.customFields;
    }
  }

  const targetCategory = customFields?.relatedCategory || product.category;

  let relatedProducts = products
    .filter((p: any) => p.category === targetCategory && p.id !== product.id)
    .slice(0, 4);

  // Fallback to same category if the chosen category has no products
  if (relatedProducts.length === 0 && targetCategory !== product.category) {
    relatedProducts = products
      .filter(
        (p: any) => p.category === product.category && p.id !== product.id,
      )
      .slice(0, 4);
  }

  // Routing logic: product reviews take priority over homepage testimonials when set
  const reviewMode = customFields?.reviewMode ?? "homepage";
  const productReviews = Array.isArray(customFields?.productReviews)
    ? customFields.productReviews.filter((r: any) => {
        const name = String(r?.name ?? r?.author ?? "").trim();
        const description = String(r?.description ?? r?.text ?? r?.review ?? "").trim();
        return name.length > 0 && description.length > 0;
      })
    : [];

  const effectiveTestimonials =
    reviewMode === "product" && productReviews.length > 0
      ? {
          ...(testimonialSection || {}),
          enabled: true,
          title: testimonialSection?.title || "CUSTOMERS FEEDBACK",
          displayType: (testimonialSection as any)?.displayType || "classic",
          testimonials: productReviews.map((r: any, idx: number) => ({
            id: r.id || `product-review-${idx}`,
            name: String(r?.name ?? r?.author ?? "Customer").trim(),
            rating: typeof r.rating === "number" ? Math.max(1, Math.min(5, Math.round(r.rating))) : 5,
            description: String(r?.description ?? r?.text ?? r?.review ?? "").trim(),
            image: typeof r?.image === "string" ? r.image.trim() : "",
            date: typeof r?.date === "string" ? r.date.trim() : "",
            ctaLink: sanitizeCtaLink(r?.ctaLink),
          })),
        }
      : testimonialSection;

  const normalizedProduct = { ...product, customFields };

  return (
    <ProductClient
      product={normalizedProduct}
      relatedProducts={relatedProducts}
      testimonials={effectiveTestimonials as any}
      reelsSection={reelsSection}
      subdomain={subdomain}
      codEnabled={codEnabled}
    />
  );
}
