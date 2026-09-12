'use client';

import React from 'react';
import './BannersSection.css';

interface Banner {
  id: string;
  image?: string;
  link?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  openInNewTab?: boolean;
}

interface BannersSectionProps {
  banners: Banner[];
  title?: string;
}

export default function BannersSection({ banners, title }: BannersSectionProps) {
  const activeBanners = (banners || []).filter(b => b && b.image && b.image.trim() !== "");

  if (activeBanners.length === 0) return null;

  return (
    <section className="banners-section scroll-fade-up">
      <div className="banners-section__container">
        {title && title.trim() !== "" && (
          <h2 className="banners-section__heading">{title}</h2>
        )}
        <div className={`banners-section__grid banners-section__grid--cols-${Math.min(activeBanners.length, 3)}`}>
          {activeBanners.map((banner) => {
            const hasTitle = Boolean(banner.title && banner.title.trim());
            const hasSubtitle = Boolean(banner.subtitle && banner.subtitle.trim());
            const hasButton = Boolean(banner.buttonText && banner.buttonText.trim());
            const hasOverlayContent = hasTitle || hasSubtitle || hasButton;

            const cardContent = (
              <div className="banners-section__card">
                <div className="banners-section__image-wrapper">
                  <img
                    src={banner.image}
                    alt={banner.title || 'Promo Banner'}
                    className="banners-section__image"
                    loading="lazy"
                  />
                  {hasOverlayContent && (
                    <div className="banners-section__overlay">
                      <div className="banners-section__content">
                        {hasTitle && <h3 className="banners-section__title">{banner.title}</h3>}
                        {hasSubtitle && <p className="banners-section__subtitle">{banner.subtitle}</p>}
                        {hasButton && (
                          <span className="banners-section__button">
                            {banner.buttonText}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );

            if (banner.link && banner.link.trim() !== "") {
              return (
                <a
                  key={banner.id}
                  href={banner.link}
                  target={banner.openInNewTab ? "_blank" : undefined}
                  rel={banner.openInNewTab ? "noopener noreferrer" : undefined}
                  className="banners-section__link"
                  aria-label={banner.title || banner.buttonText || 'Promo Banner'}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={banner.id} className="banners-section__wrapper">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
