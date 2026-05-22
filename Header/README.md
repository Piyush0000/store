# Header Component Structure

## Desktop Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Mobile Toggle] [Search]     SWARAJYA IMPERIAL    [User][Heart][Bag] │
├─────────────────────────────────────────────────────────────┤
│    HOME    │    JEWELLERY SETS    │    NECKLACE    │    EARRINGS    │    BEST SELLER    │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Layout
```
┌─────────────────────────┐
│ [Toggle] [Search]  [Bag]│
│      SWARAJYA IMPERIAL  │
└─────────────────────────┘
```

## Elements
| Element | ID | Notes |
|---------|-----|-------|
| Mobile Toggle | #mobile-menu-toggle | Hamburger/X icon |
| Search | #search-toggle, #search-input | Dropdown input |
| Logo | #site-logo | Link to home |
| User | #orders-link | Orders/account |
| Heart | #wishlist-link | Wishlist |
| Cart | #cart-link, #cart-count | Shopping bag |
| Nav Links | #main-nav | Sticky on scroll |

## Responsive
- Desktop: Full nav below logo bar
- Mobile: Hamburger menu with overlay

## Scrolled State
- Header gets shadow after 40px scroll
- `header--scrolled` class applied