# Catalogue Page Structure

## Layout
```
┌────────────────────────────────────────┐
│ [Category Title]            [X items]  │
├────────────────────────────────────────┤
│ [Filter Sidebar]  │  [Product Grid]    │
│                   │                    │
│ Categories:       │  [ProductCard]     │
│ □ Jewellery Sets  │  [ProductCard]     │
│ □ Necklace        │  [ProductCard]     │
│ □ Earrings        │  [ProductCard]     │
│ □ Best Seller    │  ...                │
│                   │                    │
│ Price Range:      │                    │
│ [Slider]          │                    │
└────────────────────────────────────────┘
```

## Product Card
- Image with hover overlay (Quick Add)
- Wishlist heart button
- Discount badge
- Product name
- Star rating with count
- Price (with strikethrough original)

## URL Pattern
/catalogue?category=jewellery-sets
/catalogue?category=necklace
/catalogue?category=earrings
/catalogue?category=best-seller