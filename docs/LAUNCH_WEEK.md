# Launch Week Plan (MVP)

## MVP Scope
The MVP flow for launch week is:

1. Shop listing (`/shop`)
2. Product detail (`/products/[id]`)
3. Cart (drawer from global navbar)
4. Checkout placeholder (`/checkout`)
5. Order confirmation placeholder (`/order-confirmation`)

The checkout page is intentionally a redirect/placeholder workflow in Day 1. Payment processing is out of scope for today.

## Route Flow
`/shop -> /products/[id] -> cart drawer -> /checkout -> /order-confirmation`

## Day-by-Day Checklist

### Day 1: Scope Lock + Foundation
- [x] Lock MVP route and flow boundaries.
- [x] Add launch-week and data-model docs.
- [x] Add environment template (`.env.example`).
- [x] Add site-level config contract (`src/config/site.ts`).
- [x] Align TypeScript Product contract with model spec.
- [x] Add `/checkout` and `/order-confirmation` placeholders.
- [x] Make lint/build baseline clean.

### Day 2: Catalog Hardening
- [ ] Add filtering and sorting on shop page.
- [ ] Improve product detail content structure (ingredients/usage sections).
- [ ] Add empty/loading/error states for product fetches.

### Day 3: Cart + Pricing Rules
- [ ] Add shipping calculation with threshold logic.
- [ ] Add cart total summary breakdown (subtotal/shipping/total).
- [ ] Validate quantity and out-of-stock edge cases.

### Day 4: Checkout UX (No Payment Integration)
- [ ] Add customer details form for checkout placeholder.
- [ ] Add order summary card and confirmation preview.
- [ ] Add form validation and submission state handling.

### Day 5: Auth + Account Stability
- [ ] Refine customer login placeholders and account routing.
- [ ] Add route guards and safe redirects for account/admin pages.
- [ ] Improve error messaging and fallback UX.

### Day 6: QA + Performance Pass
- [ ] Run full lint/build checks and fix regressions.
- [ ] Verify responsive layouts and major route journeys.
- [ ] Run accessibility and basic SEO checks.

### Day 7: Launch Readiness
- [ ] Final smoke test of all MVP routes.
- [ ] Confirm environment variables in deployment.
- [ ] Freeze scope, create launch notes, and publish.

## Risks
- Data persistence currently relies on local JSON/file-backed flow; production scaling needs DB migration.
- Placeholder checkout may create expectation mismatch if not clearly labeled during QA.
- Missing authentication hardening could affect admin/customer experience.
- Inventory consistency can drift without transactional order handling.

## Non-Goals (MVP Week)
- Real payment gateway integration.
- Advanced promotions, discounts, gift cards, and coupon engines.
- Full OMS/fulfillment pipeline integration.
- Multi-currency and multi-region tax automation.
- Enterprise analytics and experimentation tooling.

## Launch Readiness Criteria
- All MVP routes work end-to-end without 404s.
- `npm run lint` and `npm run build` pass.
- Core docs and env template are present and consistent.
- Checkout is explicitly marked as placeholder until payments are implemented.
