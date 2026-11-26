import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCataloguePage, fetchStorefront, fetchProduct, Testimonial, TestimonialSection } from "@/lib/api";
import { getServerSubdomain, getServerStoreId } from "@/lib/server-utils";
import ProductClient from "./ProductClient";
import ProductCard from "@/components/ProductCard";

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

/** Async RSC — fetches related products independently so the main product page paints first */
async function RelatedProductsSection({
  subdomain,
  storeId,
  productId,
  targetCategory,
  fallbackCategory,
}: {
  subdomain: string;
  storeId: string;
  productId: string;
  targetCategory: string | undefined;
  fallbackCategory: string | undefined;
}) {
  let relatedProducts: any[] = [];
  try {
    const page = await fetchCataloguePage(subdomain, storeId, { category: targetCategory || undefined, limit: 5 });
    relatedProducts = page.products.filter((p: any) => p.id !== productId).slice(0, 4);

    if (relatedProducts.length === 0 && targetCategory !== fallbackCategory) {
      const fb = await fetchCataloguePage(subdomain, storeId, { category: fallbackCategory || undefined, limit: 5 });
      relatedProducts = fb.products.filter((p: any) => p.id !== productId).slice(0, 4);
    }
  } catch {
    return null;
  }

  if (relatedProducts.length === 0) return null;

  return (
    <section className="featured-collection scroll-fade-up" data-orbit-section-id="related-products" data-orbit-section-type="relatedProducts">
      <h2 className="section-title inline-block mb-2">YOU MAY ALSO LIKE</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6 grid-rows-auto gap-2">
        {relatedProducts.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function RelatedProductsSkeleton() {
  return (
    <section className="featured-collection scroll-fade-up">
      <div
        className="layer-shimmer mb-4 rounded"
        style={{ height: "24px", width: "180px", borderRadius: "6px" }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6 grid-rows-auto gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="layer-shimmer rounded-xl"
            style={{ aspectRatio: "3/4", borderRadius: "12px" }}
          />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const subdomain = await getServerSubdomain();
    const storeId = await getServerStoreId();
    const product = await fetchProduct(id, subdomain, storeId);
    if (!product) return {};
    const title = product.name;
    const description = product.description ? product.description.slice(0, 160) : product.name;
    const image = product.images?.[0] ? [{ url: product.images[0] }] : [];
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image,
      },
    };
  } catch {
    return {};
  }
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
  let productPageSettings: Record<string, any> = {};
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
    const pageCustomization = data?.customization as any;
    productPageSettings = {
      ...(pageCustomization?.homePageConfig?.productPageSettings || {}),
      ...(pageCustomization?.homePageConfig?.productPageOverrides?.[product?.id] || {}),
    };
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
  } catch (error: any) {
    console.error("Failed to fetch product:", error);
    // If the backend explicitly reported 404 (product doesn't exist), show notFound()
    // For any outage, network glitch, or 500 error, throw to error.tsx (503) so search engines don't de-index
    if (error && (String(error?.message).includes("404") || error?.status === 404)) {
      notFound();
    }
    throw error;
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
    <>
      <ProductClient
        product={normalizedProduct}
        relatedProducts={[]}
        testimonials={effectiveTestimonials as any}
        reelsSection={reelsSection}
        subdomain={subdomain}
        codEnabled={codEnabled}
        globalBadges={globalBadges}
        productPageSettings={productPageSettings}
      />
      {/* Stream related products after main product paints — "loads in layers" effect */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection
          subdomain={subdomain}
          storeId={storeId}
          productId={product.id}
          targetCategory={targetCategory}
          fallbackCategory={product.category}
        />
      </Suspense>
    </>
  );
}
