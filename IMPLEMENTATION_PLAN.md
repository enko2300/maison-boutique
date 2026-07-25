# Implementation Plan — 10 Features for MAISON. Boutique

**Stack**: Express 5 + Prisma + SQLite → PostgreSQL | React 19 + Vite 8 + Tailwind 4 + Zustand + React Query

---

## Dependency Graph & Build Order

```
Phase 1 (zero deps):    5-PostgreSQL | 7-SEO | 8-Performance | 9-DarkMode
Phase 2 (schema-only):  1-PromoCodes | 2-Reviews | 10-Wishlist
Phase 3 (service):      3-Email
Phase 4 (middleware):    6-ImageUpload
Phase 5 (last):         4-SearchAutocomplete
```

Phase 5-10-SEO-Perf-DarkMode can ship in parallel (no cross-dependencies).  
Reviews must precede the average-rating display on products.  
Email must ship after orders/promo schema exist so it can send notifications.  
Search autocomplete depends on the final product schema shape.

---

## Feature 1 — Promo Codes

### 1.1 DB Schema (`schema.prisma`)

```prisma
model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique
  discount    Float                     // percentage (0-100) or fixed amount
  discountType String  @default("percent") // "percent" | "fixed"
  minOrder    Float   @default(0)
  maxUses     Int?                       // null = unlimited
  usedCount   Int     @default(0)
  active      Boolean @default(true)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
}

// Add to Order model:
//   promoCodeId String?
//   promoCode   PromoCode? @relation(fields: [promoCodeId], references: [id])
//   discount    Float @default(0)
```

### 1.2 Server

**Files to create/modify:**

| File | Action | Purpose |
|------|--------|---------|
| `server/prisma/schema.prisma` | Edit | Add PromoCode model + Order relations |
| `server/src/routes/promo.ts` | Create | `POST /api/promo/validate` (public), `GET/POST/DELETE /api/admin/promo` (admin) |
| `server/src/index.ts` | Edit | Mount `promoRoutes` |
| `server/src/validation.ts` | Edit | Add `promoSchema` |
| `server/src/routes/orders.ts` | Edit | Accept `promoCode` in checkout body, compute discount |
| `server/src/services/promo.ts` | Create | `validatePromo(code, orderTotal)` logic |

**API routes:**

```
POST   /api/promo/validate          — { code, subtotal } → { valid, discount, discountType, finalTotal }
GET    /api/admin/promo             — list all promo codes (admin)
POST   /api/admin/promo             — create promo code (admin)
DELETE /api/admin/promo/:id         — delete promo code (admin)
```

**Validation (zod):**

```ts
promoSchema = z.object({
  code: z.string().min(1).max(50),
  discount: z.number().positive(),
  discountType: z.enum(['percent', 'fixed']),
  minOrder: z.number().min(0).optional().default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});
```

### 1.3 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/api/promo.ts` | Create | `promoApi.validate(code, subtotal)` |
| `client/src/types/index.ts` | Edit | Add `PromoCode` type |
| `client/src/pages/Checkout.tsx` | Edit | Add promo code input + discount line |
| `client/src/components/promo/PromoInput.tsx` | Create | Reusable promo code input component |
| `client/src/stores/checkoutStore.ts` | Create | Zustand store for promo state |

### 1.4 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/promo.test.ts` | Create | Validate promo logic: valid, expired, max uses, min order |
| `server/src/__tests__/orders-promo.test.ts` | Create | Integration: checkout applies discount correctly |
| `client/src/__tests__/PromoInput.test.tsx` | Create | Render, submit, error states |

---

## Feature 2 — Reviews & Ratings

### 2.1 DB Schema

```prisma
model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int                         // 1-5
  comment   String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

// Add to User model:
//   reviews Review[]

// Add to Product model:
//   reviews Review[]
```

### 2.2 Server

| File | Action | Purpose |
|------|--------|---------|
| `server/src/routes/reviews.ts` | Create | CRUD for reviews (auth required for create) |
| `server/src/index.ts` | Edit | Mount review routes |
| `server/src/validation.ts` | Edit | Add `reviewSchema` |
| `server/src/routes/products.ts` | Edit | Include review stats in product listing |

**API routes:**

```
GET    /api/products/:id/reviews              — list reviews with pagination
POST   /api/products/:id/reviews              — create review (auth, one per user)
DELETE /api/reviews/:id                       — delete own review (auth)
GET    /api/products/:id/review-stats         — { avg, count, distribution: {1:n, 2:n,...} }
```

**Validation:**

```ts
reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});
```

### 2.3 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/api/reviews.ts` | Create | CRUD hooks |
| `client/src/components/reviews/ReviewList.tsx` | Create | Star display + comments list |
| `client/src/components/reviews/ReviewForm.tsx` | Create | Star picker + textarea |
| `client/src/components/reviews/StarRating.tsx` | Create | Reusable star display |
| `client/src/components/reviews/RatingBreakdown.tsx` | Create | Histogram bars |
| `client/src/pages/ProductDetail.tsx` | Edit | Add review section below product info |
| `client/src/types/index.ts` | Edit | Add Review, ReviewStats types |

### 2.4 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/reviews.test.ts` | Create | CRUD, duplicate prevention, stats |
| `client/src/__tests__/StarRating.test.tsx` | Create | Render correctly, click handling |
| `client/src/__tests__/ReviewForm.test.tsx` | Create | Submit validation |

---

## Feature 3 — Email Notifications (Nodemailer)

### 3.1 Server

| File | Action | Purpose |
|------|--------|---------|
| `server/src/services/email.ts` | Create | Nodemailer transport + template functions |
| `server/src/routes/orders.ts` | Edit | Send confirmation email after checkout |
| `server/src/routes/contact.ts` | Edit | Actually send contact form email |
| `server/src/services/promo.ts` | Edit | Send promo usage notifications |
| `server/.env.example` | Edit | Add SMTP config vars |
| `server/.env` | Edit | Add SMTP config |

**New env vars:**

```
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=MAISON. <noreply@maison-boutique.com>
ADMIN_EMAIL=admin@boutique.com
```

**Email templates (inline HTML strings):**

```ts
// services/email.ts
export const emailService = {
  sendOrderConfirmation(user, order, invoiceUrl) — order details + invoice link
  sendContactReply(to, subject, message) — auto-reply to contact form
  sendPromoNotification(user, promo) — new promo code available
  sendOrderStatusUpdate(user, order) — status changed notification
}
```

### 3.2 Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 3.3 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/email.test.ts` | Create | Mock transport, verify correct recipients/templates |

---

## Feature 4 — Search Autocomplete

### 4.1 Server

| File | Action | Purpose |
|------|--------|---------|
| `server/src/routes/products.ts` | Edit | Add `GET /api/products/autocomplete?q=...&limit=6` |

**Route:**

```ts
router.get('/autocomplete', async (req, res) => {
  const { q, limit = '6' } = req.query;
  if (!q || String(q).length < 2) return res.json([]);
  const products = await prisma.product.findMany({
    where: { name: { contains: String(q) } },
    take: Number(limit),
    select: { id: true, name: true, price: true, image: true, category: true },
  });
  res.json(products);
});
```

### 4.2 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/api/products.ts` | Edit | Add `autocomplete(q)` |
| `client/src/components/ui/SearchAutocomplete.tsx` | Create | Debounced dropdown with thumbnails |
| `client/src/components/layout/Header.tsx` | Edit | Replace raw input with `<SearchAutocomplete>` |
| `client/src/hooks/useDebounce.ts` | Create | 300ms debounce hook |

### 4.3 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/autocomplete.test.ts` | Create | Query validation, empty results, limit |
| `client/src/__tests__/SearchAutocomplete.test.tsx` | Create | Debounce, dropdown, keyboard nav |

---

## Feature 5 — PostgreSQL Migration

### 5.1 Schema Changes

| Change | Detail |
|--------|--------|
| `datasource db.provider` | `"sqlite"` → `"postgresql"` |
| `@@unique` on CartItem | Already works, but PostgreSQL supports native composite unique |
| Full-text search | Replace `contains` with `to_tsvector`/`to_tsquery` for French |
| `@db.Text` | Use for `description` fields (no 14KB VARCHAR limit) |
| `@db.Uuid` | Consider for ID generation instead of cuid |

**Prisma schema diff:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"    // <-- change
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String   @db.Text    // <-- explicit text type
  price       Float
  image       String
  // ... rest unchanged
}
```

### 5.2 Server Changes

| File | Action | Purpose |
|------|--------|---------|
| `server/prisma/schema.prisma` | Edit | Switch provider |
| `server/src/routes/products.ts` | Edit | Replace `contains` with PostgreSQL `search` for full-text |
| `server/src/routes/admin.ts` | Edit | Same for admin product search |
| `docker-compose.yml` | Edit | Add PostgreSQL service |
| `.github/workflows/ci.yml` | Edit | Add PostgreSQL service container |

**Full-text search helper:**

```ts
// server/src/utils.ts — add
export function buildSearchFilter(query: string) {
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  };
}
```

### 5.3 Migration Steps

```bash
# 1. Start PostgreSQL (Docker or local)
docker compose up -d postgres

# 2. Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/boutique

# 3. Generate and run migration
npx prisma migrate dev --name postgresql

# 4. Seed
npx prisma db seed

# 5. Update CI
# Add postgres service to .github/workflows/ci.yml
```

### 5.4 Testing

| File | Action | Purpose |
|------|--------|---------|
| `.github/workflows/ci.yml` | Edit | PostgreSQL service for tests |
| `server/src/__tests__/search.test.ts` | Create | Full-text search tests |

---

## Feature 6 — Image Upload (Multer)

### 6.1 Server

| File | Action | Purpose |
|------|--------|---------|
| `server/src/routes/upload.ts` | Create | `POST /api/upload` (admin only, multipart) |
| `server/src/index.ts` | Edit | Mount upload routes, serve `/uploads` static |
| `server/src/middleware/upload.ts` | Create | Multer config: disk storage, 5MB limit, image filter |
| `server/src/routes/admin.ts` | Edit | Update product create/update to accept image field |

**Dependencies:**

```bash
npm install multer
npm install -D @types/multer
npm install sharp   # optional: for thumbnails/optimization
```

**Multer config:**

```ts
// middleware/upload.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});
```

**Routes:**

```
POST   /api/upload               — single file upload → { url: "/uploads/xxx.jpg" }
DELETE /api/upload/:filename      — delete uploaded file (admin)
```

### 6.2 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/api/admin.ts` | Edit | Add `uploadImage(file)` |
| `client/src/components/admin/ImageUploader.tsx` | Create | Drag & drop + preview |
| `client/src/pages/admin/ProductsAdmin.tsx` | Edit | Integrate uploader |
| `client/vite.config.ts` | Edit | Add `/uploads` proxy |

### 6.3 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/upload.test.ts` | Create | File type validation, size limit, path traversal prevention |

---

## Feature 7 — SEO (react-helmet-async)

### 7.1 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/components/seo/SEOHead.tsx` | Create | Reusable `<Helmet>` wrapper |
| `client/src/main.tsx` | Edit | Wrap app in `<HelmetProvider>` |
| `client/src/pages/Home.tsx` | Edit | Add home page meta |
| `client/src/pages/Products.tsx` | Edit | Add listing meta |
| `client/src/pages/ProductDetail.tsx` | Edit | Add product-specific OG tags + structured data |
| `client/src/pages/Checkout.tsx` | Edit | `noindex` meta |
| `client/src/pages/admin/Admin.tsx` | Edit | `noindex, nofollow` |
| `client/public/index.html` | Edit | Add base meta tags |

**Dependencies:**

```bash
npm install react-helmet-async
```

**SEOHead component:**

```tsx
// components/seo/SEOHead.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string; // 'website' | 'product'
}

const SITE_NAME = 'MAISON.';
const DEFAULT_DESC = 'Boutique de mode haut de gamme — vêtements, accessoires, pièces intemporelles.';

export default function SEOHead({ title, description, image, url, type = 'website' }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || DEFAULT_DESC} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESC} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    </Helmet>
  );
}
```

### 7.2 Structured Data (JSON-LD)

For `ProductDetail.tsx`, add JSON-LD script tag for product schema:

```tsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.image,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "EUR",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
      "aggregateRating": reviewStats ? {
        "@type": "AggregateRating",
        "ratingValue": reviewStats.avg,
        "reviewCount": reviewStats.count,
      } : undefined,
    })}
  </script>
</Helmet>
```

### 7.3 Testing

| File | Action | Purpose |
|------|--------|---------|
| `client/src/__tests__/SEOHead.test.tsx` | Create | Verify meta tags rendered correctly |

---

## Feature 8 — Performance (Lazy Loading + Code Splitting)

### 8.1 Client — Code Splitting

| File | Action | Purpose |
|------|--------|---------|
| `client/src/App.tsx` | Edit | Replace static imports with `React.lazy()` |

**Before (current):**

```tsx
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
// ... 10+ static imports
```

**After:**

```tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));
const OrdersAdmin = lazy(() => import('./pages/admin/OrdersAdmin'));
```

### 8.2 Loading Skeletons

Create `client/src/components/ui/PageSkeleton.tsx` for the `<Suspense>` fallback. Or reuse existing `Skeletons.tsx`.

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<Home onQuickView={() => {}} />} />
    ...
  </Routes>
</Suspense>
```

### 8.3 Image Lazy Loading

| File | Action | Purpose |
|------|--------|---------|
| `client/src/components/products/ProductCard.tsx` | Edit | Add `loading="lazy"` to `<img>` |
| `client/src/components/products/ImageGallery.tsx` | Edit | Add `loading="lazy"` + intersection observer |
| `client/src/components/ui/Skeletons.tsx` | Edit | Add skeleton for lazy-loaded images |

### 8.4 React Query Prefetching

| File | Action | Purpose |
|------|--------|---------|
| `client/src/pages/Home.tsx` | Edit | Prefetch featured products |
| `client/src/components/layout/Header.tsx` | Edit | Prefetch categories on hover |

### 8.5 Vite Build Optimization

| File | Action | Purpose |
|------|--------|---------|
| `client/vite.config.ts` | Edit | Add `build.rollupOptions.output.manualChunks` |

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        query: ['@tanstack/react-query'],
        motion: ['framer-motion'],
      },
    },
  },
},
```

### 8.6 Testing

| File | Action | Purpose |
|------|--------|---------|
| — | — | Verify bundle size with `npx vite build --analyze` |

---

## Feature 9 — Dark Mode

### 9.1 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/stores/themeStore.ts` | Create | Zustand persist store for theme |
| `client/src/components/ui/ThemeToggle.tsx` | Create | Sun/moon toggle button |
| `client/src/components/layout/Header.tsx` | Edit | Add toggle to header |
| `client/src/index.css` | Edit | Add dark mode CSS variables |
| All page components | Edit | Add `dark:` Tailwind variants |

**Theme store:**

```ts
// stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      set: (t) => set({ theme: t }),
    }),
    { name: 'theme' }
  )
);
```

### 9.2 Tailwind 4 Dark Mode Config

Tailwind 4 uses CSS-native dark mode. In `index.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* ... existing vars ... */
  --color-dark-bg: #0f0f0f;
  --color-dark-surface: #1a1a1a;
  --color-dark-text: #e0e0e0;
}
```

### 9.3 Color Mapping

| Light | Dark |
|-------|------|
| `bg-white` | `dark:bg-dark-surface` |
| `bg-cream` | `dark:bg-dark-bg` |
| `text-charcoal` | `dark:text-dark-text` |
| `text-gray-400` | `dark:text-gray-500` |
| `border-gray-100` | `dark:border-gray-800` |

### 9.4 Files to Update

Major files requiring `dark:` variants:

- `Header.tsx`, `Footer.tsx`, `MobileBottomNav.tsx`
- `Home.tsx`, `Products.tsx`, `ProductDetail.tsx`
- `Cart.tsx`, `Checkout.tsx`, `Orders.tsx`
- `Login.tsx`, `Register.tsx`, `Contact.tsx`
- `ProductCard.tsx`, `CartDrawer.tsx`, `QuickView.tsx`
- `Admin.tsx`, `Dashboard.tsx`, `ProductsAdmin.tsx`, `OrdersAdmin.tsx`
- All UI components (`Breadcrumbs.tsx`, `QuantitySelector.tsx`, `Skeletons.tsx`, `Toast.tsx`, `PageWrapper.tsx`)

### 9.5 Theme Toggle Placement

Add to Header (right side, near user menu):

```tsx
<button onClick={toggleTheme} className="p-3 rounded-full text-gray-400 hover:text-charcoal dark:hover:text-dark-text transition-all">
  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
</button>
```

### 9.6 System Preference Detection

On first load, check `prefers-color-scheme`:

```ts
// In themeStore initializer or App.tsx
if (!localStorage.getItem('theme')) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  useThemeStore.getState().set(prefersDark ? 'dark' : 'light');
}
```

### 9.7 Testing

| File | Action | Purpose |
|------|--------|---------|
| `client/src/__tests__/ThemeToggle.test.tsx` | Create | Toggle, persist, system preference |

---

## Feature 10 — Server-Side Wishlist

### 10.1 DB Schema

```prisma
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

// Add to User model:
//   wishlist WishlistItem[]

// Add to Product model:
//   wishlist WishlistItem[]
```

### 10.2 Server

| File | Action | Purpose |
|------|--------|---------|
| `server/src/routes/wishlist.ts` | Create | CRUD routes |
| `server/src/index.ts` | Edit | Mount wishlist routes |
| `server/src/routes/products.ts` | Edit | Include `wishlistCount` on product detail |

**API routes:**

```
GET    /api/wishlist                  — get user's wishlist (auth)
POST   /api/wishlist                  — add product (auth)
DELETE /api/wishlist/:productId       — remove product (auth)
GET    /api/wishlist/check?productIds=... — check multiple products (auth)
```

**Check route** (for bulk heart status on product listing):

```ts
router.get('/check', authMiddleware, async (req, res) => {
  const { productIds } = req.query;
  if (!productIds) return res.json([]);
  const ids = String(productIds).split(',');
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId, productId: { in: ids } },
    select: { productId: true },
  });
  res.json(items.map(i => i.productId));
});
```

### 10.3 Client

| File | Action | Purpose |
|------|--------|---------|
| `client/src/api/wishlist.ts` | Create | CRUD + check API |
| `client/src/stores/wishlistStore.ts` | Edit | Replace localStorage with API-backed store |
| `client/src/hooks/useWishlist.ts` | Create | React Query hooks for wishlist |
| `client/src/pages/ProductDetail.tsx` | Edit | Use server wishlist |
| `client/src/components/products/ProductCard.tsx` | Edit | Add heart icon, use wishlist hook |
| `client/src/components/products/RelatedProducts.tsx` | Edit | Add heart icon |
| `client/src/components/cart/CartDrawer.tsx` | Edit | Add wishlist icon |
| `client/src/pages/Checkout.tsx` | Edit | Remove wishlist, keep cart only |
| `client/src/types/index.ts` | Edit | Add WishlistItem type |

**Migration strategy** — sync localStorage to server on login:

```ts
// hooks/useWishlist.ts
export function useWishlistSync() {
  const { user } = useAuthStore();
  const localIds = useWishlistStore(s => s.ids); // from localStorage
  const serverIds = useWishlistIds(); // from API

  useEffect(() => {
    if (user && localIds.length > 0) {
      // Merge local to server on first login after migration
      localIds.forEach(id => addWishlistMutation.mutate(id));
      useWishlistStore.setState({ ids: [] }); // clear local
    }
  }, [user]);
}
```

### 10.4 Testing

| File | Action | Purpose |
|------|--------|---------|
| `server/src/__tests__/wishlist.test.ts` | Create | Add, remove, check, duplicate prevention |
| `client/src/__tests__/useWishlist.test.tsx` | Create | Hook returns correct state |

---

## Implementation Checklist (Recommended Order)

### Sprint 1 — Foundation (parallel)
- [ ] **5. PostgreSQL** — Migrate DB, update docker-compose, CI
- [ ] **7. SEO** — Add react-helmet-async, SEOHead, JSON-LD
- [ ] **8. Performance** — Lazy loading, code splitting, image lazy, prefetching
- [ ] **9. Dark Mode** — Theme store, CSS variables, toggle, dark: variants

### Sprint 2 — Features (parallel)
- [ ] **1. Promo Codes** — Schema, routes, Checkout integration
- [ ] **2. Reviews** — Schema, routes, ProductDetail integration
- [ ] **10. Wishlist** — Schema, routes, replace localStorage

### Sprint 3 — Services
- [ ] **3. Email** — Nodemailer setup, templates, hook into orders/contact
- [ ] **6. Image Upload** — Multer, upload route, admin UI

### Sprint 4 — Polish
- [ ] **4. Search Autocomplete** — Debounced search endpoint + dropdown
- [ ] **Final testing** — All features integration tested
- [ ] **API.md update** — Document all new endpoints

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Promo codes in DB vs config | DB | Dynamic, admin-managed, track usage |
| Reviews: one per user per product | Yes | Prevents abuse, enforced via `@@unique` |
| Email: async vs sync | Sync (fire-and-forget) | Nodemailer is fast enough; no queue needed for this scale |
| Wishlist: localStorage → DB | Yes, with migration sync | Persist across devices, but graceful merge on login |
| Image storage: local vs S3 | Local (uploads/) | Keep simple; S3 can be added later by swapping storage |
| Dark mode: Tailwind 4 `dark` variant | Yes, with `@custom-variant` | Native Tailwind 4 approach, CSS-first |
| Search: PostgreSQL `LIKE` vs `ILIKE` vs full-text | `ILIKE` (case-insensitive LIKE) | Sufficient for product names; full-text for larger datasets |

---

## Shared Type Definitions

All new types to add to `client/src/types/index.ts`:

```ts
export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

export interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}
```

---

*Plan generated for MAISON. Boutique — Express+Prisma+SQLite+React 19+Vite+Tailwind 4+Zustand+React Query*
