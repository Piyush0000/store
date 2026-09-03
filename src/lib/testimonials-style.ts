// Layout styles for the storefront reviews section. The chosen style is stored on
// `testimonialsSection.displayType`, mirroring how `reelsSection.displayType` works.

export const TESTIMONIAL_DISPLAY_TYPES = [
  "classic",
  "spotlight",
  "bento",
  "cinematic",
  "marquee",
  "summary",
] as const;

export type TestimonialDisplayType = (typeof TESTIMONIAL_DISPLAY_TYPES)[number];

export const DEFAULT_TESTIMONIAL_DISPLAY_TYPE: TestimonialDisplayType = "classic";

export interface Testimonial {
  id: string;
  name: string;
  description: string;
  image?: string;
  rating?: number;
  date?: string;
  ctaLink?: string;
}

export function resolveDisplayType(value: unknown): TestimonialDisplayType {
  return TESTIMONIAL_DISPLAY_TYPES.includes(value as TestimonialDisplayType)
    ? (value as TestimonialDisplayType)
    : DEFAULT_TESTIMONIAL_DISPLAY_TYPE;
}

/** A rating is only usable if it is a real 1-5 number. */
export function usableRating(value: unknown): number | null {
  const rating = typeof value === "string" ? parseFloat(value) : value;
  if (typeof rating !== "number" || !Number.isFinite(rating)) return null;
  const rounded = Math.round(rating);
  return rounded >= 1 && rounded <= 5 ? rounded : null;
}

export interface RatingSummary {
  average: number;
  /** How many reviews actually carried a rating — not the total review count. */
  ratedCount: number;
  totalCount: number;
  /** Index 0 is 1 star, index 4 is 5 stars. */
  distribution: number[];
}

/**
 * Reviews without a rating are excluded from the average rather than counted as
 * zero, which would drag the score down for merchants who leave it blank.
 */
export function summarizeRatings(testimonials: Testimonial[]): RatingSummary {
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  let ratedCount = 0;

  for (const t of testimonials) {
    const rating = usableRating(t.rating);
    if (rating === null) continue;
    distribution[rating - 1] += 1;
    total += rating;
    ratedCount += 1;
  }

  return {
    average: ratedCount > 0 ? Math.round((total / ratedCount) * 10) / 10 : 0,
    ratedCount,
    totalCount: testimonials.length,
    distribution,
  };
}

/**
 * Bento tile spans, keyed off whether a review has a photo. Large image tiles are
 * spaced out so two never land side by side and swamp the grid.
 */
export function bentoSpan(index: number, hasImage: boolean): "wide" | "tall" | "normal" {
  if (hasImage && index % 5 === 0) return "tall";
  if (index % 5 === 3) return "wide";
  return "normal";
}
