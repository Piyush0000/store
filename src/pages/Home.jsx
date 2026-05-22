import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides, collections } from '../data/products';
import './Home.css';

const brandCategories = [
  { name: 'JEWELLERY SETS', path: '/JEWELLERY-SETS/collection/9KBdf2xY', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
  { name: 'NECKLACE', path: '/NECKLACE/collection/e2jUNDe1', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { name: 'EARRINGS', path: '/EARRINGS/collection/uzxgRjeA', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages] = useState(heroSlides);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="home">
      {/* Hero Carousel */}
      <section className="hero-carousel">
        <div className="hero-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroImages.map((slide, index) => (
            <div key={slide.id || index} className="hero-carousel__slide">
              <img src={slide.image} alt={slide.title} className="hero-carousel__image" />
              <div className="hero-carousel__content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to="/JEWELLERY-SETS/collection/9KBdf2xY" className="hero-carousel__cta">
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button className="hero-carousel__nav hero-carousel__nav--prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>
        <button className="hero-carousel__nav hero-carousel__nav--next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>
        <div className="hero-carousel__dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`hero-carousel__dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Brand Category Section */}
      <section className="brand-category">
        <h2 className="section-title">BRAND CATEGORY</h2>
        <div className="brand-category__grid">
          {brandCategories.map((cat) => (
            <Link key={cat.name} to={cat.path} className="brand-category__item">
              <div className="brand-category__image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="brand-category__name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop By Category Section */}
      <section className="shop-category">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div className="shop-category__grid">
          {brandCategories.map((cat) => (
            <Link key={cat.name} to={cat.path} className="shop-category__card">
              <img src={cat.image} alt={cat.name} className="shop-category__image" />
              <div className="shop-category__overlay">
                <span className="shop-category__name">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Video Section */}
      <section className="brand-video">
        <div className="brand-video__wrapper">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="brand-video__player"
          >
            <source
              src="https://d1311wbk6unapo.cloudfront.net/NushopCatalogue/tr:q-50/686907a872a04e21d2c32db3/cat_vid/1755514917928_FM3UBAP14Z_2025-08-18_1.mp4"
              type="video/mp4"
            />
          </video>
          <div className="brand-video__overlay" />
        </div>
      </section>

      {/* Featured Collection */}
      <section className="featured-collection">
        <h2 className="section-title">BEST SELLER</h2>
        <div className="featured-collection__grid">
          {collections.slice(0, 4).map((col) => (
            <Link key={col.id} to={`/catalogue?category=${col.id}`} className="featured-collection__item">
              <img src={col.image} alt={col.name} />
              <span>{col.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}