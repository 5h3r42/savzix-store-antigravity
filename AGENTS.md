# Savzix Store Agent Guide

This repository is a production-focused ecommerce codebase. Treat changes to checkout, auth, orders, admin, taxonomy, and catalog data as high impact.

## Project Overview
- SAVZIX is a Next.js storefront for beauty, fragrance, gift sets, toiletries, health and wellness, and related essentials.
- The current launch path in the repo is `/shop -> /products/[slug] -> /cart -> /checkout -> Stripe Checkout -> /order-confirmation`.
- Major product areas already implemented:
  - storefront home, shop, category browse, and product detail
  - client-side cart and checkout handoff
  - customer login, signup, and account order history
  - admin dashboard, orders, products, category assignment, and image upload
  - legal and support content pages
  - catalog, taxonomy, and image import scripts

## Stack
- Framework: Next.js 16 App Router
- UI: React 19 with strict TypeScript
- Styling: Tailwind CSS 4 via `src/app/globals.css` theme variables, with `Space_Grotesk` loaded through `next/font`
- Backend and data: Supabase Auth, Supabase Postgres, Supabase Storage
- Payments: Stripe Checkout plus Stripe webhooks
- Deployment assumption: standalone Next.js Node deployment (`next.config.ts` uses `output: "standalone"` and the README documents a Hostinger Node app flow)
- Validation: `npm run lint` and `npm run build`; there is no automated test suite in the repo today

## Repository Structure
- `src/app/`
  - App Router routes
  - storefront routes: `page.tsx`, `shop/page.tsx`, `products/[id]/page.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `order-confirmation/page.tsx`
  - auth and account routes: `login/page.tsx`, `account/page.tsx`, `auth/callback/route.ts`
  - category routing: `c/[...path]/page.tsx` for canonical category URLs and `[category]/[[...subcategory]]/page.tsx` for legacy category redirects
  - admin UI: `admin/*`
  - route handlers: `api/checkout/route.ts`, `api/stripe/webhook/route.ts`, `api/products/route.ts`, `api/admin/uploads/route.ts`, `api/admin/products/[id]/categories/route.ts`
- `src/components/`
  - domain-grouped UI components for `home`, `shop`, `products`, `cart`, `auth`, `layout`, `admin`, and `content`
- `src/lib/`
  - server-side commerce and platform helpers
  - Supabase clients, auth session helpers, Stripe helpers, order aggregation, product store access, taxonomy/category lookup, product copy cleanup
- `src/config/`
  - site constants, category navigation config, taxonomy tree, and route-filter fallback rules
- `src/context/CartContext.tsx`
  - client cart state backed by browser local storage
- `src/types/`
  - TypeScript domain types plus the hand-maintained Supabase schema mirror in `src/types/supabase.ts`
- `supabase/migrations/`
  - schema, RLS, category taxonomy, and order/payment SQL
- `scripts/`
  - admin bootstrap, legacy product migration, category seed/backfill, catalog sync from XLSX, product image import, standalone start helper
- `docs/`
  - launch notes, data model, AI image workflow, prompt files
- `data/`
  - import inputs and generated manifests and summaries used by scripts
- `public/`
  - approved production assets that ship with the site
- `output/imagegen/`
  - generated image candidates that should not be treated as approved production assets

## Engineering Rules
- Follow existing patterns before introducing new ones. This repo already has working patterns for server components, client interactivity, Supabase access, Stripe checkout, and static content pages.
- Prefer server components by default. Add `"use client"` only when browser state, events, local storage, or direct DOM access are required.
- Use the correct Supabase client for the context:
  - `createServerSupabaseClient()` for request-scoped server work
  - `createBrowserSupabaseClient()` in client auth flows
  - `createAdminSupabaseClient()` only in trusted server code or scripts that need service-role access
- Reuse existing helpers before adding new utilities:
  - `src/lib/formatPrice.ts`
  - `src/lib/productText.ts`
  - `src/components/content/StaticContentPage.tsx`
  - taxonomy/category helpers under `src/lib/` and `src/config/`
- Keep data-driven commerce and auth pages dynamic unless you have an explicit caching strategy. Many live routes already use `dynamic = "force-dynamic"` to avoid stale session, order, or catalog data.
- Preserve business logic unless the task explicitly changes it:
  - checkout creates unpaid orders first
  - Stripe webhook confirms payment later
  - stock is decremented only by the `confirm_paid_order` database function
- Do not weaken checkout, auth, or admin protections to "make something work". Middleware, server-side role checks, and Supabase RLS are all part of the design.
- Keep UI changes visually consistent with the existing SAVZIX language: light ivory backgrounds, gold primary accent, card-based layouts, rounded controls, and the existing typography system.

## Project-Specific Workflows

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env:
   ```bash
   cp .env.example .env.local
   ```
3. Apply the Supabase migrations in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_add_brand_to_products.sql`
   - `supabase/migrations/003_categories_taxonomy.sql`
   - `supabase/migrations/004_orders_payment_and_customer_fields.sql`
4. Seed and backfill taxonomy data:
   ```bash
   npm run seed:categories
   npm run backfill:product-categories
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

### Validation
- Minimum validation after meaningful changes:
  ```bash
  npm run lint
  npm run build
  ```
- Deployment-like local validation:
  ```bash
  npm run start:standalone
  ```

### Admin Bootstrap
- After the intended admin user signs up once in Supabase Auth, grant admin access:
  ```bash
  npm run bootstrap:admin
  ```
- This promotes `ADMIN_EMAIL` to `profiles.role = 'admin'`.

### Stripe Checkout and Webhooks
- Local webhook testing uses Stripe CLI:
  ```bash
  stripe listen --forward-to http://localhost:3000/api/stripe/webhook
  ```
- Update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the signing secret for that listener session.
- Verify all of the following after checkout changes:
  - order row creation
  - redirect to `/order-confirmation`
  - webhook marks the order as paid
  - stock decrements only after webhook confirmation
  - order appears correctly in `/account` and `/admin/orders`

### Taxonomy and Category Changes
- The taxonomy tree currently originates in `src/config/category-taxonomy.ts`.
- `scripts/seed-categories-taxonomy.ts` seeds that tree into the `categories` table.
- `scripts/backfill-product-categories.ts` classifies active products and writes `product_categories`.
- If you change taxonomy structure or category semantics:
  - update `src/config/category-taxonomy.ts`
  - update fallback heuristics only if necessary in `src/config/category-route-filters.ts` or `src/lib/product-taxonomy-classifier.ts`
  - re-run `npm run seed:categories`
  - re-run `npm run backfill:product-categories`
  - verify `/c/...`, `/shop?categoryPath=...`, and admin category assignment flows

### Catalog and Image Operations
- Legacy JSON migration:
  ```bash
  npm run migrate:products
  ```
  - reads `data/products.json`
- Catalog sync from XLSX:
  ```bash
  npm run sync:catalog -- --dry-run
  npm run sync:catalog -- --run
  ```
  - reads an XLSX catalog plus `data/image-import-manifest.json`
  - upserts products by slug
  - writes a summary JSON into `data/`
- Product image import:
  ```bash
  npm run import:product-images -- --dry-run
  npm run import:product-images -- --run
  ```
  - uploads into the public `product-images` bucket
  - writes JSON and CSV manifests plus a summary in `data/`
- Important: `scripts/sync-catalog-from-xlsx.ts` and `scripts/import-product-images.ts` ship with author-specific absolute default source paths. Override them with explicit CLI args such as `--xlsx` or `--source` outside the original machine.

### AI Image Workflow
- Setup:
  ```bash
  npm run image:setup
  ```
- Generate candidates with the repo-local workflow described in `docs/ai-images.md`.
- Keep generated candidates in `output/imagegen/...`.
- Promote only approved final assets into `public/home`, `public/categories`, or `public/brand`.
- Do not hotlink temporary generated image URLs into the app.

## Guardrails for Future Edits
- Do not rename or move core routes without checking navbar links, footer links, middleware, redirects, docs, and Stripe callback assumptions:
  - `/shop`
  - `/c/[...path]`
  - `/[category]/[[...subcategory]]`
  - `/products/[id]`
  - `/checkout`
  - `/order-confirmation`
  - `/account`
  - `/admin/*`
  - `/api/stripe/webhook`
- `src/app/products/[id]/page.tsx` is slug-based on the storefront even though the folder name says `[id]`. Do not assume it receives the database product ID.
- Admin product/category routes use the real product ID. Keep slug-based storefront routing and ID-based admin flows distinct.
- Cart items store the product slug as the item id. The checkout route intentionally resolves both slug and database id. Preserve that compatibility if you refactor cart or checkout code.
- Public storefront access depends on `status = 'Active'` and `stock > 0`. Be careful changing visibility or stock rules because RLS, shop queries, and admin reporting all assume this.
- The missing-taxonomy fallback in storefront code is a resilience path only. Production launch expects migrations `001` to `004` plus taxonomy seed/backfill to be in place.
- If you change the SQL schema, update both the migration files and `src/types/supabase.ts` in the same task. Do not leave the TS schema mirror stale.
- If you add or move protected routes, update `middleware.ts` and the relevant server-side auth checks together.
- Keep UI and API rules aligned. Example: the checkout API currently only accepts `United Kingdom` shipping even though the checkout form lists other countries.
- Runtime site constants currently live in `src/config/site.ts`. `NEXT_PUBLIC_SITE_NAME` exists in `.env.example`, `README.md`, and `docs/LAUNCH_WEEK.md`, but the runtime code does not currently read it.
- `src/app/admin/customers/page.tsx` and `src/app/admin/settings/page.tsx` currently redirect to `/admin/orders`; do not treat them as complete feature areas without implementing them.
- Avoid introducing a second pattern when one already exists. In particular:
  - do not add a second auth client abstraction
  - do not add a second product-store access layer
  - do not create a second taxonomy source of truth separate from the existing config tree plus seeded DB tables

## Working Style for AI Agents
- Read the relevant route, supporting lib files, and the matching doc before editing.
- Explain the planned change briefly, then make the smallest complete production-ready edit.
- Prefer reuse and composition over duplication.
- Leave concise comments only where the logic is non-obvious.
- Note which flows were affected, especially if checkout, auth, admin, routing, or taxonomy were touched.
- After meaningful edits, run the appropriate validation commands and state clearly what you verified and what you could not verify manually.
- Do not edit generated or disposable directories unless the task is specifically about them:
  - `.next/`
  - `node_modules/`
  - generated summaries/manifests in `data/`
  - generated candidate assets in `output/imagegen/`
