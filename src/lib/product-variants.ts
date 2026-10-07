export interface StorefrontVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
  images?: string[];
  options?: Record<string, unknown>;
}

export interface ProductWithVariants {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  variants?: StorefrontVariant[];
}

const metadataKeys = new Set([
  'isactive', 'compareatprice', 'status', 'sku', 'price', 'stock',
  'id', 'name', 'images',
]);

export function variantImages(variant: StorefrontVariant): string[] {
  const raw = Array.isArray(variant.images)
    ? variant.images
    : Array.isArray(variant.options?.images)
      ? variant.options.images
      : [];
  return raw.filter((url): url is string => typeof url === 'string' && Boolean(url.trim()));
}

export function variantSelection(
  product: ProductWithVariants,
  variant: StorefrontVariant,
  index: number,
): Record<string, string> {
  const options = Object.entries(variant.options || {}).filter(
    ([key, value]) => !metadataKeys.has(key.toLowerCase()) &&
      (typeof value === 'string' || typeof value === 'number') &&
      String(value).trim(),
  );
  if (options.length) {
    return Object.fromEntries(options.map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1), String(value),
    ]));
  }

  const names = product.variants?.map((item) => item.name?.trim() || '') || [];
  const allSizes = names.length > 0 && names.every((name) =>
    /^(?:xs|s|m|l|xl|xxl|xxxl|[2-7]xl)$/i.test(name),
  );
  const name = variant.name?.trim();
  const label = name && name !== product.name ? name : variant.sku?.trim() || `Option ${index + 1}`;
  return { [allSizes ? 'Size' : 'Option']: label };
}
