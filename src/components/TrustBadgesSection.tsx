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
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: number;
  animationEnabled?: boolean;
  animationDirection?: "rightToLeft" | "leftToRight";
  badgeSize?: number;
  logoSize?: number;
};

export default function TrustBadgesSection({
  config,
}: {
  config?: TrustBadgesConfig;
}) {
  if (!config || config.enabled === false) return null;

  const badges = Array.isArray(config.badges) ? config.badges : [];
  const visibleBadges = badges.filter(
    (b) => b && (b.image || b.title || b.description),
  );

  if (!visibleBadges.length) return null;

  const borderColor = config.borderColor || "#e51b45";
  const borderStyle = config.borderStyle || "solid";
  const borderWidth = borderStyle === "none" ? 0 : (config.borderWidth ?? 1);
  const badgeSize = config.badgeSize ? `${config.badgeSize}px` : "auto";
  const logoSize = config.logoSize ?? 36;
  const isAnimated = config.animationEnabled === true;
  const direction = config.animationDirection === "leftToRight" ? "ltr" : "rtl";

  const cardStyle: CSSProperties = {
    borderColor,
    borderStyle,
    borderWidth: `${borderWidth}px`,
    minWidth: isAnimated ? `${config.badgeSize || 200}px` : undefined,
  };

  const renderBadge = (badge: TrustBadge, index: number, keyPrefix = "") => (
    <article
      key={`${keyPrefix}${badge.id || index}`}
      style={cardStyle}
      className="trust-badge-card"
    >
      <div className="trust-badge-icon-wrap" style={{ width: logoSize, height: logoSize }}>
        {badge.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.image}
            alt={badge.imageAlt || badge.title || "Trust Badge"}
            className="trust-badge-img"
            style={{ width: logoSize, height: logoSize }}
          />
        ) : (
          <span
            className="trust-badge-placeholder-icon"
            style={{ width: logoSize, height: logoSize, fontSize: Math.max(14, logoSize * 0.45) }}
          >
            ✓
          </span>
        )}
      </div>
      <div className="trust-badge-content">
        {badge.title ? <strong className="trust-badge-title">{badge.title}</strong> : null}
        {badge.description ? (
          <span className="trust-badge-desc">{badge.description}</span>
        ) : null}
      </div>
    </article>
  );

  if (isAnimated) {
    // Double badges for seamless loop
    return (
      <section className="trust-badges-section" aria-label="Store Benefits">
        <div className="trust-badges-marquee-wrap">
          <div className={`trust-badges-marquee-track ${direction}`}>
            {visibleBadges.map((badge, idx) => renderBadge(badge, idx, "orig-"))}
            {visibleBadges.map((badge, idx) => renderBadge(badge, idx, "dup-"))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="trust-badges-section" aria-label="Store Benefits">
      <div className="trust-badges-grid">
        {visibleBadges.map((badge, idx) => renderBadge(badge, idx))}
      </div>
    </section>
  );
}
