/* ── Sample Product Data ── */

export const products = [
  {
    id: 1,
    name: 'Maharani Kundan Choker Necklace Set',
    price: 2499,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    category: 'jewellery-sets',
    rating: 4.8,
    reviewCount: 124,
    description: 'Exquisite Kundan choker necklace set with matching earrings. Handcrafted with premium quality Kundan stones and intricate gold-plated framework. Perfect for weddings, festivals, and special celebrations.',
    variants: {
      colors: ['Gold', 'Rose Gold', 'Antique Gold'],
      sizes: ['Standard', 'Choker Length', 'Princess Length'],
      types: ['With Earrings', 'With Earrings + Maang Tikka', 'Full Set'],
    },
    reviews: [
      { id: 1, name: 'Priya Sharma', rating: 5, date: '2025-04-12', text: 'Absolutely stunning! The quality exceeded my expectations. Wore it at my engagement and received so many compliments.', verified: true },
      { id: 2, name: 'Anita Desai', rating: 4, date: '2025-03-28', text: 'Beautiful craftsmanship. The Kundan stones are well-set and the gold plating looks very premium. Slight delay in delivery though.', verified: true },
      { id: 3, name: 'Kavita Patel', rating: 5, date: '2025-03-15', text: 'Worth every penny! The set is lightweight yet looks grand. Perfect for bridal looks.', verified: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    ],
  },
  {
    id: 2,
    name: 'Royal Temple Necklace with Pearl Drops',
    price: 1899,
    originalPrice: 3799,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    category: 'necklace',
    rating: 4.6,
    reviewCount: 89,
    description: 'Traditional temple design necklace adorned with delicate pearl drops. Features antique gold plating with intricate deity motifs. A statement piece for festive occasions.',
    variants: {
      colors: ['Antique Gold', 'Gold'],
      sizes: ['16 inch', '18 inch', '20 inch'],
      types: ['Necklace Only', 'With Earrings'],
    },
    reviews: [
      { id: 1, name: 'Meera Joshi', rating: 5, date: '2025-04-01', text: 'The temple work is exquisite. Very authentic looking.', verified: true },
      { id: 2, name: 'Deepa Nair', rating: 4, date: '2025-03-20', text: 'Lovely necklace. The pearls are beautiful. Slight color variation from photos.', verified: false },
    ],
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    ],
  },
  {
    id: 3,
    name: 'Emerald AD Stone Jhumka Earrings',
    price: 999,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    category: 'earrings',
    rating: 4.9,
    reviewCount: 210,
    description: 'Stunning jhumka earrings with American Diamond stones and emerald green accents. Features push-back closure for secure fit. Lightweight and comfortable for all-day wear.',
    variants: {
      colors: ['Emerald Green', 'Ruby Red', 'Sapphire Blue'],
      sizes: ['Small', 'Medium', 'Large'],
      types: ['Standard', 'With Ear Chain'],
    },
    reviews: [
      { id: 1, name: 'Sakshi Gupta', rating: 5, date: '2025-04-15', text: 'Best earrings I have ever bought online! So lightweight and gorgeous.', verified: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    ],
  },
  {
    id: 4,
    name: 'Bridal Enamel Polki Complete Set',
    price: 3999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    category: 'jewellery-sets',
    rating: 4.7,
    reviewCount: 67,
    description: 'Majestic bridal set featuring stunning enamel work with Polki stones. Includes necklace, earrings, maang tikka, and bangles. Heritage design crafted for the modern bride.',
    variants: {
      colors: ['Gold & Red', 'Gold & Green', 'Gold & Pink'],
      sizes: ['Standard', 'Choker + Long'],
      types: ['Necklace + Earrings', 'Full Bridal Set'],
    },
    reviews: [
      { id: 1, name: 'Ritu Verma', rating: 5, date: '2025-04-10', text: 'I wore this at my wedding and it was a showstopper! Amazing quality.', verified: true },
      { id: 2, name: 'Neha Kapoor', rating: 4, date: '2025-03-25', text: 'Stunning set. Packaging was beautiful too. Perfect gift.', verified: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    ],
  },
  {
    id: 5,
    name: 'Victorian Crystal Drop Necklace',
    price: 1599,
    originalPrice: 3199,
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d999f5c6?w=600&q=80',
    category: 'necklace',
    rating: 4.5,
    reviewCount: 53,
    description: 'Elegant Victorian-inspired necklace with crystal drop pendants. Rhodium-plated for lasting shine. Perfect for cocktail parties and formal events.',
    variants: {
      colors: ['Silver', 'Rose Gold'],
      sizes: ['16 inch', '18 inch'],
      types: ['Necklace Only', 'With Earrings'],
    },
    reviews: [],
    images: [
      'https://images.unsplash.com/photo-1515562141589-67f0d999f5c6?w=600&q=80',
    ],
  },
  {
    id: 6,
    name: 'Pearl Cluster Statement Earrings',
    price: 799,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    category: 'earrings',
    rating: 4.4,
    reviewCount: 38,
    description: 'Gorgeous pearl cluster earrings that make a statement. Features hand-wired freshwater pearls on a gold-plated base. Lightweight and comfortable.',
    variants: {
      colors: ['White Pearl', 'Pink Pearl', 'Grey Pearl'],
      sizes: ['Small', 'Medium'],
      types: ['Standard'],
    },
    reviews: [],
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    ],
  },
  {
    id: 7,
    name: 'Antique Gold Layered Necklace Set',
    price: 2799,
    originalPrice: 5599,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&q=80',
    category: 'jewellery-sets',
    rating: 4.8,
    reviewCount: 95,
    description: 'Exquisite layered necklace set in antique gold finish. Features three tiers of intricate design with matching chandbali earrings. A regal choice for special occasions.',
    variants: {
      colors: ['Antique Gold', 'Gold'],
      sizes: ['Standard'],
      types: ['With Earrings', 'Full Set'],
    },
    reviews: [
      { id: 1, name: 'Pooja Mehta', rating: 5, date: '2025-04-18', text: 'The layered design is absolutely gorgeous!', verified: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&q=80',
    ],
  },
  {
    id: 8,
    name: 'Diamond-Cut Chandbali Earrings',
    price: 1299,
    originalPrice: 2599,
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
    category: 'earrings',
    rating: 4.6,
    reviewCount: 72,
    description: 'Stunning chandbali earrings with diamond-cut detailing. Features a crescent design with dangling pearl drops. Perfect for ethnic and fusion looks.',
    variants: {
      colors: ['Gold', 'Rose Gold', 'Silver'],
      sizes: ['Medium', 'Large'],
      types: ['Standard', 'With Ear Chain'],
    },
    reviews: [],
    images: [
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
    ],
  },
];

export const collections = [
  {
    id: 'jewellery-sets',
    name: 'JEWELLERY SETS',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80',
  },
  {
    id: 'necklace',
    name: 'NECKLACE',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80',
  },
  {
    id: 'earrings',
    name: 'EARRINGS',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80',
  },
  {
    id: 'best-seller',
    name: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=300&q=80',
  },
];

export const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80',
    title: 'Majestic Heritage Collection',
    subtitle: 'Handcrafted Jewellery for the Modern Royalty',
    cta: 'Shop Now',
    link: '/catalogue?category=jewellery-sets',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
    title: 'Temple Treasures',
    subtitle: 'Traditional Designs Reimagined',
    cta: 'Explore',
    link: '/catalogue?category=necklace',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=80',
    title: 'Bridal Elegance',
    subtitle: 'Make Your Special Day Unforgettable',
    cta: 'View Collection',
    link: '/catalogue?category=jewellery-sets',
  },
];
