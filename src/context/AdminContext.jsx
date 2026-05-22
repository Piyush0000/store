import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }) {
  const [heroSlides, setHeroSlides] = useState([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80',
      title: 'Majestic Heritage Collection',
      subtitle: 'Handcrafted Jewellery for the Modern Royalty',
      cta: 'Shop Now',
      link: '/catalogue?category=jewellery-sets',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80',
      title: 'Temple Treasures',
      subtitle: 'Traditional Designs Reimagined',
      cta: 'Explore',
      link: '/catalogue?category=necklace',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&q=80',
      title: 'Bridal Elegance',
      subtitle: 'Make Your Special Day Unforgettable',
      cta: 'View Collection',
      link: '/catalogue?category=jewellery-sets',
    },
  ]);

  const [collections, setCollections] = useState([
    {
      id: 'jewellery-sets',
      name: 'JEWELLERY SETS',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
    },
    {
      id: 'necklace',
      name: 'NECKLACE',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80',
    },
    {
      id: 'earrings',
      name: 'EARRINGS',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80',
    },
  ]);

  const [shopCategories, setShopCategories] = useState([
    {
      id: 'best-seller',
      name: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
    },
    {
      id: 'spotlight',
      name: 'In The Spotlight',
      image: 'https://images.unsplash.com/photo-1515562141589-67f0d999f5c6?w=800&q=80',
    },
    {
      id: 'new-arrivals',
      name: 'New Arrivals',
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&q=80',
    },
  ]);

  const [announcementText, setAnnouncementText] = useState('Extra discounts of ₹650 at checkout');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const addHeroSlide = (slide) => {
    setHeroSlides((prev) => [...prev, { ...slide, id: Date.now() }]);
  };

  const updateHeroSlide = (id, updates) => {
    setHeroSlides((prev) =>
      prev.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide))
    );
  };

  const deleteHeroSlide = (id) => {
    setHeroSlides((prev) => prev.filter((slide) => slide.id !== id));
  };

  const updateCollection = (id, updates) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
  };

  const addCollection = (collection) => {
    setCollections((prev) => [...prev, { ...collection, id: collection.name.toLowerCase().replace(/\s+/g, '-') }]);
  };

  const deleteCollection = (id) => {
    setCollections((prev) => prev.filter((col) => col.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        collections,
        updateCollection,
        addCollection,
        deleteCollection,
        shopCategories,
        setShopCategories,
        announcementText,
        setAnnouncementText,
        showAnnouncement,
        setShowAnnouncement,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}