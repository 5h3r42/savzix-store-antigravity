---
name: savzix-store
description: Repository-specific skill for working on the Savzix ecommerce store. Use when modifying, extending, auditing, or debugging the Savzix Next.js storefront, checkout, auth, admin, category, taxonomy, Stripe, and related commerce workflows.
---

# Savzix Store

Use this skill when working inside the `savzix-store` repository.

## Start Here
1. Read `README.md`, `docs/DATA_MODEL.md`, and `docs/LAUNCH_WEEK.md`.
2. Open the route and library cluster that matches the task.
3. Finish with `npm run lint` and usually `npm run build`. There is no automated test suite in the repo today.

## Open the Right Files

### Storefront and Category Browse
- `src/app/page.tsx`
- `src/app/shop/page.tsx`
- `src/app/c/[...path]/page.tsx`
- `src/app/[category]/[[...subcategory]]/page.tsx`
- `src/components/shop/*`
- `src/lib/shop-products.ts`
- `src/lib/category-taxonomy.ts`
- `src/config/category-taxonomy.ts`
- `src/config/category-route-filters.ts`

### Product Detail, Cart, Checkout, and Orders
- `src/app/products/[id]/page.tsx`
- `src/components/products/AddToCartButton.tsx`
- `src/context/CartContext.tsx`
- `src/components/cart/*`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/order-confirmation/page.tsx`
- `supabase/migrations/004_orders_payment_and_customer_fields.sql`

### Auth, Account, and Admin
- `middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/auth/session.ts`
- `src/app/login/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/account/page.tsx`
- `src/app/admin/**/*`
- `src/lib/admin-orders.ts`

### Taxonomy, Catalog Sync, and Admin Category Assignment
- `src/config/category-taxonomy.ts`
- `src/lib/product-taxonomy-classifier.ts`
- `src/app/admin/products/[id]/categories/page.tsx`
- `src/components/admin/ProductCategoryAssignmentsForm.tsx`
- `src/app/api/admin/products/[id]/categories/route.ts`
- `scripts/seed-categories-taxonomy.ts`
- `scripts/backfill-product-categories.ts`
- `supabase/migrations/003_categories_taxonomy.sql`

### Legal, Support, and Static Pages
- `src/components/content/StaticContentPage.tsx`
- the specific page under `src/app/contact`, `src/app/shipping`, `src/app/returns`, `src/app/faq`, `src/app/privacy`, `src/app/terms`, or `src/app/cookies`

## Repository Truths
- This is a Next.js 16 App Router app with React 19, strict TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/Storage, and Stripe Checkout.
- `src/app/globals.css` defines the shared ivory and gold theme tokens. `Space_Grotesk` is the global font in `src/app/layout.tsx`.
- `src/config/site.ts` is the runtime source of truth for site name, currency, support email, and shipping thresholds.
- `NEXT_PUBLIC_SITE_NAME` exists in docs and env templates but is not currently read by the runtime.
- Storefront PDP routing is slug-based even though the file is `src/app/products/[id]/page.tsx`.
- Cart items store the product slug as the cart item id. The checkout API intentionally resolves both slugs and database ids.
- Public catalog visibility is `status = 'Active'` and `stock > 0`.
- The cart is client-side localStorage state. The server only learns cart contents when `/api/checkout` receives them.
- Checkout creates an unpaid order first, then Stripe redirect happens, then the webhook confirms payment and decrements stock via `confirm_paid_order`.
- Do not move stock decrement into client code or checkout form submission.
- Admin access depends on `profiles.role = 'admin'`, middleware protection, server-side auth checks, and Supabase RLS and RPCs.
- Canonical taxonomy is seeded from `src/config/category-taxonomy.ts` into Supabase `categories`; `product_categories` stores assignments. The storefront has a fallback path for missing taxonomy tables, but launch expects the seeded relational model.
- `/c/...` and legacy `[category]/[[...subcategory]]` routes redirect into `/shop?categoryPath=...`.
- `src/app/admin/customers/page.tsx` and `src/app/admin/settings/page.tsx` currently redirect to `/admin/orders`.
- Search and action UI on some screens is only partially implemented. Read the current component or route handler before assuming a feature already exists.

## Safe Working Rules
- Prefer server components. Add `"use client"` only for real client-side interactivity.
- Use `createServerSupabaseClient` for request-scoped server work, `createBrowserSupabaseClient` in client auth UI, and `createAdminSupabaseClient` only in trusted server code or scripts.
- Reuse existing helpers before adding new ones: `formatPrice`, `cleanTitle`, `cleanDescription`, `StaticContentPage`, taxonomy helpers, and order/admin aggregation utilities.
- Keep `dynamic = "force-dynamic"` or an equivalent explicit strategy on pages that depend on live auth, order, or catalog data.
- If you change SQL schema, update the migration and `src/types/supabase.ts` together.
- If you add protected routes, update `middleware.ts` and the server-side auth or role check path together.
- If you change taxonomy structure, update the config tree first, then re-run seed/backfill, and only adjust route-filter heuristics if the relational model cannot cover the case.
- Use `next/image` for shipped assets and keep approved assets in `public/`; keep generated candidates in `output/imagegen/`.
- Do not treat `.next/`, `node_modules/`, `output/imagegen/`, or generated summary files under `data/` as hand-edited source of truth.

## Common Commands
```bash
npm install
cp .env.example .env.local
npm run dev
npm run lint
npm run build
npm run start:standalone
```

Apply migrations in order:
1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_add_brand_to_products.sql`
3. `supabase/migrations/003_categories_taxonomy.sql`
4. `supabase/migrations/004_orders_payment_and_customer_fields.sql`

Then run:
```bash
npm run seed:categories
npm run backfill:product-categories
```

Admin bootstrap:
```bash
npm run bootstrap:admin
```
Run this only after the intended admin has already signed up in Supabase Auth.

Local Stripe flow:
```bash
npm run dev
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```
Update `STRIPE_WEBHOOK_SECRET` in `.env.local`, then verify order creation, webhook confirmation, stock decrement, `/account`, and `/admin/orders`.

Catalog and image operations:
```bash
npm run sync:catalog -- --dry-run
npm run sync:catalog -- --run
npm run import:product-images -- --dry-run
npm run import:product-images -- --run
npm run migrate:products
```
Notes:
- `sync-catalog-from-xlsx.ts` defaults to an author-specific absolute XLSX path unless `--xlsx` is supplied.
- `import-product-images.ts` defaults to an author-specific absolute source directory unless `--source` is supplied.
- Both scripts write manifests and summaries under `data/`.
- `migrate:products` uses `data/products.json`.

AI image workflow:
```bash
npm run image:setup
npm run image:gen -- --prompt-file docs/ai-prompts/home-hero.txt ...
```
Use `docs/ai-images.md` and `docs/ai-prompts/*`. Promote approved finals into `public/home`, `public/categories`, or `public/brand`.

## Task Checklists

### Storefront or Category Work
- Verify `/shop`, `/c/...`, and any legacy category redirect still behave correctly.
- Check PLP filtering and sorting plus PDP links.
- Confirm add-to-cart still uses slug-based routes and cart ids.

### Checkout, Auth, or Order Work
- Verify login, signup, and `next` redirect behavior.
- Verify `/checkout` and `/account` protection in `middleware.ts`.
- Confirm unpaid order creation, Stripe session save, webhook confirmation, and order confirmation page behavior.
- Keep the UK-only server-side shipping rule in mind unless the task explicitly expands fulfillment support.

### Admin, Catalog, or Taxonomy Work
- Verify admin login and role gating.
- Re-check `/admin`, `/admin/orders`, `/admin/products`, and category assignment flows.
- If schema or taxonomy changes, update migrations, `src/types/supabase.ts`, and any seed/backfill scripts together.

### Content, Legal, or Brand Work
- Reuse `StaticContentPage` for policy and support pages.
- Keep support email, currency, and shipping numbers aligned with `src/config/site.ts`.
- Make sure footer and navigation links still point to live routes.

## When Behavior Conflicts
Prefer these sources of truth in this order:
1. Route handlers and server-side libs
2. SQL migrations and `src/types/supabase.ts`
3. Current README and docs
4. UI copy

Example: checkout UI lists several countries, but the API currently enforces United Kingdom shipping only. Follow the server-side rule unless the task explicitly changes the business policy.
