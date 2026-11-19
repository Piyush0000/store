import { notFound } from "next/navigation";
import { fetchCataloguePage, fetchStorefront, fetchProduct, Testimonial, TestimonialSection } from "@/lib/api";
import { getServerSubdomain, getServerStoreId } from "@/lib/server-utils";
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

  let product: any = null;
  let testimonialSection: TestimonialSection | null = null;
  let reelsSection: any = null;
  let subdomain = "";
  let storeId = "";
  let codEnabled = false;
  let globalBadges: { icon?: string; text?: string; color?: string }[] = [];
  try {
    // Cache for 60 seconds to avoid hammering the API
    subdomain = await getServerSubdomain();

    storeId = await getServerStoreId();
    const [data, detail] = await Promise.all([
      fetchStorefront(subdomain, storeId, { includeProducts: false, includeLegal: false }),
      fetchProduct(id, subdomain, storeId),
    ]);
    product = detail;
    testimonialSection =
      (data?.customization?.testimonialsSection as TestimonialSection) || null;
    reelsSection = data?.customization?.reelsSection || null;
    const rawGlobalBadge = data?.customization?.homePageConfig?.productPageBadge;
    const rawGlobalBadges = Array.isArray(rawGlobalBadge)
      ? rawGlobalBadge
      : rawGlobalBadge
        ? [rawGlobalBadge]
        : [];
    globalBadges = rawGlobalBadges
      .filter((item: any) => String(item?.text || "").trim() || String(item?.icon || "").trim())
      .slice(0, 6);
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

  let relatedProducts: any[] = [];
  try {
    const page = await fetchCataloguePage(subdomain, storeId, { category: targetCategory || undefined, limit: 5 });
    relatedProducts = page.products.filter(p => p.id !== product.id).slice(0, 4);

    if (relatedProducts.length === 0 && targetCategory !== product.category) {
      const fallback = await fetchCataloguePage(subdomain, storeId, { category: product.category || undefined, limit: 5 });
      relatedProducts = fallback.products.filter(p => p.id !== product.id).slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch related products:", error);
  }

  // Routing logic: product reviews take priority over homepage testimonials when set
  const reviewMode = customFields?.reviewMode ?? "homepage";
  const rawReviews = Array.isArray(customFields?.productReviews)
    ? customFields.productReviews
    : [];

  const productReviews = rawReviews
    .map((r: any, idx: number) => ({
      id: r?.id || `product-review-${idx}`,
      name: String(r?.name ?? r?.author ?? "").trim() || "Customer",
      rating: typeof r?.rating === "number" ? Math.max(1, Math.min(5, Math.round(r.rating))) : 5,
      description: String(r?.description ?? r?.text ?? r?.review ?? "").trim(),
      image: typeof r?.image === "string" ? r.image.trim() : "",
      date: typeof r?.date === "string" ? r.date.trim() : "",
      ctaLink: sanitizeCtaLink(r?.ctaLink),
    }))
    .filter((r: any) => r.description.length > 0 || r.image.length > 0);

  // If reviewMode is "product", show product reviews or hide them (never leak homepage reviews)
  const effectiveTestimonials =
    reviewMode === "product"
      ? productReviews.length > 0
        ? {
            ...(testimonialSection || {}),
            enabled: true,
            title: testimonialSection?.title || "CUSTOMERS FEEDBACK",
            displayType: (testimonialSection as any)?.displayType || "classic",
            testimonials: productReviews,
          }
        : null
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
      globalBadges={globalBadges}
    />
  );
}
