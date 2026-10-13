function variantOptions(variant: any): Record<string, unknown> {
  const raw = variant?.options;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" && !Array.isArray(raw) ? raw : {};
}

export function isVariantActive(variant: any): boolean {
  if (!variant) return false;
  const options = variantOptions(variant);
  if (options.isActive === false) return false;
  if (variant.isActive === false) return false;
  return true;
}

export function isVariantUnavailable(variant: any): boolean {
  if (!variant) return true;
  if (!isVariantActive(variant)) return true;
  const n = Number(variant.stock);
  return Number.isFinite(n) && n <= 0;
}

export function availableStock(product: any, variant?: any | null): number {
  if (variant != null) {
    if (isVariantUnavailable(variant)) return 0;
    if (variant.stock != null && variant.stock !== "") {
      const n = Number(variant.stock);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
  }

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variantStocks = variants
    .filter((item: any) => isVariantActive(item))
    .map((item: any) => item?.stock)
    .filter((value: unknown) => value != null && value !== "")
    .map((value: unknown) => Number(value))
    .filter((n: number) => Number.isFinite(n));

  if (variantStocks.length > 0) {
    return Math.max(0, ...variantStocks);
  }

  if (variants.length > 0 && variants.every((item: any) => isVariantUnavailable(item))) {
    return 0;
  }

  if (product?.stock != null && product.stock !== "") {
    const n = Number(product.stock);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }

  return 1;
}

export function isOutOfStock(product: any, variant?: any | null): boolean {
  return availableStock(product, variant) <= 0;
}
