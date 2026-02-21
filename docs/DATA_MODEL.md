# Data Model (MVP)

## Model Conventions
- IDs are strings for MVP compatibility.
- Monetary fields are stored as decimal numbers in GBP.
- Timestamps are ISO 8601 strings.
- Status values use constrained string unions.
- Models intentionally include only fields needed for launch-week MVP.

## Product Fields
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Internal identifier (e.g. `PROD-001`). |
| `slug` | `string` | Yes | URL-safe identifier used by `/products/[id]`. |
| `name` | `string` | Yes | Product title for list/detail/cart views. |
| `description` | `string` | Yes | Short product description. |
| `category` | `string` | Yes | Display grouping (Serums, Oils, etc.). |
| `price` | `number` | Yes | Unit price in GBP. |
| `stock` | `number` | Yes | Non-negative integer inventory count. |
| `status` | `"Active" \| "Draft" \| "Archived"` | Yes | Publish visibility and lifecycle state. |
| `image` | `string` | Yes | Public image path/URL. |
| `createdAt` | `string` | Yes | ISO timestamp for ordering and audit. |

## Order Fields
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | Yes | Order identifier (e.g. `ORD-1001`). |
| `userId` | `string` | Yes | Reference to `User.id`. |
| `items` | `Array<{ productId: string; quantity: number; unitPrice: number }>` | Yes | Minimal line-item payload. |
| `subtotal` | `number` | Yes | Sum of item totals. |
| `shipping` | `number` | Yes | Shipping charge in GBP. |
| `total` | `number` | Yes | `subtotal + shipping` for MVP. |
| `status` | `"Pending" \| "Confirmed" \| "Cancelled"` | Yes | Minimal order state machine. |
| `createdAt` | `string` | Yes | ISO timestamp. |

## User Fields
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | Yes | User identifier. |
| `email` | `string` | Yes | Unique login email. |
| `name` | `string` | Yes | Display name. |
| `role` | `"customer" \| "admin"` | Yes | Access-level control. |
| `createdAt` | `string` | Yes | ISO timestamp. |

## Relationships
- `Order.userId -> User.id`
- `Order.items[].productId -> Product.id`

## Out-of-Scope Fields (MVP)
- Tax breakdown details.
- Discount/coupon modeling.
- Payment intent/provider identifiers.
- Multi-address books and saved cards.
- Product variants/options matrix.
