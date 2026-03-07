# Savzix Store

Savzix Store is a Next.js 16 ecommerce storefront with Supabase-backed auth, database, and storage, and Stripe Checkout for payment collection.

## Stack

- Next.js 16 App Router (React 19 + TypeScript)
- Tailwind CSS 4
- Supabase Auth
- Supabase Postgres
- Supabase Storage (`product-images` bucket)
- Stripe Checkout + webhooks

## Required Environment Variables

Create `.env.local` from `.env.example` and set:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Apply the required Supabase migrations for launch:

- [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
- [`supabase/migrations/002_add_brand_to_products.sql`](supabase/migrations/002_add_brand_to_products.sql)
- [`supabase/migrations/003_categories_taxonomy.sql`](supabase/migrations/003_categories_taxonomy.sql)
- [`supabase/migrations/004_orders_payment_and_customer_fields.sql`](supabase/migrations/004_orders_payment_and_customer_fields.sql)

4. Seed the taxonomy and backfill product/category assignments:

```bash
npm run seed:categories
npm run backfill:product-categories
```

5. Start the app:

```bash
npm run dev
```

## Admin Bootstrap

After the admin user signs up once in Supabase Auth, grant admin role:

```bash
npm run bootstrap:admin
```

This promotes `ADMIN_EMAIL` to `profiles.role = 'admin'`.

## Catalog and Images

### Import product images

```bash
npm run import:product-images -- --run
```

### Generate AI marketing assets

Use the repo-local workflow in [docs/ai-images.md](docs/ai-images.md) for hero images, category art, and logo concepts.

```bash
npm run image:setup
npm run image:gen -- --prompt-file docs/ai-prompts/home-hero.txt --size 1536x1024 --quality high --output-format webp --out-dir output/imagegen/home-hero --downscale-max-dim 1600
```

Add `OPENAI_API_KEY=your_key_here` to `.env.local` before running the image commands.

### Sync catalog into Supabase

```bash
npm run sync:catalog -- --run
```

This sync reads the XLSX catalog, applies brand/category/price/image data, and upserts products by slug.

## Taxonomy Launch Strategy

- The production catalog should run with the taxonomy tables from `003_categories_taxonomy.sql`.
- The runtime fallback in the storefront exists as a safeguard, not as the primary launch strategy.
- After applying `003`, run `npm run seed:categories` and `npm run backfill:product-categories`.

## Launch Notes

- Checkout requires authentication.
- `/account` requires authentication.
- `/admin` requires an admin user.
- Orders are created as unpaid first, then confirmed via Stripe webhook after successful payment.
- Product image uploads go to the public `product-images` bucket.
- The live checkout flow currently supports United Kingdom shipping addresses only.

## Local Stripe Test

1. Start the app:

```bash
npm run dev
```

2. In a second terminal, forward webhooks to the local app:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

3. Update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the webhook signing secret printed by Stripe CLI for that local session, then restart the app if needed.
4. Sign in as a customer, add an in-stock product to the cart, complete checkout, and pay with a Stripe test card.
5. Confirm that:

- `/order-confirmation` resolves the order ID.
- the order is marked paid/confirmed in the database and admin area.
- stock is decremented only after webhook confirmation.

## Deployment (Hostinger Node App)

1. Add the production environment variables in Hostinger.
2. Deploy the repository.
3. Install dependencies:

```bash
npm ci
```

4. Build and start:

```bash
npm run build
npm run start:standalone
```

5. Apply the taxonomy seed/backfill steps in the production environment after migrations.
6. In Stripe, configure the production webhook endpoint:

```text
https://savzix.com/api/stripe/webhook
```

## Validation Commands

```bash
npm run lint
npm run build
```
