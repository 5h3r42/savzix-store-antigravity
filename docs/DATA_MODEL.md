# Data Model (Supabase MVP)

## Schema Overview

All core tables live in `public` and are protected with row-level security (RLS).

## `profiles`

Maps 1:1 to `auth.users`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Yes | PK, FK to `auth.users(id)`. |
| `email` | `text` | Yes | Unique user email. |
| `name` | `text` | No | Optional display name. |
| `role` | `'customer' \| 'admin'` | Yes | Access role, defaults to `customer`. |
| `created_at` | `timestamptz` | Yes | UTC timestamp. |

## `products`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `text` | Yes | PK (`PROD-001` style). |
| `slug` | `text` | Yes | Unique URL slug (`/products/[id]`). |
| `name` | `text` | Yes | Product title. |
| `description` | `text` | Yes | Product description. |
| `category` | `text` | Yes | Catalog grouping. |
| `price` | `numeric(10,2)` | Yes | Price in GBP. |
| `stock` | `integer` | Yes | Non-negative integer. |
| `status` | `'Active' \| 'Draft' \| 'Archived'` | Yes | Product lifecycle status. |
| `image` | `text` | Yes | Public image URL/path. |
| `created_at` | `timestamptz` | Yes | Creation timestamp. |
| `updated_at` | `timestamptz` | Yes | Auto-updated on writes. |

## `orders`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `text` | Yes | PK (`ORD-1001` style). |
| `user_id` | `uuid` | Yes | FK to `profiles(id)`. |
| `subtotal` | `numeric(10,2)` | Yes | Item total. |
| `shipping` | `numeric(10,2)` | Yes | Shipping charge. |
| `total` | `numeric(10,2)` | Yes | `subtotal + shipping`. |
| `status` | `'Pending' \| 'Confirmed' \| 'Cancelled'` | Yes | Order state. |
| `created_at` | `timestamptz` | Yes | Creation timestamp. |
| `updated_at` | `timestamptz` | Yes | Auto-updated on writes. |

## `order_items`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `bigint` | Yes | Identity PK. |
| `order_id` | `text` | Yes | FK to `orders(id)`. |
| `product_id` | `text` | Yes | FK to `products(id)`. |
| `quantity` | `integer` | Yes | Positive integer. |
| `unit_price` | `numeric(10,2)` | Yes | Price at order time. |

## Relationships

- `profiles.id -> auth.users.id`
- `orders.user_id -> profiles.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`

## RLS Policy Model

### Public users

- Can read only products where `status = 'Active'` and `stock > 0`.

### Authenticated customers

- Can read/update own profile.
- Can read own orders + own order items.

### Admin users (`profiles.role = 'admin'`)

- Can read/write all products.
- Can read/update all profiles.
- Can read/update all orders.
- Can write order items.
- Can upload/update/delete `product-images` storage objects.

## Storage

Bucket: `product-images`

- Public read enabled.
- Admin-only write/update/delete enforced via storage policies.

## Bootstrap & Sync

- `handle_new_user()` trigger creates/updates profile row when a new `auth.users` row is created.
- `is_admin()` SQL helper is used by RLS policies and middleware-backed checks.
