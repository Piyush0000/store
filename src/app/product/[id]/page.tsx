import { notFound } from "next/navigation";
import { fetchStorefront, Testimonial, TestimonialSection } from "@/lib/api";
import { getServerSubdomain } from "@/lib/server-utils";
import ProductClient from "./ProductClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  let products: any[] = [];
  let product: any = null;
  let testimonialSection: TestimonialSection | null = null;
  let reelsSection: any = null;
  try {
    // Cache for 60 seconds to avoid hammering the API
    const subdomain = await getServerSubdomain();

    const data = await fetchStorefront(subdomain);
    products = data.products || [];
    product = products.find((p: any) => p.id === id || p.slug === id);
    testimonialSection =
      (data?.customization?.testimonialsSection as TestimonialSection) || null;
    reelsSection = data?.customization?.reelsSection || null;
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
  const reviewMode = customFields?.reviewMode || "homepage";
  const productReviews = Array.isArray(customFields?.productReviews) ? customFields.productReviews : [];

  let effectiveTestimonials = testimonialSection;
  if (reviewMode === "product" && productReviews.length > 0) {
    const mappedReviews = productReviews.map((r: any, idx: number) => ({
      id: r.id || `product-review-${idx}`,
      name: r.name || r.author || "Customer",
      rating: typeof r.rating === "number" ? r.rating : 5,
      description: r.description || r.text || r.review || "",
      image: r.image || r.avatar || "",
      date: r.date || "",
      ctaLink: r.ctaLink || "",
      verified: true,
    }));

    effectiveTestimonials = {
      ...(testimonialSection || {}),
      enabled: true,
      title: testimonialSection?.title || "Customer Reviews",
      heading: (testimonialSection as any)?.heading || testimonialSection?.title || "Customer Reviews",
      displayType: (testimonialSection as any)?.displayType || "classic",
      testimonials: mappedReviews,
      items: mappedReviews,
    } as any;
  }

  const normalizedProduct = { ...product, customFields };

  return (
    <ProductClient
      product={normalizedProduct}
      relatedProducts={relatedProducts}
      testimonials={effectiveTestimonials as any}
      reelsSection={reelsSection}
    />
  );
}
