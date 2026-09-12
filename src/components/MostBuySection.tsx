"use client";

import Link from "next/link";
import "./MostBuySection.css";

export type MostBuyConfig = {
  enabled?: boolean;
  image?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  sectionColor?: string;
  cardColor?: string;
  headingColor?: string;
  descriptionColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
};

export default function MostBuySection({
  config,
}: {
  config?: MostBuyConfig;
}) {
  if (!config || config.enabled === false) return null;

  const heading = config.heading || "Our Most Bought Product";
  const description = config.description;
  const buttonText = config.buttonText || "Shop Now";
  const buttonLink = config.buttonLink || "/catalogue";
  const sectionColor = config.sectionColor || "#ffffff";
  const cardColor = config.cardColor || "#ffffff";
  const headingColor = config.headingColor || "#202020";
  const descriptionColor = config.descriptionColor || "#656565";
  const buttonColor = config.buttonColor || "#111111";
  const buttonTextColor = config.buttonTextColor || "#ffffff";

  return (
    <section
      className="most-buy-section"
      style={{ backgroundColor: sectionColor }}
      aria-label={heading}
    >
      <div className="most-buy-card" style={{ backgroundColor: cardColor }}>
        <div className="most-buy-media-wrap">
          {config.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.image}
              alt={heading}
              className="most-buy-img"
            />
          ) : null}
        </div>
        <div className="most-buy-info">
          <h2 className="most-buy-heading" style={{ color: headingColor }}>
            {heading}
          </h2>
          {description ? (
            <p className="most-buy-desc" style={{ color: descriptionColor }}>
              {description}
            </p>
          ) : null}
          {buttonText ? (
            <Link
              href={buttonLink}
              className="most-buy-btn"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              {buttonText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
