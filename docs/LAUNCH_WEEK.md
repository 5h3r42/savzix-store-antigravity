# SAVZIX Launch Readiness Runbook

## Current Launch Scope

The current launch path in the repository is:

`/shop -> /products/[id] -> cart -> /checkout -> Stripe Checkout -> /order-confirmation`

Supporting routes already in the app include:

- `/account`
- `/admin`
- `/c/[...path]` canonical category routes
- legal and support pages under `/contact`, `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms`, and `/cookies`

## Required Environment Variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Use `.env.example` as the local template.

## Database Setup

Apply these migrations in order:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_add_brand_to_products.sql`
3. `supabase/migrations/003_categories_taxonomy.sql`
4. `supabase/migrations/004_orders_payment_and_customer_fields.sql`

Then run:

```bash
npm run seed:categories
npm run backfill:product-categories
```

Production strategy: taxonomy is required for launch. The runtime fallback in storefront code is a resilience path only.

## Validation Commands

```bash
npm run lint
npm run build
npm run start:standalone
```

## Local Stripe Test

1. Start the app:

```bash
npm run dev
```

2. Forward Stripe webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

3. Update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the signing secret shown by Stripe CLI for that local listener.
4. Sign in with a customer account.
5. Add an in-stock product to the cart.
6. Complete checkout and pay with a Stripe test card.
7. Verify:

- the order record is created
- Stripe redirects to `/order-confirmation`
- the webhook marks the order as paid
- stock is decremented after payment confirmation
- the order is visible in `/account` and `/admin/orders`

## Launch Checklist

- `npm run lint` passes
- `npm run build` passes
- legal/support routes are live and linked from the footer
- admin bootstrap has been run for the production admin user
- Stripe production webhook points to `/api/stripe/webhook`
- taxonomy seed/backfill has been run after migrations
- checkout succeeds with a live test order in the target environment

## Current Deferrals

- Admin Customers and Admin Settings are intentionally redirected to `/admin/orders` and are not launch-critical.
- Analytics and error monitoring are not part of the current repo-backed launch checklist.
