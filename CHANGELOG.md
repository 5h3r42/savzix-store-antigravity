# Changelog

## 2026-09-26

- Task: Replace the storefront favicon with the supplied SAVZIX icon.
- Files changed: `src/app/icon.png`, `src/app/favicon.ico`, `src/app/layout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Promoted the supplied `data/Logo/favicon.png` artwork into the Next.js app, updated root metadata to use `/icon.png`, and removed the obsolete conventional ICO that browsers were still receiving first. The source PNG remains unchanged in `data/Logo/`.
- Validation/tests: Confirmed the source and promoted PNG have identical SHA-256 hashes; `npm run lint`, `npm run build`, and `git diff --check` passed. Browser metadata inspection confirmed `/icon.png` is now the only primary favicon entry.
- Next task: Continue the remaining legal-content and launch-readiness review.

- Task: Add registered company information to the shared footer.
- Files changed: `src/config/site.ts`, `src/components/layout/Footer.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Centralised the legal company name, registration number, and registered address alongside the existing VAT number, then added a semantic Company column as the first left-hand footer section. The footer now displays AITECH INNOVATIONS LTD, 483 Green Lanes, London N13 4BS, England, company number `15076403`, and VAT registration `GB498138444` across the storefront.
- Validation/tests: `npm run lint`, `npm run build`, and `git diff --check` passed. Browser inspection confirmed the four-column desktop presentation and readable stacked mobile layout at 390 × 844.
- Next task: Continue the remaining legal-content and launch-readiness review.

- Task: Add a customer enquiry form to the Contact Us page.
- Files changed: `src/app/contact/page.tsx`, `src/components/content/ContactForm.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a mobile-first contact form with persistent labels for name, email, optional order number, enquiry topic, and message; browser validation, length limits, a spam honeypot, accessible live status text, and structured `mailto:` preparation for `support@savzix.com`. The support address remains available as a direct fallback link, and the form clearly explains that the customer reviews the email before sending.
- Validation/tests: `npm run lint`, `npm run build`, and `git diff --check` passed. Browser validation confirmed the email link, labelled fields, required-field error handling, and responsive 390 × 844 layout without triggering an external email client.
- Next task: Add a server-side transactional email provider if direct in-page submission becomes a requirement.

- Task: Complete the product-title refresh across the full catalogue.
- Files changed: `scripts/lib/retail-product-title.ts`, `scripts/refresh-keepa-product-titles.ts`, `data/keepa-title-refresh-report.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Expanded title normalization to cover wholesale pack placement, source typos, foreign-language and promotional tails, overlong marketplace copy, gift sets, fragrances, electrical products, and known malformed source rows. Matched all 251 products and applied 128 remaining title-only updates; all final generated titles are 90 characters or fewer and no rows were skipped.
- Validation/tests: Reviewed the complete dry-run change set before applying it, verified every written name against Supabase, and refreshed the representative Alfaparf product page to confirm the cleaned title appears in the breadcrumb, image alternative text, H1, and product copy. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Clean and standardise imported product descriptions.

- Task: Improve Keepa product titles and refresh the live Supabase catalogue.
- Files changed: `scripts/lib/retail-product-title.ts`, `scripts/refresh-keepa-product-titles.ts`, `scripts/sync-keepa-catalogue.ts`, `package.json`, `data/keepa-title-refresh-report.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added conservative, deterministic retail-title normalization to future Keepa catalogue imports and a dedicated title-only refresh command. Matched all 251 live products, safely updated 62 names in Supabase, preserved slugs and all commerce fields, and held 27 questionable changes for manual review. The representative Bio-Oil title is now `Bio-Oil Natural Skincare Oil for Scars & Stretch Marks 60ml`.
- Validation/tests: Completed a dry run and reviewed every eligible title before applying updates; the run verified all written names in Supabase. Refreshed the live product page and confirmed the cleaned title appears in the breadcrumb, image alternative text, H1, and product copy. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Manually review the 27 held title candidates and then clean imported product descriptions.

- Task: Fix the three checkout-path accessibility findings.
- Files changed: `src/components/cart/CartDrawer.tsx`, `src/components/layout/Navbar.tsx`, `src/app/checkout/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added product-specific names to basket decrement and increment controls, conditionally rendered the mobile category dialog only while open, and replaced checkout placeholder-only fields with persistent visible labels, field names, input types, and browser autocomplete metadata.
- Validation/tests: `npm run lint`, `npm run build`, and `git diff --check` passed. Browser verification at 390 × 844 confirmed the closed menu is absent from the accessibility tree, the open menu is exposed as a dialog, basket quantity controls announce the product name, checkout fields retain visible labels, and no console warnings or errors were produced.
- Next task: Clean the imported catalogue titles and descriptions before refining promotion presentation.

- Task: Audit SAVZIX from a consumer and accessibility perspective.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; audit report and six screenshots saved under `/tmp/savzix-consumer-audit/`.
- Summary: Reviewed the home, Beauty & Skincare catalogue, representative product detail, basket drawer, checkout, and mobile home experience. Documented strengths, conversion friction, accessibility risks, and a prioritised remediation plan, plus a reusable prompt for future audits. No application code was changed.
- Validation/tests: Captured and visually inspected six screenshots, reviewed the browser accessibility tree for each core step, checked the 390 × 844 mobile viewport, confirmed the tested journey produced no browser console warnings or errors, and did not submit payment.
- Next task: Fix the checkout field labelling, basket quantity-control names, and closed mobile-menu accessibility state before lower-priority catalogue copy and promotion improvements.

## 2026-09-25

- Task: Include VAT in the cart and checkout experience.
- Files changed: `src/config/site.ts`, `src/lib/vat.ts`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/components/cart/CartDrawer.tsx`, `src/app/api/checkout/route.ts`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added the registered VAT number and standard 20% VAT rate to the site configuration plus a shared VAT-inclusive calculator. Cart and checkout summaries now show the VAT contained in the gross total while keeping the customer total unchanged. Stripe Checkout line items are declared tax-inclusive, and the session and PaymentIntent receive the VAT amount, rate, inclusion status, and VAT number as metadata; the hosted payment page also receives a customer-facing VAT message.
- Validation/tests: Verified a £60.00 checkout displays £10.00 VAT included at 20%, retains a £60.00 total, and shows VAT number `GB498138444`. Confirmed the cart drawer no longer says taxes will be added at checkout. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Add per-product VAT classification before introducing any reduced-rate, zero-rated, or exempt goods; otherwise continue launch-priority SEO and deployment work.

- Task: Standardise all prices and checkout currency on GBP.
- Files changed: `src/components/cart/CartDrawer.tsx`, `src/components/products/ProductGrid.tsx`, `src/app/admin/products/new/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced the cart drawer's manual dollar prefix and the legacy product grid's dollar formatter with the shared `en-GB`/GBP formatter. Updated the admin product price field to display a pound sign and explicitly label the value as GBP. Confirmed the checkout API already stores orders as `GBP` and sends lowercase `gbp` currency codes to Stripe for product and shipping line items.
- Validation/tests: Verified the live checkout summary and cart drawer both display `£60.00`; searched the application for remaining customer-facing dollar or USD price formatting; confirmed the database migration constrains order currency to GBP; `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue the launch-priority SEO and deployment work.

- Task: Make the storefront tablet and mobile responsive.
- Files changed: `src/app/layout.tsx`, `src/app/products/[id]/page.tsx`, `src/components/home/Hero.tsx`, `src/components/layout/Navbar.tsx`, `src/components/shop/ShopFilters.tsx`, `src/components/shop/ShopLayout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a dedicated mobile search row and removed the redundant mobile category rail; separated home and category copy from product artwork below the desktop breakpoint; moved the catalogue sidebar breakpoint to desktop so tablets receive a full-width product grid and filter drawer; and introduced a balanced two-column product-detail layout for tablets with correctly sized thumbnails. Desktop presentation and the approved home-page content remain unchanged.
- Validation/tests: Visually verified the home, category, product-detail, cart, checkout, login, and account routes at 320 × 700, 390 × 844, 768 × 1024, and 1440 × 900. Confirmed no page-level horizontal overflow on the seven key routes at mobile and tablet widths; exercised mobile search, category-menu expansion, the tablet filter drawer, add-to-basket, and the cart drawer; confirmed the final browser pass added no console warnings or errors. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Review the cart drawer's currency formatting separately, then continue launch-priority SEO and deployment work.

- Task: Replace the storefront header branding with the supplied SAVZIX logo.
- Files changed: `public/brand/savzix-logo-transparent.webp`, `src/components/brand/BrandLogo.tsx`, `src/components/layout/Navbar.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Promoted the supplied transparent SAVZIX WebP into the public brand assets, updated the reusable horizontal/wordmark logo configuration to use its native 814 × 201 proportions, and replaced the header's text-only brand name with the responsive image. Preserved the square mark used by the admin login and added an explicit accessible label to the storefront home link.
- Validation/tests: Confirmed the asset and its Next.js optimized response return HTTP 200; visually inspected the supplied source and live header in the in-app browser at the normal desktop viewport and 390 × 844 mobile viewport; verified the full wordmark remains visible without clipping or displacing search, menu, account, or cart controls. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Blend category artwork seamlessly into the full-width hero section.
- Files changed: `src/components/shop/ShopLayout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a tablet-and-desktop mask to the shared category artwork layer so the left edge of each contained 16:9 composition fades naturally into the wider hero background. This removes the beige/grey vertical boundary without cropping, stretching, regenerating, or obscuring the product group. Mobile keeps its intentional stacked copy-and-image presentation.
- Validation/tests: Verified all seven category routes at 1440 × 900; each retained `object-fit: contain`, applied the expected 36%–56% edge mask, displayed the correct heading, and produced no console warnings/errors or visible framework error overlay. Visually inspected the Fragrance result at desktop and mobile sizes, then navigated from Fragrance to Gift Sets and confirmed the route and H1 updated. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Apply the category-hero content audit across all taxonomy categories.
- Files changed: `src/components/shop/ShopLayout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced the generic `Shop` heading with each active category name, removed the internal Main Category/Subcategory badge, duplicated product/result counts, Browsing label, and redundant View all link from category heroes. Reduced the desktop hero to approximately 400px, improved subcategory-link legibility and accessible labels, and placed the single mobile product count beside the catalogue controls. The main `/shop` hero remains unchanged.
- Validation/tests: Verified Beauty & Skincare, Fragrance, Gift Sets, Health & Wellness, Suncare & Travel, Electrical, and Toiletries at 1440 × 900. Every route displayed its expected H1, a 402px hero, no duplicated metadata, no console warnings/errors, and no visible framework error overlay. Verified Beauty & Skincare at 390 × 844 with a 462px hero and one `68 products` label near the controls, then navigated to Fragrance and confirmed the URL and H1 updated. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Fit all category images inside the shared hero section.
- Files changed: `src/components/shop/ShopLayout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced cover-cropping with right-aligned image containment so every category composition remains fully visible inside the desktop banner. On mobile, bottom-aligned the full artwork and reserved dedicated space beneath the copy, preventing text and category links from overlapping the image.
- Validation/tests: Verified all seven category routes at a 1440 × 900 viewport using Chrome through Playwright; each hero reported `object-fit: contain`, complete fitted dimensions, no console warnings/errors, and no visible framework error overlay. Verified Gift Sets at 390 × 844 with a measured 20px gap between the content and artwork, then navigated through the category rail to Beauty & Skincare and confirmed the route and description updated. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Create and replace the top-level category hero images.
- Files changed: `public/categories/beauty-skincare-hero-v2.png`, `public/categories/fragrance-hero.png`, `public/categories/gift-sets-hero.png`, `public/categories/health-wellness-hero.png`, `public/categories/suncare-travel-hero.png`, `public/categories/electrical-hero.png`, `public/categories/toiletries-hero.png`, `src/config/category-taxonomy.ts`, `docs/category-hero-prompts.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Generated seven distinct premium 1672 × 941 category compositions using five matching catalogue products in each image. Preserved left-side negative space for live category copy, connected every top-level taxonomy node to its matching local asset with descriptive alt text, and documented the exact product selections and reusable prompts. Renamed the Beauty & Skincare asset to a cache-safe filename so the replacement loads immediately.
- Validation/tests: Visually verified all seven category routes in the in-app browser, including correct artwork, readable live copy, complete product groups, and route-specific image alt text. `git diff --check`, `npm run lint`, and `npm run build` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Fix the Supabase auth-lock runtime error on the storefront.
- Files changed: `src/components/layout/Navbar.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the navbar's competing `getUser()` initialization request and made `onAuthStateChange` the single source of initial and subsequent browser auth state. Kept the auth callback synchronous, deferred the admin-profile query until after Supabase releases its auth lock, and guarded deferred results against unmounts and stale auth events.
- Validation/tests: Reproduced the `Runtime AbortError: Lock broken by another request with the 'steal' option` overlay and four Supabase orphaned-lock warnings in the in-app browser; reloaded after the fix and waited beyond the previous five-second lock timeout with no new warnings or errors and no framework overlay. Confirmed the authenticated Account/Sign Out navigation state and opened/closed the cart successfully. `npm run lint` and `npm run build` passed.
- Next task: Continue the remaining shop and product-detail page visual alignment.

- Task: Correct the premium hero image composition at source.
- Files changed: `public/home/premium-catalogue-hero-v2.png`, `src/components/home/Hero.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Re-composed the existing five-product studio artwork so the full group starts earlier, feels connected to the copy, and leaves deliberate clearance after the Bio-Oil bottle and riser. Applied the corrected asset under a cache-safe filename and shortened the white copy gradient so it no longer unnecessarily washes over the Aveeno product. The hero copy block, product count, image scale, section height, and landing-page order remain unchanged.
- Validation/tests: Inspected the revised 1774 × 887 source image, verified the final result in the user's actual Chrome storefront tab and the in-app browser, confirmed all five products remain complete and recognizable with balanced left and right spacing, and confirmed all above-the-fold copy is unchanged. `npm run lint` and `npm run build` passed.
- Next task: Continue approved storefront polish without altering the locked hero copy or landing-page section order.

- Task: Simplify the Trusted brands logo section.
- Files changed: `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the redundant section heading above the centered brand-logo row while retaining all logo assets, responsive layout behavior, and the approved home-page section order.
- Validation/tests: Browser accessibility inspection confirmed the title is absent and all five brand-logo alt texts remain present; `npm run lint` and `npm run build` passed.
- Next task: Continue the remaining approved storefront polish without altering the locked home-page composition.

- Task: Replace the Trusted brands text row with centered brand-logo assets.
- Files changed: `src/components/home/LandingCollections.tsx`, `public/brand/logos/aveeno.svg`, `public/brand/logos/cerave.png`, `public/brand/logos/dove.png`, `public/brand/logos/lynx.png`, `public/brand/logos/nivea.svg`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced the plain brand-name text with a locally served, centered responsive grid of official Aveeno, CeraVe, Dove, Lynx, and NIVEA logo assets. The layout is two columns on small screens, three on small tablets, and five balanced columns on desktop.
- Validation/tests: Browser review verified all five marks load with meaningful alt text and sit in a centered row without wrapping at the local desktop viewport; `npm run lint` and `npm run build` passed.
- Next task: Continue the remaining approved storefront polish without altering the locked home-page composition.

- Task: Apply the outstanding order/stock migrations and test the complete payment workflow.
- Files changed: `supabase/migrations/004_orders_payment_and_customer_fields.sql`, `supabase/migrations/005_stock_reservations.sql`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; schema and sandbox order changes in Supabase project `vhoukfbnkgowhvxskkfi`.
- Summary: Applied migrations 004 and 005 transactionally, hardened all payment and stock-reservation RPCs to service-role-only execution, and completed a £44.98 Stripe sandbox purchase. The first abandoned sandbox session was explicitly expired to verify reservation release; the replacement session completed successfully. Test records were retained for audit under confirmed order `ORD-24373075-977520` and cancelled order `ORD-24135117-0AD0CB`.
- Validation/tests: Confirmed anonymous RPC access returns 401; unpaid checkout reserved one unit of each product without changing stock; `checkout.session.expired` returned HTTP 200 and restored both reservations to zero; `checkout.session.completed` returned HTTP 200; the paid order is `Confirmed`/`paid` with a PaymentIntent and paid timestamp; Aveeno stock changed 25 to 24 and Body Lotion stock changed 10 to 9 exactly once; both reserved quantities are zero; the cart cleared; the confirmation page reported success; and account history shows the confirmed £44.98 order. `npm run lint` and `npm run build` were run after the workflow verification.
- Next task: Configure production Supabase and Stripe webhook variables, then repeat this sandbox checkout against the deployed environment before launch.

## 2026-09-24

- Task: Remove the standalone logo from the customer login form.
- Files changed: `src/app/login/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the redundant linked brand mark above the Sign In/Create Account switch and cleaned up its unused imports. The shared SAVZIX storefront header remains unchanged.
- Validation/tests: `npm run lint` and `npm run build` passed; browser verification confirmed the login form now begins with the authentication switch and contains no standalone logo image.
- Next task: Continue the remaining authentication-page visual cleanup as directed.

- Task: Test the local Stripe payment flow.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; no application code changed.
- Summary: Confirmed the app uses a Stripe test key, authenticated a disposable confirmed customer, started a local webhook forwarder, populated checkout, and submitted a two-item £44.98 test order. Checkout stopped before Stripe because the connected Supabase project does not have `products.reserved_quantity`; a separate read also confirmed `orders.customer_email` is absent, showing migrations 004 and 005 are not applied. The UI displayed a controlled error and retained the cart.
- Validation/tests: Verified `/checkout` rendered correctly, test authentication succeeded, the cart contained both products, form submission reached `/api/checkout`, browser console had no warnings or errors, Supabase returned schema error `42703`, no order was created, and the disposable user/listener/log were removed afterward.
- Next task: Apply migrations 004 and 005 to project `vhoukfbnkgowhvxskkfi`, then repeat the test through Stripe Checkout, webhook confirmation, stock decrement, order history, and cart clearing.

- Task: Add four products to each landing-page product section.
- Files changed: `src/app/page.tsx`, `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Populated New arrivals with the four newest active products, Offers with the four lowest-priced active products, and Bestsellers with four products from the existing order-ranking flow and catalogue fallback. Reused the standard product card so product links, prices, stock state, and Add to basket behavior remain consistent with the shop.
- Validation/tests: `npm run lint` and `npm run build` passed; browser verification confirmed exactly four linked, purchasable product cards under each of the three product-led sections while Popular departments and Trusted brands retained their approved treatments.
- Next task: Review the selected products and add explicit promotion metadata before presenting Offers as discounted pricing.

- Task: Replace shop load-more behavior with numbered pagination.
- Files changed: `src/components/shop/ProductGrid.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Changed product discovery to 24-item pages with numbered controls, compact ellipses for larger result sets, Previous/Next navigation, an accurate visible-product range, automatic return to the grid on page changes, and page-one reset when filters or sorting change.
- Validation/tests: `npm run lint` and `npm run build` passed; browser verification confirmed page two replaces the visible products, updates the range, exposes the active page accessibly, and disables boundary controls correctly.
- Next task: Continue the remaining shop and product-detail visual alignment without changing the approved landing page.

- Task: Activate verified catalogue products with stock of 10 each.
- Files changed: `scripts/sync-keepa-prices-and-categories.ts`, `data/keepa-price-category-sync-summary.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; product inventory/status changes in Supabase project `vhoukfbnkgowhvxskkfi`.
- Summary: Added explicit activation and stock controls to the price/category synchroniser, then activated the 202 EAN-priced products with 10 units each. The 48 unresolved-price products remain Drafts with zero stock to prevent £0 or ambiguous listings from becoming purchasable.
- Validation/tests: Dry run predicted 202 Active and 48 Draft products; live sync verified 250 products and 454 category links; an independent admin/public query confirmed all 202 active products have positive prices, stock 10, and a primary category; visually verified the local Beauty & Skincare listing renders products, prices, and Add to basket controls.
- Next task: Resolve the remaining 48 product prices before activating them.

- Task: Apply verified real prices and category assignments to the imported catalogue.
- Files changed: `scripts/sync-keepa-prices-and-categories.ts`, `package.json`, `data/keepa-price-category-sync-summary.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; applied existing `supabase/migrations/003_categories_taxonomy.sql` and seeded taxonomy data in project `vhoukfbnkgowhvxskkfi`.
- Summary: Matched `data/Real Price.xlsx` to the 250-product launch set using normalized EAN/GTIN/UPC values with exact-title fallback. Applied 202 unique positive prices, left 40 unmatched, 6 zero/invalid, and 2 conflicting prices unchanged, and created 454 category links covering all 250 products. Products remain Draft with zero stock because the price workbook contains no inventory quantities.
- Validation/tests: Dry run completed without missing taxonomy paths; live sync verified 250 products and 454 category links; independent service-role query confirmed 202 priced products, 48 zero-price products, and a primary category for every product; public-key query confirmed active categories are readable and Draft category links remain hidden; `npm run lint` passed.
- Next task: Review the 48 unresolved prices and supply real stock quantities before activating products.

- Task: Import the 250-product Keepa launch catalogue and product images.
- Files changed: `scripts/import-product-images.ts`, `scripts/sync-keepa-catalogue.ts`, `package.json`, `data/image-import-manifest.json`, `data/image-import-manifest.csv`, `data/image-import-summary.json`, `data/keepa-catalogue-sync-summary.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; cloud changes to the `vhoukfbnkgowhvxskkfi` Supabase project.
- Summary: Added category-aware WebP image importing and a Keepa-specific catalogue sync. Uploaded 1,095 images for 250 products and upserted all 250 products with source-derived descriptions. Products were deliberately imported as hidden Drafts with zero price and stock so unapproved Keepa cost data cannot become customer-facing retail pricing.
- Validation/tests: Image dry run found 1,095 images across 250 folders; live upload completed with 1,095 successes and zero failures; catalogue sync upserted and re-read all 250 records; five sampled public assets returned HTTP 200 with `image/webp`; `npm run lint` and `npm run build` passed.
- Next task: Add approved retail prices and stock quantities, then activate only the reviewed products.

- Task: Simplify the product-detail price row.
- Files changed: `src/app/products/[id]/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the standalone product-size and per-litre price labels so the purchase panel displays only the selling price.
- Validation/tests: `npm run lint` passed; visually verified the local Aveeno product page now shows only `£7.99` in the price row.
- Next task: Complete validation of the wider product-detail redesign.

## 2026-09-21

- Task: Preserve original product images in the Keepa packaging workflow.
- Files changed: `/Users/sherazkhalid/.codex/skills/keepa-product-packager/SKILL.md`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/scripts/package-keepa-product.mjs`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Packages now retain detected source images as numbered `-original` files alongside matching WebP upload candidates. The skill requires background review and product-artwork fidelity before a WebP is uploaded.
- Validation/tests: Both packager scripts passed `node --check`; skill validation passed.
- Next task: Run the revised workflow on a newly approved Keepa product before its Supabase import.

- Task: Remove live product images from category banners.
- Files changed: `src/components/shop/ShopLayout.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the category-header logic that selected and displayed catalogue product images. Category banners now use their decorative treatment only, while products display in the results grid.
- Validation/tests: Confirmed the local Health & Wellness category banner exposes no product image; `npm run lint` and `npm run build` passed.
- Next task: Review category-banner copy and decorative artwork once the full catalogue is available.

- Task: Remove the visible white canvas from product-card imagery.
- Files changed: `src/components/shop/ProductCard.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Applied `mix-blend-multiply` to product-card imagery so white source-image backgrounds blend into the muted PLP image surface, while preserving the original branded asset and the card border.
- Validation/tests: Visually verified the Health & Wellness product card in the local storefront; `npm run lint` and `npm run build` passed.
- Next task: Decide whether the product-detail page needs a separate image presentation treatment.

- Task: Add the first live SAVZIX catalogue product in the new Supabase project.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; cloud changes to the `vhoukfbnkgowhvxskkfi` Supabase project.
- Summary: Applied the core catalogue schema and product-brand metadata migration, created the public `product-images` bucket, uploaded the Aveeno Baby product image, and added an Active Aveeno Baby Soothing Relief Emollient Cream 150 ml product at £7.99 with 25 units of stock.
- Validation/tests: Supabase SQL returned the `PROD-001` record; the public image endpoint returned HTTP 200 with `image/jpeg` and 66,412 bytes.
- Next task: Configure the app with the new Supabase project's public URL and publishable key, then verify the product on `/shop` before adding further products.

- Task: Lock the approved SAVZIX landing-page composition.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Recorded the approved product-free home-page order as a protected design decision. No landing-page code or storefront behavior changed.
- Validation/tests: Documentation review only.
- Next task: Continue non-landing-page work without changing the approved home-page composition.

- Task: Set the exact product-free home-page section order.
- Files changed: `src/app/page.tsx`, `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Set the home page to New arrivals, Offers, Bestsellers, Popular departments, and Trusted brands after the hero. Removed Shop by need and retained static calls to action until real catalogue products are imported.
- Validation/tests: `npm run lint` and `npm run build` passed; verified section order in the local preview.
- Next task: Import approved catalogue products into Supabase, then replace static new-arrivals and bestseller messaging with real product collections.

- Task: Make landing-page sections product-free before catalogue import.
- Files changed: `src/app/page.tsx`, `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the empty new-arrivals, value-picks, and bestseller product rails and their Supabase reads. The landing page now uses static offers, linked shopping-by-need cards, and a trusted-brand strip without fabricated product content.
- Validation/tests: `npm run lint` and `npm run build` passed; verified the local landing page no longer renders product rails.
- Next task: Import approved catalogue products into Supabase, then add product-led collections back with real data.

- Task: Remove category dropdown on desktop search hover.
- Files changed: `src/components/layout/Navbar.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the search container's hover handlers so the hidden desktop category mega-menu can no longer open while searching. The visible category rail remains fully available.
- Validation/tests: Confirmed the local preview keeps the search area and category rail visible without a mega-menu; `npm run lint` passed.
- Next task: Continue the remaining shop and product-detail visual alignment after the live catalogue is imported.

- Task: Scope Supabase MCP to the new SAVZIX project.
- Files changed: `.mcp.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Scoped the Codex Supabase MCP server to project `vhoukfbnkgowhvxskkfi` (`savzix.com`) and authenticated only `projects:read` and `database:read` scopes. The MCP connection is read-only and cannot alter database data or schema.
- Validation/tests: OAuth login succeeded and the Codex MCP registry reports the scoped Supabase server as enabled with OAuth authentication.
- Next task: Inspect the empty project schema and retrieve the public connection settings before applying the existing SAVZIX migrations in a separately authorised write-enabled task.

- Task: Authenticate restricted Supabase MCP access.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Registered the official Supabase MCP server in Codex and completed OAuth with only `organizations:read` and `projects:read` scopes. The connection cannot create projects or access databases.
- Validation/tests: `codex mcp list` reports the Supabase server as enabled with OAuth authentication.
- Next task: List the accessible organisations and projects, then request only the additional scope required to create or select the new SAVZIX project.

- Task: Configure restricted Supabase MCP access.
- Files changed: `.mcp.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added the official hosted Supabase MCP endpoint with only `docs` and `account` feature groups enabled. The initial configuration intentionally has no database access and will be narrowed to the SAVZIX project before schema or data work begins.
- Validation/tests: Confirmed `https://mcp.supabase.com/mcp` responds with the expected unauthenticated `401`; validated the JSON configuration.
- Next task: Authenticate the MCP client, create or select the new SAVZIX project, then update the configuration to a project-scoped connection.

- Task: Add product-led landing-page sections.
- Files changed: `src/app/page.tsx`, `src/components/home/LandingCollections.tsx`, `design-qa.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added reusable new-arrivals, offers, shop-by-need, bestseller, and trusted-brand sections. New arrivals follow active-product recency, offers use real lowest-priced active products, and bestsellers use the existing ranking helper. All category and shop calls to action point to existing routes.
- Validation/tests: Inspected the generated landing-section concept and the local browser rendering; verified all section links; `npm run lint` and `npm run build` passed.
- Next task: Import approved catalogue products into Supabase so the product rails render their live product cards.

- Task: Centre the desktop storefront category navigation.
- Files changed: `src/components/layout/Navbar.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Centred the category links within the desktop rail while preserving the existing overflow behavior on narrower viewports.
- Validation/tests: Verified the desktop home-page category rail in the local browser preview.
- Next task: Continue the remaining shop and product-detail page visual alignment after catalogue content is approved.

- Task: Apply the approved retail prototype design to the SAVZIX storefront.
- Files changed: `src/components/layout/Navbar.tsx`, `src/app/shop/page.tsx`, `src/components/home/CategoryGrid.tsx`, `src/components/home/InnerCircle.tsx`, `design-qa.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Aligned the shared header, navigation, home department area, reassurance content, and product discovery flow with the approved clean white, navy, and blue retail prototype. Added a functional search handoff to the existing shop route while retaining the current Supabase, cart, authentication, checkout, and Stripe architecture.
- Validation/tests: Visually compared the prototype and the local implementation in a desktop browser; verified category links and campaign calls to action render against existing routes; verified the `/shop?q=...` search-result state; `npm run lint` and `npm run build` passed.
- Next task: Apply the same visual pass to remaining shop-filter and product-detail page details after catalogue content is approved.

## 2026-09-20

- Task: Create the category-organised 250-product WebP launch asset set.
- Files changed: `data/product images/beauty-skincare/`, `data/product images/fragrance/`, `data/product images/toiletries/`, `data/product images/health-wellness/`, `data/product images/gift-sets/`, `data/product images/suncare-travel/`, `data/product images/electrical/`, `data/product images/launch-catalogue-summary.json`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/SKILL.md`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/scripts/package-keepa-product.mjs`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/scripts/package-keepa-launch-catalogue.mjs`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a deterministic category-aware 250-product batch workflow. It selected a balanced launch mix, downloaded 1,095 supplied image URLs, converted them directly to WebP, and created a product-details file for every package without changing the source XLSX or Supabase data.
- Validation/tests: Batch summary reports 250 completed and zero failed packages. Verified the seven category totals, 1,095 non-empty valid WebP files, zero retained JPEG/PNG files within the category packages, and a product-details file in every package. Skill validation and script syntax checks passed.
- Next task: Review the generated launch selection and approve products before a separate Supabase catalogue-import task.

- Task: Create a reusable Keepa product-packaging skill.
- Files changed: `/Users/sherazkhalid/.codex/skills/keepa-product-packager/SKILL.md`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/scripts/package-keepa-product.mjs`, `/Users/sherazkhalid/.codex/skills/keepa-product-packager/agents/openai.yaml`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a user-level skill and deterministic helper for selecting a Keepa XLSX product by exact title or EAN, downloading image URLs, generating a source-derived details file, and reporting partial download failures safely.
- Validation/tests: Skill validator passed; helper syntax check passed; dry-run successfully resolved the Aveeno Baby Cream record with EAN `3574661652214` and nine images without changing package files.
- Next task: Run the skill against an approved subsequent product or batch when required.

- Task: Create a one-product catalogue package from the Keepa export.
- Files changed: `data/product images/Aveeno Baby Soothing Relief Emollient Cream for Sensitive Skin (1 x 150ml)/01.jpg` through `09.jpg`, `data/product images/Aveeno Baby Soothing Relief Emollient Cream for Sensitive Skin (1 x 150ml)/product-details.txt`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Downloaded all nine supplied source images for the selected Aveeno Baby Cream product and added a readable source-data record with EAN, product attributes, ingredients, benefits, safety warning, image URLs, and a source-derived retail description.
- Validation/tests: Confirmed successful HTTP image downloads; file-level JPEG and required-field validation completed.
- Next task: Use the same controlled folder convention for subsequent approved Keepa-export product batches.

- Task: Apply the approved SAVZIX retail design to the storefront.
- Files changed: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/login/page.tsx`, `src/components/layout/Navbar.tsx`, `src/components/home/Hero.tsx`, `src/components/home/CategoryGrid.tsx`, `src/components/shop/ProductCard.tsx`, `src/components/shop/ShopLayout.tsx`, `src/components/layout/Footer.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced the ivory-and-gold presentation with clean white surfaces, navy primary actions, blue accents, a compact benefit bar, and a horizontally scrollable category rail. Refined the home, category, shop, product-card, login, and footer treatment to a practical health-and-beauty retail style.
- Validation/tests: `npm run lint` passed. `next build` compiled and completed TypeScript/static generation, but the final trace write could not complete because the local disk reported `ENOSPC`.
- Next task: Complete visual alignment of the shop and product-detail pages, then verify the finished responsive storefront in a browser.

- Task: Document the approved SAVZIX retail design direction.
- Files changed: `design.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Defined the navy, blue, and white palette; Space Grotesk typography rules; practical retail components; and a user-controlled horizontal category rail. Removed gold from the design system.
- Validation/tests: Documentation review; no application code changed.
- Next task: Apply the approved design system to storefront components after the design discussion is complete.

## 2026-04-29

- Fixed cart clearing on failed or expired Stripe payments by only clearing the cart after `payment_status = paid`.
- Project audit + control system setup
