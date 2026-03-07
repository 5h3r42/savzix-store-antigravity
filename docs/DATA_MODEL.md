# SAVZIX Data Model

## Core Tables

All core tables live in `public` and are protected with row-level security.

### `profiles`

Maps 1:1 to `auth.users`.

Key fields:

- `id` uuid primary key, linked to `auth.users(id)`
- `email` unique customer or admin email
- `name` optional display name
- `role` `customer | admin`

### `products`

Catalog products used by the storefront and admin.

Key fields:

- `id` text primary key in `PROD-001` style
- `slug` unique product route slug
- `name`
- `description`
- `brand`
- `category` legacy catalog grouping
- `price`
- `stock`
- `status` `Active | Draft | Archived`
- `image`

### `categories`

Canonical taxonomy table introduced for category routing and admin assignment.

Key fields:

- `id`
- `name`
- `slug`
- `parent_id`
- `path`
- `description`
- `image_url`
- `is_active`
- `sort_order`

### `product_categories`

Join table between products and canonical categories.

Key fields:

- `product_id`
- `category_id`
- `is_primary`
- `sort_order`

### `orders`

Customer order records created before payment confirmation and finalized after Stripe webhook processing.

Key fields:

- `id` text primary key in `ORD-` style
- `user_id`
- `customer_email`
- `customer_first_name`
- `customer_last_name`
- `customer_phone`
- `shipping_address_line1`
- `shipping_city`
- `shipping_postal_code`
- `shipping_country`
- `notes`
- `currency`
- `payment_provider`
- `payment_status`
- `stripe_checkout_session_id`
- `stripe_payment_intent_id`
- `paid_at`
- `subtotal`
- `shipping`
- `total`
- `status`

### `order_items`

Snapshot of purchased products at order time.

Key fields:

- `id`
- `order_id`
- `product_id`
- `quantity`
- `unit_price`

## Relationships

- `profiles.id -> auth.users.id`
- `orders.user_id -> profiles.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `categories.parent_id -> categories.id`
- `product_categories.product_id -> products.id`
- `product_categories.category_id -> categories.id`

## Operational Notes

- `handle_new_user()` creates or updates the matching `profiles` row when a new auth user is created.
- `is_admin()` is used by middleware and RLS-aware admin checks.
- `confirm_paid_order(p_order_id, p_payment_intent_id)` is used by the Stripe webhook flow to mark an order as paid and decrement stock transactionally.
- Product images are stored in the public `product-images` bucket.

## Runtime Strategy

- Canonical category routing and product assignment should use `categories` and `product_categories`.
- The storefront fallback logic that tolerates missing taxonomy tables is a resilience layer, not the intended launch configuration.
