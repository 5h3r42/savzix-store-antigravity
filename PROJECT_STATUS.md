# Project Status

## Current Phase

UI Polish + Pre-Launch Fixes

## Key Area Snapshot

- `src/app`: App Router storefront, product, cart, checkout, order confirmation, account, legal/support, and admin routes are present.
- `src/components`: Domain components are grouped by storefront, shop, products, cart, auth, layout, admin, and content.
- Checkout flow: Cart hands off to `/checkout`, which calls `/api/checkout` and then Stripe Checkout. Webhook handling exists under `/api/stripe/webhook`.
- Admin: Dashboard, orders, products, product creation, login, and placeholder customer/settings areas are present. Admin remains partial.

## Completed Work

- Storefront pages (PDP, PLP)
- Cart + checkout
- Cart now clears only after Stripe marks payment as paid
- Supabase integration
- Admin (partial)
- Documented the approved navy, blue, and white retail design direction in `design.md`; gold is retired from the design system.
- Applied the approved retail design system to the shared storefront shell, home page sections, product cards, and footer: white surfaces, navy actions, blue links, compact retail spacing, and a horizontal category rail.
- Created a one-product catalogue package from the Keepa export, including original product images and a source-derived product-details record.
- Added the reusable `keepa-product-packager` user skill for preparing validated local product packages from Keepa XLSX exports.
- Created a 250-product launch asset set in category folders, with 1,095 validated WebP images and complete source-derived product-details files.
- Applied the approved retail prototype direction to the live SAVZIX storefront shell and home page while preserving the existing commerce architecture. The header now prioritises search, category browsing is clearer, and the home page uses practical campaign, department, and reassurance sections.
- Centred the desktop category rail while retaining horizontal scrolling for smaller screens.
- Set the product-free landing-page sequence to New arrivals, Offers, Bestsellers, Popular departments, and Trusted brands. Product-led content will be introduced once the catalogue is imported.
- Authenticated Codex to a project-scoped, read-only Supabase MCP connection for the new `savzix.com` project (`vhoukfbnkgowhvxskkfi`). It has documentation, database-read, and development-read access only.
- Removed the desktop category mega-menu hover trigger from the search area; the horizontal category rail remains the category-navigation control.
- Applied the core catalogue schema and brand metadata migration to the new `savzix.com` Supabase project. Added the first live product, Aveeno Baby Soothing Relief Emollient Cream 150 ml, at £7.99 with 25 units of stock and a publicly verified product image.
- Updated product-card imagery so white source-image canvases blend into the muted PLP image surface without altering branded product assets or the approved landing page.
- Removed live product imagery from category headers. Category products now appear only in the results grid; category-header artwork remains purely decorative.
- Updated the Keepa product-packager workflow to retain original product images beside numbered WebP upload candidates and require background-quality review before upload.
- Simplified the product-detail price row to show only the selling price, removing the repeated size and per-litre price labels.
- Imported the prepared 250-product Keepa launch catalogue into Supabase as hidden Draft records with source-derived descriptions, zero price, and zero stock. Uploaded and verified all 1,095 category-organised WebP product images with no failures.
- Applied the category-taxonomy schema and seeded the approved category tree in Supabase. Assigned all 250 imported products to primary categories and supporting parent categories, and applied 202 barcode-verified selling prices from `data/Real Price.xlsx`; 48 unresolved prices remain unchanged for review.
- Activated the 202 barcode-priced catalogue products with stock set to 10 each. The 48 products without a safe price remain Drafts with zero stock.
- Replaced the shop product grid's load-more interaction with accessible numbered pagination, 24 products per page, compact overflow handling, item ranges, and Previous/Next controls.
- Populated the landing page's New arrivals, Offers, and Bestsellers sections with four live, in-stock catalogue products each while preserving the approved section order and department/brand treatments.
- Ran an initial test-mode checkout smoke test that confirmed authentication, cart persistence, checkout validation, and controlled handling of the then-missing order and stock-reservation schema.
- Removed the duplicate standalone logo from the customer login form while retaining the shared storefront header branding.
- Applied Supabase migrations `004` and `005` to the `savzix.com` project, restricted stock/order RPC execution to the service role, and completed the Stripe sandbox workflow end to end. Verified pending stock reservation, expired-session release, successful payment confirmation, exact-once stock decrement, cart clearing, order confirmation, and customer order history.
- Replaced the Trusted brands text row with locally served original Aveeno, CeraVe, Dove, Lynx, and NIVEA brand marks in a centered, responsive layout.
- Removed the redundant Trusted brands heading above the logo row, leaving the marks as the sole content of that landing-page section.
- Replaced the home-page hero artwork with a premium five-product catalogue composition featuring Aveeno, Dove, Lynx, Beauty of Joseon, and Bio-Oil while preserving the approved hero copy block and page structure unchanged.
- Reduced the hero artwork scale on tablet and desktop so the complete five-product composition sits cleanly on the right with more breathing room; mobile retains the existing crop behavior.
- Corrected the hero artwork at source: the five-product group now begins earlier, retains intentional right-edge clearance, and uses a shorter copy fade so the Aveeno product remains clear without CSS position workarounds.
- Fixed the storefront's Supabase auth-lock runtime overlay by removing the duplicate navbar `getUser()` request and deferring profile lookup until after `onAuthStateChange` releases its lock.
- Created and applied seven distinct premium category hero images using five real catalogue products per composition, with copy-safe layouts for Beauty & Skincare, Fragrance, Gift Sets, Health & Wellness, Suncare & Travel, Electrical, and Toiletries. Documented the reusable production prompts and product selections.
- Corrected the shared category-hero presentation so every full composition fits inside the banner without cropping; mobile now separates the copy and artwork with deliberate spacing.
- Simplified every taxonomy category hero around the customer-facing category name, removed duplicated taxonomy and result metadata, reduced desktop height, improved subcategory-link readability, and kept the single product count beside the catalogue controls.
- Blended the contained category artwork into the wider tablet and desktop hero background, removing the visible vertical colour boundary while preserving complete, uncropped product compositions and the existing mobile stack.
- Replaced the storefront header's text-only SAVZIX branding with the supplied transparent SAVZIX wordmark, preserving the existing home link, focus treatment, and responsive header layout.

## In Progress

- UI polish
- Review the 48 unresolved catalogue prices; the 202 verified products are active with stock 10 each

## Locked Decisions

- The home-page composition is approved and must not be changed without explicit user direction: Hero, New arrivals, Offers, Bestsellers, Popular departments, Trusted brands, reassurance strip, and footer.

## Known Issues

- Missing SEO
- Missing legal pages
- Production deployment variables still need to be updated to the new Supabase project before the live `savzix.com` site can show the new catalogue.

## Notes From Light Audit

- Legal routes are present for privacy and terms, but content/completeness still needs launch review.
- Local Stripe sandbox testing confirms the stock-reservation flow releases expired sessions and decrements stock only after successful webhook confirmation. Production deployment variables and a deployed test-mode webhook still require launch verification.

## Next 5 Tasks

1. Create legal pages (privacy, terms)
2. Add basic SEO (metadata, sitemap)
3. Complete the remaining shop and product-detail page visual alignment
4. Configure the production deployment for the new Supabase project and Stripe webhook
5. Repeat the verified sandbox checkout against the deployed environment before launch
