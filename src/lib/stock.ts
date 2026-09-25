export function availableStock(product: any, variant?: any | null): number {
  if (variant != null && variant.stock != null && variant.stock !== "") {
    const n = Number(variant.stock);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variantStocks = variants
    .map((item: any) => item?.stock)
    .filter((value: unknown) => value != null && value !== "")
    .map((value: unknown) => Number(value))
    .filter((n: number) => Number.isFinite(n));

  if (variantStocks.length > 0) {
    return Math.max(0, ...variantStocks);
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
