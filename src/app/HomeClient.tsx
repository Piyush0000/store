'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
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
  };
  features?: { title: string; description: string; icon: string }[];
  aboutSection?: { title: string; content: string; image: string };
  newsletter?: { heading: string; subtext: string };
}

interface HomeClientProps {
  bestSellers: Product[];
  customization: Customization | null;
  categories: string[];
}

function buildHeroSlides(customization: Customization | null) {
  if (customization?.heroSection?.backgroundImage) {
    return [{
      id: 1,
      image: customization.heroSection.backgroundImage,
      title: customization.heroSection.title || 'Welcome',
      subtitle: customization.heroSection.subtitle || '',
      cta: customization.heroSection.ctaText || 'Shop Now',
      link: customization.heroSection.ctaLink || '/catalogue',
    }];
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

function buildCategories(categories: string[]) {
  if (categories && categories.length > 0) {
    return categories.map((cat) => ({
      name: cat.toUpperCase(),
      path: `/catalogue?category=${encodeURIComponent(cat.toLowerCase())}`,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
    }));
  }

  return [
    { name: 'JEWELLERY SETS', path: '/catalogue?category=jewellery-sets', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
    { name: 'NECKLACE', path: '/catalogue?category=necklace', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
    { name: 'EARRINGS', path: '/catalogue?category=earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  ];
}

function buildVideoUrl(customization: Customization | null) {
  return customization?.homePageConfig?.videoUrl ||
    'https://d1311wbk6unapo.cloudfront.net/NushopCatalogue/tr:q-50/686907a872a04e21d2c32db3/cat_vid/1755514917928_FM3UBAP14Z_2025-08-18_1.mp4';
}

export default function HomeClient({ bestSellers, customization, categories }: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = buildHeroSlides(customization);
  const brandCategories = buildCategories(categories);
  const videoUrl = buildVideoUrl(customization);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      {(customization?.homePageConfig?.heroEnabled !== false) && (
        <section className="hero-carousel">
          <div className="hero-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide) => (
              <div key={slide.id} className="hero-carousel__slide">
                <img src={slide.image} alt={slide.title} className="hero-carousel__image" />
                <div className="hero-carousel__content">
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <Link href={slide.link} className="hero-carousel__cta">{slide.cta}</Link>
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

      {(customization?.homePageConfig?.categoriesEnabled !== false) && (
        <>
          <section className="brand-category">
            <h2 className="section-title">BRAND CATEGORY</h2>
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

          <section className="shop-category">
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

      {videoUrl && (
        <section className="brand-video">
          <div className="brand-video__wrapper">
            <video autoPlay muted loop playsInline className="brand-video__player">
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </section>
      )}

      {(customization?.homePageConfig?.featuredEnabled !== false) && (
        bestSellers.length > 0 ? (
          <section className="featured-collection">
            <h2 className="section-title">BEST SELLER</h2>
            <div className="featured-collection__grid">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : (
          <section className="featured-collection">
            <h2 className="section-title">BEST SELLER</h2>
            <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No best sellers available</p>
          </section>
        )
      )}
    </div>
  );
}