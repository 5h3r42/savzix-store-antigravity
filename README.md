# Savzix Store

Savzix Store is a Next.js 16 storefront with Supabase-backed auth, database, and storage.

## Stack

- Next.js App Router (React 19 + TypeScript)
- Supabase Auth (email/password)
- Supabase Postgres (RLS enforced)
- Supabase Storage (`product-images` bucket)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill Supabase keys:

```bash
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`

3. Create two Supabase projects (`savzix-dev`, `savzix-prod`) and enable email/password auth.

4. Apply SQL migration in each project:

- Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) in the SQL editor (or through Supabase CLI).

5. Start the app:

```bash
npm run dev
```

## Admin Bootstrap

After the admin user signs up once in Supabase Auth, grant admin role:

```bash
npm run bootstrap:admin
```

This script promotes `ADMIN_EMAIL` to `profiles.role = 'admin'`.

## Product Migration

To migrate existing JSON products into Supabase:

```bash
npm run migrate:products
```

This script reads `data/products.json`, upserts by `slug`, and validates row counts.

## Notes

- `/account` routes require authentication.
- `/admin` routes require `admin` role.
- `/api/products?scope=public` remains public.
- Admin product creation and uploads are restricted via auth + RLS.
