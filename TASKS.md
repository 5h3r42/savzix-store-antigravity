# Tasks

## Today

- Review the next launch-priority task

## Completed

- Fixed cart clearing issue so failed or expired Stripe payments keep the cart intact
- Documented the approved SAVZIX retail design system (navy/blue/white palette, Space Grotesk typography, and user-controlled category rail).
- Applied the approved retail storefront design to the shared navigation, home page, product cards, and footer.
- Created and validated a Keepa-export product package example with nine source images and a complete product-details file.
- Created a reusable Keepa product-packaging skill with a dry-run-capable helper script.
- Created the initial 250-product SAVZIX launch asset set in category folders with WebP-only images.
- Applied the approved SAVZIX storefront prototype direction to the production home page and shared header, with functional search and category navigation preserved.
- Centred the desktop category navigation without changing its mobile scrolling behaviour.
- Reworked the landing page into product-free offers, shopping-by-need, and trusted-brand sections until catalogue import.
- Scoped and authenticated read-only Supabase MCP access to the new `savzix.com` project.
- Removed category dropdown activation when hovering the desktop search field.
- Set the product-free landing-page order to New arrivals, Offers, Bestsellers, Popular departments, and Trusted brands.
- Locked the approved landing-page composition; do not alter it without explicit direction.
- Applied the core catalogue schema to the new SAVZIX Supabase project and added the first live Aveeno Baby product with an uploaded public image.
- Removed the visible white source-image canvas from product cards without changing the original branded image asset.
- Removed automatically selected product images from category banners; products remain in the listing grid only.
- Updated the Keepa packager to retain original assets alongside WebP upload candidates and document the background-cleanup review step.
- Removed the size and per-litre labels from the product-detail price row.
- Uploaded all 1,095 prepared WebP product images and imported the 250-product Keepa launch catalogue into Supabase as hidden Draft records with source-derived descriptions.
- Seeded the Supabase category taxonomy, assigned all 250 imported products to categories, and applied 202 EAN-verified prices from `data/Real Price.xlsx` while preserving 48 unresolved products for review.
- Activated the 202 verified-price products with stock set to 10 each; retained the 48 unresolved-price products as zero-stock Drafts.
- Replaced the shop's Load more button with accessible numbered product pages and Previous/Next navigation.
- Added four live catalogue product cards to each landing-page product section: New arrivals, Offers, and Bestsellers.
- Ran a Stripe test-mode checkout smoke test and identified the missing Supabase order/reservation schema before any payment or order was created.
- Removed the duplicate standalone logo above the customer sign-in and account-creation form.
- Applied Supabase migrations 004 and 005 with service-role-only RPC permissions, then verified the complete Stripe sandbox payment, expired-session stock release, successful stock decrement, cart clearing, confirmation page, and account order history.
- Replaced the landing-page Trusted brands text row with a centered, responsive row of verified brand logos.
- Removed the redundant Trusted brands heading from the logo-only landing-page section.
- Generated and applied a premium five-product catalogue hero image without altering the approved hero copy block.
- Reduced and right-aligned the premium hero artwork on tablet and desktop without changing hero copy or layout.
- Re-composed the premium hero source image to balance copy space, product placement, right-edge clearance, and product contrast.
- Fixed the Supabase auth-lock `AbortError` overlay on the storefront while preserving customer and admin navigation state.
- Generated, documented, and applied seven premium category hero images using five matching catalogue products per category.
- Fitted all category artwork inside the shared hero banner and separated mobile copy from the complete image.
- Simplified all category heroes with category-specific headings, one catalogue-level product count, clearer subcategory links, and a shorter desktop layout.
- Removed the visible desktop boundary between each contained category image and its hero background with a responsive edge blend.
- Replaced the storefront header's text-only brand name with the supplied transparent SAVZIX wordmark and verified its desktop and mobile presentation.
- Made the storefront responsive across mobile and tablet, including the shared header/search, home and category heroes, catalogue filters/grid, and product-detail layout.
- Removed the remaining dollar-formatted prices and confirmed storefront, order, and Stripe checkout currency handling is consistently GBP.

## This Week

- Add legal pages
- Add SEO basics
- Improve homepage

## Backlog

- Reviews system
- Email flows
- Upsells
