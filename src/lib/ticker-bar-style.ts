// Scrolling ticker strip section, delivered on the `tickerBar` customization field.

export const TICKER_DISPLAY_TYPES = [
  "band",
  "dual",
  "ribbon",
  "outline",
  "pills",
  "label",
] as const;

export const TICKER_SPEEDS = ["slow", "medium", "fast"] as const;
export const TICKER_DIRECTIONS = ["left", "right"] as const;
export const TICKER_HEIGHTS = ["compact", "normal", "tall"] as const;
export const TICKER_SYMBOLS = [
  "zap",
  "star",
  "sparkles",
  "flame",
  "heart",
  "truck",
  "tag",
  "dot",
  "none",
] as const;

export type TickerDisplayType = (typeof TICKER_DISPLAY_TYPES)[number];
export type TickerSpeed = (typeof TICKER_SPEEDS)[number];
export type TickerDirection = (typeof TICKER_DIRECTIONS)[number];
export type TickerHeight = (typeof TICKER_HEIGHTS)[number];
export type TickerSymbol = (typeof TICKER_SYMBOLS)[number];

export interface TickerMessage {
  id: string;
  text: string;
  link?: string;
}

export interface TickerBarConfig {
  enabled: boolean;
  displayType: TickerDisplayType;
  messages: TickerMessage[];
  symbol: TickerSymbol;
  customSymbol: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  speed: TickerSpeed;
  direction: TickerDirection;
  height: TickerHeight;
  pauseOnHover: boolean;
  showEdges: boolean;
  tilt: number;
  label: string;
}

export const DEFAULT_TICKER_BAR: TickerBarConfig = {
  enabled: false,
  displayType: "band",
  messages: [],
  symbol: "zap",
  customSymbol: "",
  backgroundColor: "#fdeaea",
  textColor: "",
  accentColor: "#c9a84c",
  speed: "medium",
  direction: "left",
  height: "normal",
  pauseOnHover: false,
  showEdges: true,
  tilt: -2.5,
  label: "Offers",
};

/** Scroll rate in pixels per second — duration is derived from track width so
 *  the speed feels identical no matter how much text a merchant enters. */
export const TICKER_PIXELS_PER_SECOND: Record<TickerSpeed, number> = {
  slow: 30,
  medium: 55,
  fast: 90,
};

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;

function normalizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const color = value.trim();
  if (!color) return fallback;
  if (color.toLowerCase() === "transparent") return "transparent";
  if (HEX_COLOR.test(color)) return color.toLowerCase();
  if (RGB_COLOR.test(color)) return color.replace(/\s+/g, "");
  return fallback;
}

function pick<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

/** Only same-site paths and plain http(s) — never javascript: or data:. */
function normalizeLink(value: unknown): string {
  if (typeof value !== "string") return "";
  const link = value.trim();
  if (!link) return "";
  if (link.startsWith("/")) return link;
  if (/^https?:\/\//i.test(link)) return link;
  return "";
}

function normalizeMessages(value: unknown): TickerMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const raw: Record<string, unknown> =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : { text: item };
      return {
        id: typeof raw.id === "string" && raw.id ? raw.id : `ticker-${index}`,
        text:
          typeof raw.text === "string" ? raw.text.replace(/\s+/g, " ").trim() : "",
        link: normalizeLink(raw.link),
      };
    })
    .filter((m) => m.text);
}

/**
 * The editor's live preview pushes unsaved values straight into the page, so the
 * storefront re-validates rather than trusting the backend to have done it.
 */
export function resolveTickerBar(
  tickerBar: unknown,
): TickerBarConfig {
  const raw =
    tickerBar && typeof tickerBar === "object" && !Array.isArray(tickerBar)
      ? (tickerBar as Record<string, unknown>)
      : {};

  const tiltRaw =
    typeof raw.tilt === "string" ? parseFloat(raw.tilt) : (raw.tilt as number);

  return {
    enabled: raw.enabled === true || raw.enabled === "true",
    displayType: pick(raw.displayType, TICKER_DISPLAY_TYPES, DEFAULT_TICKER_BAR.displayType),
    messages: normalizeMessages(raw.messages),
    symbol: pick(raw.symbol, TICKER_SYMBOLS, DEFAULT_TICKER_BAR.symbol),
    customSymbol:
      typeof raw.customSymbol === "string" ? raw.customSymbol.trim().slice(0, 4) : "",
    backgroundColor: normalizeColor(raw.backgroundColor, DEFAULT_TICKER_BAR.backgroundColor),
    textColor: normalizeColor(raw.textColor, ""),
    accentColor: normalizeColor(raw.accentColor, DEFAULT_TICKER_BAR.accentColor),
    speed: pick(raw.speed, TICKER_SPEEDS, DEFAULT_TICKER_BAR.speed),
    direction: pick(raw.direction, TICKER_DIRECTIONS, DEFAULT_TICKER_BAR.direction),
    height: pick(raw.height, TICKER_HEIGHTS, DEFAULT_TICKER_BAR.height),
    pauseOnHover: raw.pauseOnHover === true || raw.pauseOnHover === "true",
    showEdges: raw.showEdges !== false,
    tilt:
      typeof tiltRaw === "number" && Number.isFinite(tiltRaw)
        ? Math.min(Math.max(tiltRaw, -8), 8)
        : DEFAULT_TICKER_BAR.tilt,
    label: typeof raw.label === "string" ? raw.label.replace(/\s+/g, " ").trim() : "",
  };
}

/** Black or white, whichever reads better on the chosen background. */
export function contrastingTextColor(background: string): string {
  const hex = background.replace("#", "").trim();
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return "#1c1c1c";

  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(expanded.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.55 ? "#1c1c1c" : "#ffffff";
}

export function resolvedTextColor(config: TickerBarConfig): string {
  if (config.textColor) return config.textColor;
  if (config.backgroundColor === "transparent") return "";
  return contrastingTextColor(config.backgroundColor);
}
