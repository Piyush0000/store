# Product Page Structure

## Layout
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────┐   ┌─────────────────────────────────┐ │
│  │                 │   │ Maharani Kundan Choker Set       │ │
│  │  Main Image     │   │ ★★★★★ (124 reviews)              │ │
│  │                 │   │ ₹2,499  <span style="text-decoration:line-through">₹4,999</span>  50% OFF │ │
│  │                 │   │                                  │ │
│  ├─────────────────┤   │ Color: [Gold][Rose Gold][Antique]│ │
│  │ [Thumb] [Thumb] │   │ Size: [Std][Choker][Princess]    │ │
│  │ [Thumb] [Thumb] │   │ Type: [+Earrings][+Tikka][Full]  │ │
│  └─────────────────┘   │                                  │ │
│                        │ [   ADD TO CART   ]              │ │
│                        │ [    BUY NOW       ]              │ │
│                        │                                  │ │
│                        │ Free Shipping on orders ₹499+   │ │
│                        │ Extra ₹650 off at checkout       │ │
│                        └─────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Description  |  Reviews (124)  |  Shipping  |  FAQ          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Review 1: Priya - ★★★★★ - Verified]                       │
│  [Review 2: Anita - ★★★★☆ - Verified]                       │
│  [Review 3: Kavita - ★★★★★ - Verified]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Product Variants
| Type | Options |
|------|---------|
| Color | Gold, Rose Gold, Antique Gold |
| Size | Standard, Choker Length, Princess Length |
| Type | With Earrings, With Earrings + Maang Tikka, Full Set |

## Variant Selector Component
- Color: Circular swatches with border on selected
- Size: Button pills
- Type: Radio-style selection

## Buttons
| Button | Action | Style |
|--------|--------|-------|
| Add to Cart | Add to cart, show toast | Outlined |
| Buy Now | Add to cart, navigate to checkout | Filled |

## Reviews Component
- Average rating display
- Rating breakdown (5★ to 1★ bars)
- Individual review cards with:
  - Reviewer name
  - Star rating
  - Date
  - Review text
  - Verified badge
- Write review form

## Merchant Dashboard
- Product CRUD (if admin)
- Image upload/delete
- Price/inventory management