import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag } from 'lucide-react';
import { heroSlides, collections } from '../data/products';
import './Home.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState(heroSlides);
  const [collectionImages, setCollectionImages] = useState(collections);
  const [isAdmin, setIsAdmin] = useState(false);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleHeroUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setHeroImages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: url };
        return updated;
      });
    }
  };

  const handleHeroDelete = (index) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCollectionUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCollectionImages((prev) =>
        prev.map((c) => (c.id === id ? { ...c, image: url } : c))
      );
    }
  };

  const handleCollectionDelete = (id) => {
    setCollectionImages((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="home">
      {/* Admin Toggle */}
      <button className="admin-toggle" onClick={() => setIsAdmin(!isAdmin)}>
        {isAdmin ? 'Exit Admin' : 'Admin Mode'}
      </button>

      {/* Hero Carousel */}
      <section className="hero-carousel">
        <div className="hero-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroImages.map((slide, index) => (
            <div key={slide.id || index} className="hero-carousel__slide">
              <img src={slide.image} alt={slide.title} className="hero-carousel__image" />
              <div className="hero-carousel__content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.link} className="hero-carousel__cta">
                  {slide.cta}
                </Link>
              </div>
              {isAdmin && (
                <div className="hero-carousel__admin">
                  <label className="hero-carousel__upload">
                    Upload Image
                    <input type="file" accept="image/*" onChange={(e) => handleHeroUpload(e, index)} />
                  </label>
                  <button className="hero-carousel__delete" onClick={() => handleHeroDelete(index)}>
                    Delete
                  </button>
                </div>
              )}
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

      {/* Collection Grid */}
      <section className="collection-grid">
        <h2 className="section-title">Shop by Category</h2>
        <div className="collection-grid__items">
          {collectionImages.map((collection) => (
            <div key={collection.id} className="collection-card">
              <Link to={`/catalogue?category=${collection.id}`}>
                <img src={collection.image} alt={collection.name} />
                <span className="collection-card__title">{collection.name}</span>
              </Link>
              {isAdmin && (
                <div className="collection-card__admin">
                  <label className="collection-card__upload">
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => handleCollectionUpload(e, collection.id)} />
                  </label>
                  <button onClick={() => handleCollectionDelete(collection.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Banner */}
      <section className="featured-banner">
        <div className="featured-banner__content">
          <h2>Bridal Collection</h2>
          <p>Timeless elegance for your special day</p>
          <Link to="/catalogue?category=jewellery-sets" className="featured-banner__cta">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers">
        <h2 className="section-title">Best Sellers</h2>
        <div className="best-sellers__grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="best-sellers__item">
              <img
                src={`https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80`}
                alt={`Best Seller ${item}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About Swarajya Imperial</h2>
        <p>
          At Swarajya Imperial, we believe jewellery is more than just an accessory — it's an expression
          of identity, emotion, and timeless beauty. Founded on a passion for craftsmanship.
        </p>
      </section>
    </div>
  );
}