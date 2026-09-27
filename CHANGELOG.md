# Changelog

## 2026-09-27

- Task: Balance shared footer spacing.
- Files changed: `src/components/layout/Footer.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Changed the desktop footer grid to intrinsic-width columns distributed with equal left and right edges. Content remains left-aligned and the responsive one- and two-column layouts are unchanged.
- Validation/tests: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Deploy storefront enhancements when requested.

## 2026-09-27

- Task: Add a quantity selector to product pages.
- Files changed: `src/components/products/AddToCartButton.tsx`, `src/context/CartContext.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added accessible minus and plus controls to the shared product-detail purchase action. The selector is capped at the product's available stock and passes the chosen quantity to the basket in one action.
- Validation/tests: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Deploy storefront enhancements when requested.

## 2026-09-27

- Task: Balance the tablet Frequently Bought Together product grid.
- Files changed: `src/components/products/FrequentlyBoughtTogether.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Removed the tablet three-column breakpoint so four recommendations render as a complete 2 × 2 grid on tablet and remain four columns at desktop.
- Validation/tests: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Deploy storefront enhancements when requested.

## 2026-09-27

- Task: Add Frequently Bought Together recommendations to product pages.
- Files changed: `src/app/products/[id]/page.tsx`, `src/components/products/FrequentlyBoughtTogether.tsx`, `src/lib/products-store.ts`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a reusable product-detail recommendation section that displays up to four different Active, in-stock products from the viewed item's category. It reuses the established product card, product links, price formatting, image treatment, and Add to basket control.
- Validation/tests: Local product-page HTML confirmed the section and four accompanying recommendation cards render below the product details without including the viewed item. `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Deploy this storefront enhancement when requested.

- Task: Remove verified barcode suffixes from catalogue product titles.
- Files changed: `scripts/remove-title-barcodes.ts`, `package.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; two Supabase `products.name` values.
- Summary: Added a repeatable, barcode-led title cleanup command that removes a trailing number only when it exactly matches that product's stored 8- to 14-digit EAN/GTIN/UPC value. Applied it to two Alfaparf shampoo titles. Slugs, stored EANs, prices, stock, status, descriptions, images, and category assignments were not changed.
- Validation/tests: Dry run scanned 502 products, found two matching title suffixes, and found no title conflicts. The live run updated and re-read both names successfully. `npm run lint -- scripts/remove-title-barcodes.ts` and `git diff --check` passed.
- Next task: Continue launch-priority catalogue and source-evidence review.

- Task: Deploy the latest SAVZIX product-detail and ingredient release to Hostinger.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Hostinger `savzix.com` deployment archive and Node.js build.
- Summary: Deployed the tracked source archive for commit `0389774` to the existing Hostinger Node.js application, using the established Next.js build settings. No Hostinger environment variables, Supabase configuration, Stripe configuration, or catalogue data was changed.
- Validation/tests: Hostinger installed dependencies and completed `next build --webpack`, including TypeScript and route generation. The Node.js restart was accepted. Live HTTPS checks returned HTTP 200 for `/` and the Collection Cosmetics Gloss Me Up product page; the latter rendered the new Ingredients section.
- Next task: Continue independent source verification for the remaining held ingredient and catalogue records.

- Task: Backfill product ingredients from local source packages.
- Files changed: `scripts/backfill-product-ingredients.ts`, `package.json`, `data/import-reports/ingredient-backfill-2026-09-27-*.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Supabase `products.ingredients` values.
- Summary: Added a repeatable, barcode-led ingredient backfill that reads only `Ingredients:` or `Verified ingredients:` fields from local `product-details.txt` records. It matches canonical EANs to one existing catalogue product, does not use title matching, preserves existing ingredient lists, and captures unmatched or conflicting evidence for review. Corrected the parser to stop before package image notes, then safely refreshed only the records created by the earlier run.
- Validation/tests: Initial and refresh dry runs each prepared 253 exact matches. The final run updated 253 records; Supabase now reports 254 products with ingredient lists. Local product-page inspection confirmed the cleaned Ingredients disclosure contains no source-image notes. `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Independently review the 65 unresolved source records before adding their ingredients, and deploy the product-detail presentation if a production deployment is requested.

- Task: Replace the duplicated product-information area with verified ingredients.
- Files changed: `supabase/migrations/007_add_product_ingredients.sql`, `src/types/supabase.ts`, `src/types/product.ts`, `src/lib/products-store.ts`, `src/app/products/[id]/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Supabase `products` schema and the Giorgio Armani Sì product record.
- Summary: Added a nullable `ingredients` field so existing products remain compatible while only source-verified ingredient lists render on the product page. Removed the lower generic Product Information heading and duplicate product description. The lower detail area now shows Ingredients when present, then the existing EAN barcode and delivery/returns information.
- Validation/tests: Applied and queried the production schema and Giorgio Armani Sì ingredient value. Local browser verification confirmed the product page shows the complete Ingredients disclosure and EAN without the generic duplicate section. `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Deploy this presentation change when a SAVZIX production deployment is requested; backfill ingredients only from verified manufacturer or packaging sources.

- Task: Extend the SAVZIX catalogue-import skill through live website verification.
- Files changed: `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/SKILL.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/references/savzix-pipeline.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added the controlled post-approval import route: scoped slug selection, dry runs, live duplicate check, image-first Supabase upload, product creation, EAN persistence, primary and parent taxonomy assignment, post-write database checks, and an HTTP 200 public product-page check. It also documents that this visibility check is not a deployment action.
- Validation/tests: `quick_validate.py` confirmed the skill is valid. `git diff --check` passed.
- Next task: Use the updated skill only for independently verified packages, starting with a dry run and explicit approval before each further import.

- Task: Add one approved, barcode-verified product to the live SAVZIX catalogue.
- Files changed: `data/import-reports/keepa-pricecheck-2026-09-27/approved-giorgio-armani-si-catalogue.xlsx`, `data/import-reports/keepa-pricecheck-2026-09-27/giorgio-armani-si-*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Supabase Storage, `products`, and `product_categories`.
- Summary: Uploaded the final 1200 × 1200 WebP and created Giorgio Armani Sì Eau de Parfum Spray 30ml (`PROD-502`) as an Active product. Set its user-approved exact barcode RSP of `55.00`, stock to `10`, EAN to `3605521816511`, and primary taxonomy path to `fragrance/womens-mass-market-fragrance` with Fragrance as a supporting parent link.
- Validation/tests: Image-import and catalogue-sync dry runs each prepared exactly one item with zero failures or missing primary images. Post-write Supabase verification confirmed title, price, stock, status, EAN, Supabase image URL, and both category links. `npm run lint`, `npx tsc --noEmit`, and `git diff --check` passed. The live product URL returned HTTP 200 and rendered the product, price, image, stock state, and EAN.
- Next task: Verify manufacturer or packaging evidence for the remaining 132 packages before authorising another import.

- Task: Finalise locally approved staging packshots for the Keepa/Pricecheck batch.
- Files changed: `scripts/finalize-approved-package-images.ts`, `package.json`, `data/product images/<category>/<slug>/01.webp`, `data/import-reports/keepa-pricecheck-2026-09-27/final-image-preparation-*.json`, `data/import-reports/keepa-pricecheck-2026-09-27/image-import-*-dry-run.*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a local-only final-image preparation command. Using the user's visual approval, it preserved every original image and created 132 1200 × 1200 lossless WebP primary images with a white canvas and consistent whitespace. No AI packaging changes, uploads, product records, or Supabase writes occurred.
- Validation/tests: `npx tsc --noEmit` passed. All 132 final images are square with white corners. The scoped product-image import dry run discovered 132 images and completed with 132 successes and zero failures.
- Next task: Verify product descriptions and ingredients against manufacturer or packaging evidence before authorising a Supabase import.

- Task: Set the supplier RSP as the standard SAVZIX website price.
- Files changed: `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/SKILL.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/references/savzix-pipeline.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`.
- Summary: Clarified that a supplier RSP from an exact EAN/GTIN/UPC match is the default website selling price. Supplier cost remains recorded for margin review and must not be used as the storefront price.
- Validation/tests: Policy update only; no package, price, product, or Supabase data was changed.
- Next task: Continue source-package review and final image preparation before any import.

- Task: Prepare local source packages for the staged Keepa/Pricecheck candidates.
- Files changed: `scripts/prepare-staged-product-packages.ts`, `package.json`, `data/product images/<category>/<slug>/*`, `data/import-reports/keepa-pricecheck-2026-09-27/local-package-preparation-*.json`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a repeatable local-only preparation command and used it to create 132 new category/slug folders. Each folder contains an original source image and `product-details.txt` with barcode, ASIN, supplier cost/RSP, proposed price, category, source description, ingredients and links. These records remain expressly on hold; no final numbered WebP files, image uploads, products, or Supabase writes were created.
- Validation/tests: Dry run reported 132 packages to prepare and one existing package to skip. Live local run completed with 132 prepared, one skipped and zero failed. Verified all 132 new folders contain both `product-details.txt` and a retained source image. `npx tsc --noEmit` and `git diff --check` passed.
- Next task: Verify product copy and ingredients against manufacturer/packaging evidence, then create final white-background WebP candidates only for sources that need cleanup.

- Task: Record the approved product-image cleanup standard.
- Files changed: `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/SKILL.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/references/savzix-pipeline.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: The catalogue workflow now requires an image-by-image decision: retain compliant source packshots unchanged and use the image-editing tool only when background/composition cleanup is needed. It permits removal of non-product scene elements, props, reflections, and shadows, provided the exact visible packaging is preserved and the edited candidate is compared with the original before local packaging.
- Validation/tests: Policy update only; no product package, image upload, or Supabase data was changed.
- Next task: Apply the updated review standard to the staged candidates and prepare local packages only after product-identity verification.

- Task: Begin local package preparation from the verified staging candidates.
- Files changed: `data/product images/fragrance/giorgio-armani-si-eau-de-parfum-spray-30ml/*`, `data/import-reports/keepa-pricecheck-2026-09-27/approved-*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Created one local-only package for Giorgio Armani Sì Eau de Parfum Spray 30ml after exact barcode, manufacturer product, ingredient, and primary-image checks. The final image is a visually reviewed, lossless 1200 × 1200 WebP with a pure white canvas; its original source is retained outside the upload candidate name. The image source has not received an independent reproduction-rights confirmation, so the package is intentionally excluded from upload.
- Validation/tests: Verified all four output-corner pixels are `#FFFFFF`, inspected the final WebP visually, and ran a one-package image-import dry run with one success and zero failures. No image was uploaded and no Supabase data changed.
- Next task: Continue source and packshot review for the remaining staged candidates, creating local packages only where every required check passes.

- Task: Exclude repeated identical rows from Keepa/Pricecheck staging.
- Files changed: `scripts/prepare-keepa-pricecheck-staging.ts`, `data/import-reports/keepa-pricecheck-2026-09-27/*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Corrected the internal duplicate guard to reject any repeated canonical barcode or generated slug within the incoming Keepa batch, including rows with identical titles. The refreshed reports now exclude all repeated candidate rows before package creation.
- Validation/tests: Re-ran staging against the supplied workbooks and the existing 501-product catalogue. The batch now reports 484 duplicate findings across 205 candidate rows and 133 automated candidates held for manual verification. `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.
- Next task: Verify source content and primary-image identity for the 133 held candidates before building local product packages.

- Task: Expand the SAVZIX catalogue-import skill for the Keepa/Pricecheck workflow.
- Files changed: `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/SKILL.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/references/savzix-pipeline.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/agents/openai.yaml`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a required preparation phase for supplier-workbook imports: canonical EAN/GTIN/UPC matching only, exact conflict reporting, explicit handling of missing ASIN/SKU schema support, source-evidence holds, and the staged-report approval gate. Documented the product-package layout, required `product-details.txt` evidence, and the correct catalogue-sync path when final SEO titles differ from raw Keepa titles.
- Validation/tests: `quick_validate.py` confirmed the updated skill is valid. Confirmed the image importer discovers only category/product folders containing `product-details.txt` and uploads only numbered WebP candidates that do not include `-original`. `git diff --check` passed.
- Next task: Review the Keepa/Pricecheck staging outputs and resolve only the safe candidates before creating local product packages.

- Task: Prepare the Keepa/Pricecheck catalogue staging batch.
- Files changed: `scripts/prepare-keepa-pricecheck-staging.ts`, `package.json`, `data/import-reports/keepa-pricecheck-2026-09-27/*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a read-only staging command for the supplied Keepa and Pricecheck exports. It matches canonical EAN/GTIN/UPC values only, reads the existing catalogue for exact barcode, slug, title and internal candidate conflicts, and writes the requested duplicate, unmatched-barcode, missing-data, image-validation, staging-catalogue and dry-run reports. It does not upload images, modify Supabase, reuse existing products, or use title matching for price approval. The staged records retain Keepa description/ingredient evidence and supplier cost/RSP values but remain on hold until manufacturer/packaging and exact image verification are complete.
- Validation/tests: The initial dry run read 384 Keepa rows, 288 supplier rows and 501 existing products; it found 301 barcode matches and 296 usable supplier RSP values. A later staging-guard correction superseded its preliminary 201-conflict/136-candidate figures; see the newer duplicate-guard entry above. `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed.
- Next task: Review the generated reports, resolve the held source/image/category issues, then explicitly authorise only the approved package upload and catalogue creation.

- Task: Fill the SAVZIX tablet product collections.
- Files changed: `src/app/page.tsx`, `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Increased each daily home collection to six selected products. Tablet now fills two complete rows of three cards, while the fifth and sixth cards are intentionally hidden at the desktop breakpoint to retain the existing four-card desktop presentation.
- Validation/tests: Verified the local New arrivals collection renders six product cards at tablet width. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Fix the SAVZIX tablet homepage layout.
- Files changed: `src/components/layout/Navbar.tsx`, `src/components/home/Hero.tsx`, `src/components/home/LandingCollections.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Moved the compact navigation and dedicated search presentation through the tablet breakpoint so category links no longer overflow horizontally. Reduced the tablet hero's copy and artwork height while retaining the approved slide imagery, copy, CTAs, dots, and carousel behaviour. Home product collections now render three readable cards per row at tablet width and four at desktop width.
- Validation/tests: Verified the 768 × 1024 local homepage in the in-app browser: compact menu, search, hero image/dots, trust strip, and a three-column New arrivals grid all render without horizontal overflow. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

## 2026-09-26

- Task: Add source-verified EAN barcode details to product pages.
- Files changed: `supabase/migrations/006_add_product_barcodes.sql`, `scripts/backfill-product-barcodes.ts`, `package.json`, `src/types/product.ts`, `src/types/supabase.ts`, `src/lib/products-store.ts`, `src/app/products/[id]/page.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added the additive `ean_barcodes` product field and a repeatable Keepa-source backfill workflow. Product Information now displays each product's verified EAN barcode or barcodes. The live backfill saved 730 EANs for 491 of 501 products; ten products without unambiguous source EAN data remain blank instead of receiving guessed values. Set the production build command to the existing Webpack fallback after Hostinger's Turbopack CSS-worker process failed before application compilation.
- Validation/tests: Ran the backfill dry run and live run; queried Supabase to confirm 501 products, 491 with stored EANs, 10 without, and 730 EANs total. Verified a local product-detail page displays EAN `5054805060450`. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Research and validate EAN source evidence for the remaining ten products before adding them.

- Task: Add the SAVZIX About Us page.
- Files changed: `src/app/about/page.tsx`, `src/components/layout/Footer.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a metadata-backed About Us page using the shared static-content layout. The page states that SAVZIX has traded since 2023 and explains its beauty, skincare, fragrance, toiletries, gift sets, health and wellness, electrical, and everyday-essentials range. Added an About Us link under Legal in the shared footer.
- Validation/tests: `npm run lint`, `npm run build`, and `git diff --check` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Rotate home-page product collections daily.
- Files changed: `src/app/page.tsx`, `src/lib/daily-collection-rotation.ts`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a reusable, Europe/London date-based selector. New Arrivals rotates within the newest twelve active products, Offers within the twelve lowest-priced active products, and Bestsellers within the top twelve sales-ranked or fallback products. Each collection displays four stable products all day, then advances its window the following day.
- Validation/tests: Confirmed same-day selections are identical and next-day selections advance with an inline selector check. Browser verification confirmed all three sections render four products. `npm run lint` and `npm run build` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Position home-page hero slide navigation within the image area.
- Files changed: `src/components/home/Hero.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Moved the accessible carousel dot controls from beneath the CTA group to the centred bottom edge of the full hero section, preserving their labels and selected state.
- Validation/tests: Visually verified the centred bottom placement on the local desktop hero. `npm run lint` and `npm run build` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Correct the rotating home-page hero image composition.
- Files changed: `src/components/home/Hero.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Restored the original Beauty & Skincare artwork to its contained, right-aligned presentation so product packaging no longer competes with heading, description, or CTAs. Kept wide category slides full-height to prevent top and bottom letterboxing, reduced the desktop hero height and title scale, strengthened the copy-side fade, and brought dot navigation closer to the CTAs.
- Validation/tests: Visually verified the original Beauty slide and full-height Gift Sets slide at 1440 × 900, including readable copy and unobstructed CTAs. `npm run lint` and `npm run build` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Rotate approved category artwork on the landing-page hero.
- Files changed: `src/components/home/Hero.tsx`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Replaced the one-image hero with the approved Beauty & Skincare, Fragrance, Gift Sets, and Toiletries category carousel. The original SAVZIX composition remains the Beauty & Skincare slide; category artwork fills the desktop hero without letterboxing. Each slide has matching copy, a direct category CTA, a restrained opacity transition, and accessible dot navigation. Automatic movement pauses while users hover or focus within the hero and is disabled for reduced-motion preferences.
- Validation/tests: Confirmed the local carousel rendered active slide content, the original SAVZIX composition, full-height category imagery without top or bottom bands, direct CTA URLs, and dot navigation in the browser. `npm run lint` and `npm run build` passed.
- Next task: Continue launch-priority SEO and production checkout verification.

- Task: Add a second duplicate-safe 250-product SAVZIX catalogue batch.
- Files changed: `scripts/import-product-images.ts`, `data/product images/`, `data/new-250-*`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Supabase Storage and catalogue data.
- Summary: Selected and packaged 250 new products from the Keepa source while excluding all prior package titles and 342 known identity codes. Uploaded 1,305 new WebP assets, created and verified 250 new product records, assigned 463 category links, and activated only the 190 products with barcode-verified GBP prices. Nine unsuitable primary image packages were replaced in the batch; 60 products without safe price evidence remain Draft with zero stock.
- Validation/tests: Image and catalogue dry runs prepared 250 products with no slug collisions; live image upload completed with 1,305 successes and zero failures; Supabase verification found all 250 records with 190 valid Active products and 60 valid Draft products; `npm run lint` and `npm run build` passed.
- Next task: Review the 60 new unresolved-price products before activation, then continue the existing 48-price review.

- Task: Create a reusable SAVZIX catalogue-import skill.
- Files changed: `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/SKILL.md`, `/Users/sherazkhalid/.codex/skills/savzix-catalogue-import/references/savzix-pipeline.md`, `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`.
- Summary: Added a discoverable operator skill for the full validated product workflow: final local packshot review, UK-English SEO titles and source-supported descriptions, GBP price controls, taxonomy assignment, Supabase image upload, dry-run-first catalogue writes, and post-import verification. The skill rejects uncertain images, identities, prices, and category assignments rather than inventing catalogue data.
- Validation/tests: Ran the skill creator validator successfully; reviewed the existing SAVZIX image-import, Keepa catalogue, price/category, and title-refresh scripts to align the instructions with the live workflow. No catalogue or Supabase data was changed.
- Next task: Use `$savzix-catalogue-import` to prepare a reviewed import batch, then run the dry-run workflow before authorising any Supabase write.

- Task: Deploy the current SAVZIX storefront to Hostinger production.
- Files changed: `PROJECT_STATUS.md`, `TASKS.md`, `CHANGELOG.md`; Hostinger deployment and environment configuration for `savzix.com`.
- Summary: Replaced the March 2026 Hostinger Node.js build with the validated current repository archive, then configured the production site, Supabase, admin, and Stripe environment variables. Diagnosed mismatched Supabase API keys from Hostinger runtime logs, corrected them, and confirmed the live homepage and shop now render the current storefront with active catalogue products.
- Validation/tests: `npm run lint` and `npm run build` passed locally; both Hostinger builds completed successfully; `https://savzix.com/` and `/shop` returned HTTP 200; browser inspection confirmed the approved current homepage, live product cards, GBP pricing, category navigation, footer company details, and no empty-catalogue state. No live payment was submitted. Hostinger reported 17 dependency advisories during installation, including one critical advisory, which remains for a separate dependency-review task.
- Next task: Verify production authentication and Stripe checkout handoff, then complete one explicitly authorised live payment and webhook confirmation before launch.

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
