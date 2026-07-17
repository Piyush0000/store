"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductsSection from "@/components/ProductsSection";
import ReelsSection from "@/components/ReelsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BannersSection from "@/components/BannersSection";
import type { HydratedSection } from "@/lib/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./page.css";

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
  slug?: string;
}

interface Customization {
  heroSection?: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  homePageConfig?: {
    heroEnabled?: boolean;
    featuredEnabled?: boolean;
    categoriesEnabled?: boolean;
    videoUrl?: string;
    images?: string[];
    mediaType?: string;
    imageUrl?: string;
    bannerOverlay?: boolean;
    showBorders?: boolean;
  };
  features?: { title: string; description: string; icon: string }[];
  aboutSection?: { title: string; content: string; image: string };
  newsletter?: { heading: string; subtext: string };
  categoryImages?: Record<string, string>;
  reelsSection?: {
    enabled?: boolean;
    reels?: Array<{
      id: string;
      title: string;
      sub: string;
      category: string;
      videoUrl: string;
      ctaLink?: string;
    }>;
  };
  testimonialsSection?: {
    enabled?: boolean;
    title?: string;
    testimonials?: Array<{
      id: string;
      name: string;
      description: string;
      image?: string;
      rating?: number;
      date?: string;
      ctaLink?: string;
    }>;
  };
  bannersSection?: {
    enabled?: boolean;
    title?: string;
    banners?: Array<{
      id: string;
      image?: string;
      link?: string;
      title?: string;
      subtitle?: string;
      buttonText?: string;
      openInNewTab?: boolean;
    }>;
  };
  homepageSections?: Array<{
    id: string;
    type: string;
    name: string;
    enabled: boolean;
    refIndex?: number;
  }>;
}

interface HomeClientProps {
  bestSellers: Product[];
  customization: Customization | null;
  categories: string[];
  productSections?: HydratedSection[];
}

function buildHeroSlides(customization: any | null) {
  const hero = customization?.heroSection;
  if (hero) {
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      return hero.slides.map((slide: any, idx: number) => ({
        id: slide.id || idx + 1,
        image:
          slide.backgroundImage ||
          slide.image ||
          slide.imageUrl ||
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80",
        title: slide.title || slide.headline || "",
        subtitle:
          slide.subtitle || slide.subheadline || slide.description || "",
        cta: slide.ctaText || slide.buttonText || "",
        link: slide.ctaLink || slide.link || "",
      }));
    }

    const title = hero.title || hero.headline || "";
    const subtitle =
      hero.subtitle || hero.subheadline || hero.description || "";
    const cta = hero.ctaText || hero.buttonText || "";
    const image = hero.backgroundImage || hero.imageUrl || "";
    const link = hero.ctaLink || "/catalogue";

    if (title || subtitle || cta || image) {
      return [
        {
          id: 1,
          image:
            image ||
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80",
          title,
          subtitle,
          cta,
          link,
        },
      ];
    }
  }

  return [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80",
      title: "Exquisite Handcrafted Jewellery",
      subtitle: "Timeless elegance, crafted with love",
      cta: "Shop Collection",
      link: "/catalogue",
    },
  ];
}

function buildCategories(
  categories: string[],
  customization: any | null,
  bestSellers: Product[],
) {
  if (categories && categories.length > 0) {
    return categories.map((cat) => {
      const catKey = cat.toLowerCase().trim();
      let image = customization?.categoryImages?.[catKey];

      // If no custom image, use first product image in this category as a fallback
      if (!image && bestSellers && bestSellers.length > 0) {
        const matchingProduct = bestSellers.find(
          (p) => (p.category || "").toLowerCase().trim() === catKey,
        );
        if (
          matchingProduct &&
          matchingProduct.images &&
          matchingProduct.images.length > 0
        ) {
          image = matchingProduct.images[0];
        }
      }

      // Fallback placeholder
      if (!image) {
        image =
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80";
      }

      return {
        name: cat.toUpperCase(),
        path: `/catalogue?category=${encodeURIComponent(catKey)}`,
        image,
      };
    });
  }

  return [];
}

function buildVideoUrl(customization: Customization | null) {
  return (
    customization?.homePageConfig?.videoUrl ||
    "https://d1311wbk6unapo.cloudfront.net/NushopCatalogue/tr:q-50/686907a872a04e21d2c32db3/cat_vid/1755514917928_FM3UBAP14Z_2025-08-18_1.mp4"
  );
}

export default function HomeClient({
  bestSellers,
  customization,
  categories,
  productSections = [],
}: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customizationState, setCustomizationState] = useState(customization);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "ORBIT_CUSTOMIZATION_UPDATE") {
        console.log("[HomeClient] Received customizer update:", e.data.data);
        setCustomizationState(e.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const heroSlides = buildHeroSlides(customizationState);
  const brandCategories = buildCategories(
    categories,
    customizationState,
    bestSellers,
  );
  const videoUrl = buildVideoUrl(customizationState);
  const categoryShape =
    customizationState?.categoryImages?.shape || "rounded-rect";

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const timerId = setTimeout(() => {
      intervalId = setInterval(nextSlide, 5000);
    }, 100);
    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [heroSlides.length]);

  const scrollGrid = (direction: "left" | "right") => {
    const grid = document.getElementById("category-grid");
    if (grid) {
      const scrollAmount = direction === "left" ? -340 : 340;
      grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const renderHero = () => {
    if (
      customizationState?.homePageConfig?.heroEnabled === false ||
      heroSlides.length === 0
    )
      return null;
    return (
      <section className="hero-carousel animate-slide-up delay-200">
        <div
          className="hero-carousel__track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide: any, index: number) => (
            <div key={slide.id} className="hero-carousel__slide">
              {slide.link ? (
                <Link href={slide.link} className="hero-carousel__image-link">
                  <img
                    src={slide.image}
                    alt={slide.title || "Hero Banner"}
                    className="hero-carousel__image"
                    loading={index === 0 ? "eager" : "lazy"}
                    {...(index === 0 ? { fetchPriority: "high" } : {})}
                    decoding="async"
                  />
                </Link>
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title || "Hero Banner"}
                  className="hero-carousel__image"
                  loading={index === 0 ? "eager" : "lazy"}
                  {...(index === 0 ? { fetchPriority: "high" } : {})}
                  decoding="async"
                />
              )}
              <div className="hero-carousel__content">
                {slide.title && <h1>{slide.title}</h1>}
                {slide.subtitle && <p>{slide.subtitle}</p>}
                {slide.cta && (
                  <Link href={slide.link} className="hero-carousel__cta">
                    {slide.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        {heroSlides.length > 1 && (
          <>
            <button
              className="hero-carousel__nav hero-carousel__nav--prev"
              onClick={prevSlide}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="hero-carousel__nav hero-carousel__nav--next"
              onClick={nextSlide}
            >
              <ChevronRight size={24} />
            </button>
            <div className="hero-carousel__dots">
              {heroSlides.map((_: any, index: number) => (
                <button
                  key={index}
                  className={`hero-carousel__dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    );
  };

  const renderReels = () => {
    if (
      customizationState?.reelsSection?.enabled === false ||
      !customizationState?.reelsSection?.reels ||
      customizationState.reelsSection.reels.length === 0
    )
      return null;
    return <ReelsSection reels={customizationState.reelsSection.reels} />;
  };

  const renderCategories = () => {
    if (
      customizationState?.homePageConfig?.categoriesEnabled === false ||
      brandCategories.length === 0
    )
      return null;
    return (
      <section className="shop-category animate-slide-up delay-400">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div
          className="shop-category__slider-wrapper"
          style={{ position: "relative" }}
        >
          <div
            id="category-grid"
            className={`shop-category__grid shop-category__grid--${categoryShape}`}
          >
            {brandCategories.map((cat) => (
              <Link
                key={`shop-${cat.name}`}
                href={cat.path}
                className={`shop-category__card shop-category__card--${categoryShape}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="shop-category__image"
                />
                <div className="shop-category__overlay">
                  <span className="shop-category__name">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
          {brandCategories.length > 3 && (
            <>
              <button
                className="category-slider__nav category-slider__nav--prev"
                onClick={() => scrollGrid("left")}
                aria-label="Previous categories"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="category-slider__nav category-slider__nav--next"
                onClick={() => scrollGrid("right")}
                aria-label="Next categories"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </section>
    );
  };

  const renderBrandVideo = () => {
    if (customizationState?.homePageConfig?.mediaType === "image") {
      if (!customizationState?.homePageConfig?.imageUrl) return null;
      return (
        <section
          className={`brand-video animate-slide-up delay-500${customizationState?.homePageConfig?.bannerOverlay === false ? " brand-video--fullbleed" : ""}${customizationState?.homePageConfig?.showBorders === false ? " brand-video--no-borders" : ""}`}
        >
          <div className="brand-video__wrapper">
            <img
              src={customizationState.homePageConfig.imageUrl}
              alt="Brand Banner"
              className="brand-video__player"
              style={{
                width: "100%",
                height: "auto",
                borderRadius:
                  customizationState?.homePageConfig?.bannerOverlay === false
                    ? "0"
                    : "8px",
                objectFit:
                  customizationState?.homePageConfig?.showBorders === false
                    ? "contain"
                    : "cover",
              }}
            />
          </div>
        </section>
      );
    } else {
      if (!videoUrl) return null;
      return (
        <section
          className={`brand-video animate-slide-up delay-500${customizationState?.homePageConfig?.showBorders === false ? " brand-video--no-borders" : ""}`}
        >
          <div className="brand-video__wrapper">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="brand-video__player"
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </section>
      );
    }
  };

  const renderBanners = () => {
    if (
      customizationState?.bannersSection?.enabled === false ||
      !customizationState?.bannersSection?.banners ||
      customizationState.bannersSection.banners.length === 0
    )
      return null;
    return (
      <BannersSection
        banners={customizationState.bannersSection.banners}
        title={customizationState.bannersSection.title}
      />
    );
  };

  const renderProductSection = (sectionId: string, index?: number) => {
    let section = null;
    if (sectionId) {
      section = productSections.find((s) => s.id === sectionId);
    }
    if (!section && typeof index === "number") {
      section = productSections[index];
    }
    if (!section) return null;
    return (
      <ProductsSection
        key={section.id}
        title={section.title}
        subtitle={section.subtitle}
        products={section.products}
        sliderMode={section.sliderMode}
      />
    );
  };

  const renderFeatured = () => {
    if (customizationState?.homePageConfig?.featuredEnabled === false)
      return null;
    if (bestSellers.length > 0) {
      return (
        <section className="featured-collection animate-slide-up delay-600">
          <h2 className="section-title">ALL PRODUCTS</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      );
    } else {
      return (
        <section className="featured-collection animate-slide-up delay-600">
          <h2 className="section-title">ALL PRODUCTS</h2>
          <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
            No products available
          </p>
        </section>
      );
    }
  };

  const renderTestimonials = () => {
    if (
      customizationState?.testimonialsSection?.enabled === false ||
      !customizationState?.testimonialsSection?.testimonials ||
      customizationState.testimonialsSection.testimonials.length === 0
    )
      return null;
    return (
      <TestimonialsSection
        testimonials={customizationState.testimonialsSection.testimonials}
        title={customizationState.testimonialsSection.title}
      />
    );
  };

  // Determine active section order (either from customization DB or fallback to default layout order)
  const defaultSections = [
    {
      id: "hero-carousel",
      type: "heroSection",
      name: "Hero Banner",
      enabled: true,
    },
    {
      id: "reels-stories",
      type: "reelsSection",
      name: "Reels / Video Stories",
      enabled: true,
    },
    {
      id: "categories-grid",
      type: "categoryImages",
      name: "Category Images",
      enabled: true,
    },
    {
      id: "brand-video",
      type: "brandVideo",
      name: "Brand Video / Banner",
      enabled: true,
    },
    {
      id: "banners-section",
      type: "bannersSection",
      name: "Banner Section",
      enabled: true,
    },
    ...productSections.map((sec, idx) => ({
      id: sec.id || `prod-sec-${idx}`,
      type: "productSections",
      name: `Product Section: ${sec.title || "Untitled"}`,
      enabled: true,
      refIndex: idx,
    })),
    {
      id: "featured-collection",
      type: "featuredProducts",
      name: "All Products",
      enabled: true,
    },
    {
      id: "testimonials-section",
      type: "testimonialsSection",
      name: "Testimonials",
      enabled: true,
    },
  ];

  const homepageSections =
    customizationState?.homepageSections || defaultSections;

  // In case of dynamic sync updates where new productSections are added/removed but homepageSections is not yet saved,
  // ensure we dynamically include any productSections not present in homepageSections at the bottom
  const syncedSections = [...homepageSections];
  productSections.forEach((sec, idx) => {
    const exists = syncedSections.some(
      (s: any) =>
        s.type === "productSections" && (s.id === sec.id || s.refIndex === idx),
    );
    if (!exists) {
      syncedSections.push({
        id: sec.id || `prod-sec-${idx}`,
        type: "productSections",
        name: `Product Section: ${sec.title || "Untitled"}`,
        enabled: true,
        refIndex: idx,
      });
    }
  });

  return (
    <div className="home">
      {syncedSections
        .filter((sec: any) => sec.enabled !== false)
        .map((sec: any) => {
          switch (sec.type) {
            case "heroSection":
              return <div key={sec.id}>{renderHero()}</div>;
            case "reelsSection":
              return <div key={sec.id}>{renderReels()}</div>;
            case "categoryImages":
              return <div key={sec.id}>{renderCategories()}</div>;
            case "brandVideo":
              return <div key={sec.id}>{renderBrandVideo()}</div>;
            case "bannersSection":
              return <div key={sec.id}>{renderBanners()}</div>;
            case "productSections":
              return (
                <div key={sec.id}>
                  {renderProductSection(sec.id, sec.refIndex)}
                </div>
              );
            case "featuredProducts":
              return <div key={sec.id}>{renderFeatured()}</div>;
            case "testimonialsSection":
              return <div key={sec.id}>{renderTestimonials()}</div>;
            default:
              return null;
          }
        })}
    </div>
  );
}
