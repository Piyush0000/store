'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductsSection from '@/components/ProductsSection';
import ReelsSection from '@/components/ReelsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import type { HydratedSection } from '@/lib/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './page.css';

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
  };
  features?: { title: string; description: string; icon: string }[];
  aboutSection?: { title: string; content: string; image: string };
  newsletter?: { heading: string; subtext: string };
  categoryImages?: Record<string, string>;
  reelsSection?: {
    enabled?: boolean;
    reels?: Array<{ id: string; title: string; sub: string; category: string; videoUrl: string; ctaLink?: string }>;
  };
  testimonialsSection?: {
    enabled?: boolean;
    title?: string;
    testimonials?: Array<{ id: string; name: string; description: string; image?: string; rating?: number; date?: string; ctaLink?: string }>;
  };
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
    const title = hero.title || hero.headline || '';
    const subtitle = hero.subtitle || hero.subheadline || hero.description || '';
    const cta = hero.ctaText || hero.buttonText || '';
    const image = hero.backgroundImage || hero.imageUrl || '';
    const link = hero.ctaLink || '/catalogue';

    if (title || subtitle || cta || image) {
      return [{
        id: 1,
        image: image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80',
        title,
        subtitle,
        cta,
        link,
      }];
    }
  }

  return [{
    id: 1,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80',
    title: 'Exquisite Handcrafted Jewellery',
    subtitle: 'Timeless elegance, crafted with love',
    cta: 'Shop Collection',
    link: '/catalogue',
  }];
}

function buildCategories(categories: string[], customization: any | null, bestSellers: Product[]) {
  if (categories && categories.length > 0) {
    return categories.map((cat) => {
      const catKey = cat.toLowerCase().trim();
      let image = customization?.categoryImages?.[catKey];

      // If no custom image, use first product image in this category as a fallback
      if (!image && bestSellers && bestSellers.length > 0) {
        const matchingProduct = bestSellers.find(
          (p) => (p.category || '').toLowerCase().trim() === catKey
        );
        if (matchingProduct && matchingProduct.images && matchingProduct.images.length > 0) {
          image = matchingProduct.images[0];
        }
      }

      // Fallback placeholder
      if (!image) {
        image = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80';
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
  return customization?.homePageConfig?.videoUrl ||
    'https://d1311wbk6unapo.cloudfront.net/NushopCatalogue/tr:q-50/686907a872a04e21d2c32db3/cat_vid/1755514917928_FM3UBAP14Z_2025-08-18_1.mp4';
}

export default function HomeClient({ bestSellers, customization, categories, productSections = [] }: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customizationState, setCustomizationState] = useState(customization);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ORBIT_CUSTOMIZATION_UPDATE') {
        console.log('[HomeClient] Received customizer update:', e.data.data);
        setCustomizationState(e.data.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const heroSlides = buildHeroSlides(customizationState);
  const brandCategories = buildCategories(categories, customizationState, bestSellers);
  const videoUrl = buildVideoUrl(customizationState);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
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

  return (
    <div className="home">
      {(customizationState?.homePageConfig?.heroEnabled !== false) && (
        <section className="hero-carousel animate-slide-up delay-200">
          <div className="hero-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className="hero-carousel__slide">
                <img
                  src={slide.image}
                  alt={slide.title || 'Hero Banner'}
                  className="hero-carousel__image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  {...(index === 0 ? { fetchPriority: 'high' } : {})}
                  decoding="async"
                />
                <div className="hero-carousel__content">
                  {slide.title && <h1>{slide.title}</h1>}
                  {slide.subtitle && <p>{slide.subtitle}</p>}
                  {slide.cta && (
                    <Link href={slide.link} className="hero-carousel__cta">{slide.cta}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          {heroSlides.length > 1 && (
            <>
              <button className="hero-carousel__nav hero-carousel__nav--prev" onClick={prevSlide}>
                <ChevronLeft size={24} />
              </button>
              <button className="hero-carousel__nav hero-carousel__nav--next" onClick={nextSlide}>
                <ChevronRight size={24} />
              </button>
              <div className="hero-carousel__dots">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`hero-carousel__dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Reels Section — below hero */}
      {customizationState?.reelsSection?.enabled !== false &&
        customizationState?.reelsSection?.reels &&
        customizationState.reelsSection.reels.length > 0 && (
          <ReelsSection reels={customizationState.reelsSection.reels} />
      )}

      {(customizationState?.homePageConfig?.categoriesEnabled !== false) && brandCategories.length > 0 && (
        <>
          <section className="brand-category animate-slide-up delay-300">
            <h2 className="section-title">SHOP BY COLLECTIONS</h2>
            <div className="brand-category__grid">
              {brandCategories.map((cat) => (
                <Link key={cat.name} href={cat.path} className="brand-category__item">
                  <div className="brand-category__image">
                    <img src={cat.image} alt={cat.name} />
                  </div>
                  <span className="brand-category__name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="shop-category animate-slide-up delay-400">
            <h2 className="section-title">SHOP BY CATEGORY</h2>
            <div className="shop-category__grid">
              {brandCategories.map((cat) => (
                <Link key={`shop-${cat.name}`} href={cat.path} className="shop-category__card">
                  <img src={cat.image} alt={cat.name} className="shop-category__image" />
                  <div className="shop-category__overlay">
                    <span className="shop-category__name">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {customizationState?.homePageConfig?.mediaType === 'image' ? (
        customizationState?.homePageConfig?.imageUrl && (
          <section className="brand-video animate-slide-up delay-500">
            <div className="brand-video__wrapper">
              <img
                src={customizationState.homePageConfig.imageUrl}
                alt="Brand Banner"
                className="brand-video__player"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
              />
            </div>
          </section>
        )
      ) : (
        videoUrl && (
          <section className="brand-video animate-slide-up delay-500">
            <div className="brand-video__wrapper">
              <video autoPlay muted loop playsInline className="brand-video__player" key={videoUrl}>
                <source src={videoUrl} type="video/mp4" />
              </video>
            </div>
          </section>
        )
      )}

      {/* Dynamic product sections from CMS config */}
      {productSections.length > 0 ? (
        productSections.map((section) => (
          <ProductsSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            products={section.products}
          />
        ))
      ) : (
        (customizationState?.homePageConfig?.featuredEnabled !== false) && (
          bestSellers.length > 0 ? (
            <section className="featured-collection animate-slide-up delay-600">
              <h2 className="section-title">ALL PRODUCTS</h2>
              <div className="featured-collection__grid">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : (
            <section className="featured-collection animate-slide-up delay-600">
              <h2 className="section-title">ALL PRODUCTS</h2>
              <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No products available</p>
            </section>
          )
        )
      )}

      {customizationState?.testimonialsSection?.enabled !== false &&
        customizationState?.testimonialsSection?.testimonials &&
        customizationState.testimonialsSection.testimonials.length > 0 && (
          <TestimonialsSection 
            testimonials={customizationState.testimonialsSection.testimonials} 
            title={customizationState.testimonialsSection.title}
          />
      )}
    </div>
  );
}