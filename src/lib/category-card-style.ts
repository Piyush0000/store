import type { CSSProperties } from "react";

// Shape and stroke settings for the "Shop by Category" cards. They are delivered
// inside the `categoryImages` customization blob, alongside the
// `<category name> -> image url` entries, so these keys are reserved.

export const CATEGORY_CARD_SHAPES = [
  "rounded-rect",
  "circle",
  "squircle",
  "arch",
] as const;

export const CATEGORY_CARD_BORDER_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "double",
] as const;

export type CategoryCardShape = (typeof CATEGORY_CARD_SHAPES)[number];
export type CategoryCardBorderStyle =
  (typeof CATEGORY_CARD_BORDER_STYLES)[number];

export interface CategoryCardStyle {
  shape: CategoryCardShape;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  borderStyle: CategoryCardBorderStyle;
}

/** `categoryImages` mixes styling keys with `<category name> -> image url` entries. */
export type CategoryImagesConfig = Partial<CategoryCardStyle> &
  Record<string, unknown>;

export const DEFAULT_CATEGORY_CARD_STYLE: CategoryCardStyle = {
  shape: "rounded-rect",
  borderEnabled: false,
  borderColor: "#c9a84c",
  borderWidth: 2,
  borderStyle: "solid",
};

const MAX_BORDER_WIDTH = 12;

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;

// The backend validates these too, but the editor's live preview pushes raw
// unsaved values straight into the page, so re-check before emitting CSS.
function normalizeBorderColor(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_CATEGORY_CARD_STYLE.borderColor;
  const color = value.trim();
  if (!color) return DEFAULT_CATEGORY_CARD_STYLE.borderColor;
  if (color.toLowerCase() === "transparent") return "transparent";
  if (HEX_COLOR.test(color)) return color.toLowerCase();
  if (RGB_COLOR.test(color)) return color.replace(/\s+/g, "");
  return DEFAULT_CATEGORY_CARD_STYLE.borderColor;
}

function normalizeBorderWidth(value: unknown): number {
  const width = typeof value === "string" ? parseFloat(value) : value;
  if (typeof width !== "number" || !Number.isFinite(width)) {
    return DEFAULT_CATEGORY_CARD_STYLE.borderWidth;
  }
  return Math.min(Math.max(Math.round(width * 10) / 10, 0), MAX_BORDER_WIDTH);
}

export function resolveCategoryCardStyle(
  categoryImages: CategoryImagesConfig | null | undefined,
): CategoryCardStyle {
  const raw =
    categoryImages && typeof categoryImages === "object" ? categoryImages : {};

  return {
    shape: CATEGORY_CARD_SHAPES.includes(raw.shape as CategoryCardShape)
      ? (raw.shape as CategoryCardShape)
      : DEFAULT_CATEGORY_CARD_STYLE.shape,
    borderEnabled: raw.borderEnabled === true || (raw.borderEnabled as unknown) === "true",
    borderColor: normalizeBorderColor(raw.borderColor),
    borderWidth: normalizeBorderWidth(raw.borderWidth),
    borderStyle: CATEGORY_CARD_BORDER_STYLES.includes(
      raw.borderStyle as CategoryCardBorderStyle,
    )
      ? (raw.borderStyle as CategoryCardBorderStyle)
      : DEFAULT_CATEGORY_CARD_STYLE.borderStyle,
  };
}

/**
 * The stroke is applied through custom properties on the grid so every shape
 * variant in page.css inherits it without duplicating a rule per shape.
 */
export function categoryCardStyleVars(
  style: CategoryCardStyle,
): CSSProperties | undefined {
  if (!style.borderEnabled || style.borderWidth <= 0) return undefined;
  return {
    "--category-card-border-width": `${style.borderWidth}px`,
    "--category-card-border-style": style.borderStyle,
    "--category-card-border-color": style.borderColor,
  } as CSSProperties;
}
