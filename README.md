# Evo Checkout Storefront

Multi-tenant e-commerce storefront built with Next.js App Router.

## Architecture

### Static Shell + Dynamic Data

The app is a **static shell** that fetches all data from the backend API based on the subdomain.

```
Browser Request (e.g., moonstruck.evoclabs.com)
         ↓
extract subdomain → "moonstruck"
         ↓
fetchStorefront() → /storefront/public/{subdomain}/frontend
         ↓
Returns: store info, products, customization, categories, announcements
         ↓
UI renders with dynamic data
```

### Data Flow

| Component | Data Source |
|-----------|------------|
| Store Info (name, logo) | `fetchStorefront().store` |
| Customization (colors, fonts, nav) | `fetchStorefront().customization` |
| Products | `fetchStorefront().products` |
| Categories | `fetchStorefront().categories` |
| Announcements | `fetchStorefront().announcements` |
| Legal Pages | `fetchStorefront().legalPages` |
| Payment Icons | Static SVGs in `/public` |

### Subdomain Routing

- **Production:** Subdomain extracted from hostname (e.g., `moonstruck.evoclabs.com` → `moonstruck`)
- **Local Dev:** Defaults to `moonstruck` when accessing `localhost`

### API Endpoints

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `fetchStorefront()` | `GET /storefront/public/{subdomain}/frontend` | All store data |
| `fetchProduct(id)` | `GET /storefront/public/{subdomain}/frontend/products/{id}` | Single product |
| `fetchAnnouncements()` | `GET /storefront/public/{subdomain}/frontend/announcements` | Active announcements |
| `fetchLegal()` | `GET /storefront/public/{subdomain}/frontend/legal` | Legal pages |

## Environment Variables

| Variable | Purpose | Exposed to Browser? |
|----------|---------|---------------------|
| `PAYU_KEY` | PayU payment gateway | No |
| `PAYU_SALT` | PayU payment salt | No |
| `PAYU_CALLBACK_URL` | PayU callback endpoint | No |
| `TWO_FACTOR_API_KEY` | OTP service key | No |
| `DATABASE_URL` | PostgreSQL connection | No |

**Store ID comes from API response, not env variables.**

## Development

```bash
pnpm install
pnpm dev
```

## Production Checklist

- [ ] Backend has `?channel_binding=disable` in Neon DATABASE_URL
- [ ] PayU keys configured for production endpoints
- [ ] OTP service (2Factor.in) has sufficient balance
- [ ] Store data visible in dashboard before storefront goes live