"use client";

import type { CSSProperties } from "react";
import "./TrustBadgesSection.css";

export type TrustBadge = {
  id: string;
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
};

export type TrustBadgesConfig = {
  enabled?: boolean;
  badges?: TrustBadge[];
  layout?: "classic" | "stacked" | "round" | "semicircle" | "matrix" | "minimal" | "horizontal";
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: number;
  animationEnabled?: boolean;
  animationDirection?: "rightToLeft" | "leftToRight";
  badgeSize?: number;
  logoSize?: number;
  backgroundColor?: string;
  badgeColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconColor?: string;
};

const clamp = (value: number | undefined, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? Number(value) : fallback));

export default function TrustBadgesSection({ config }: { config?: TrustBadgesConfig }) {
  if (!config || config.enabled === false) return null;

  const visibleBadges = (Array.isArray(config.badges) ? config.badges : []).filter(
    (badge) => badge && (badge.image || badge.title || badge.description),
  );
  if (!visibleBadges.length) return null;

  const layout = !config.layout || config.layout === "horizontal" ? "classic" : config.layout;
  const borderStyle = config.borderStyle || "solid";
  const badgeSize = clamp(config.badgeSize, 150, 96, 320);
  const logoSize = clamp(config.logoSize, 36, 18, Math.min(120, badgeSize - 28));
  const borderWidth = clamp(config.borderWidth, 1, 0, 8);
  const isAnimated = config.animationEnabled === true;
  const direction = config.animationDirection === "leftToRight" ? "ltr" : "rtl";

  const sectionStyle = {
    "--trust-badge-size": `${badgeSize}px`,
    "--trust-badge-logo-size": `${logoSize}px`,
    "--trust-badge-border-color": config.borderColor || "#e51b45",
    "--trust-badge-border-style": borderStyle,
    "--trust-badge-border-width": `${borderStyle === "none" ? 0 : borderWidth}px`,
    "--trust-badges-background": config.backgroundColor || "#ffffff",
    "--trust-badge-background": config.badgeColor || "#ffffff",
    "--trust-badge-title-color": config.titleColor || "#202020",
    "--trust-badge-description-color": config.descriptionColor || "#756963",
    "--trust-badge-icon-color": config.iconColor || "#e51b45",
  } as CSSProperties;

  const renderBadge = (badge: TrustBadge, index: number, copy = false) => (
    <article className="trust-badge-card" key={`${badge.id || index}-${copy ? "copy" : "original"}`}>
      <div className="trust-badge-icon-wrap">
        {badge.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={badge.image} alt={badge.imageAlt || badge.title || ""} className="trust-badge-img" />
        ) : (
          <span className="trust-badge-placeholder-icon" aria-hidden="true">✓</span>
        )}
      </div>
      <div className="trust-badge-content">
        {badge.title ? <strong className="trust-badge-title">{badge.title}</strong> : null}
        {badge.description ? <span className="trust-badge-desc">{badge.description}</span> : null}
      </div>
    </article>
  );

  const sectionClass = `trust-badges-section trust-badges--${layout}${isAnimated ? " trust-badges--scrolling" : ""}`;
  if (isAnimated) {
    return (
      <section className={sectionClass} style={sectionStyle} aria-label="Store Benefits">
        <div className="trust-badges-marquee-wrap">
          <div className={`trust-badges-marquee-track ${direction}`}>
            {[false, true].map((copy) => (
              <div className="trust-badges-group" aria-hidden={copy || undefined} key={String(copy)}>
                {visibleBadges.map((badge, index) => renderBadge(badge, index, copy))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} style={sectionStyle} aria-label="Store Benefits">
      <div className="trust-badges-grid">
        {visibleBadges.map((badge, index) => renderBadge(badge, index))}
      </div>
    </section>
  );
}
