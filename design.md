# SAVZIX Design System

## Visual direction

SAVZIX is a clean, premium health-and-beauty retailer. The experience should be product-led, practical, calm, and trustworthy: closer to a polished UK high-street retailer than a luxury editorial boutique or a wholesale portal.

Use a bright white canvas, clear navy hierarchy, restrained blue interaction accents, and strong product photography. Do not use gold, warm ivory, decorative serif italics, large gradients, or excessive motion.

## Colour palette

| Token | Value | Use |
| --- | --- | --- |
| `--color-background` | `#FFFFFF` | Primary page and card background. |
| `--color-surface-subtle` | `#F4F6F8` | Product image stages, quiet sections, and disabled surfaces. |
| `--color-surface-muted` | `#EEF2F5` | Alternating page sections and subtle navigation areas. |
| `--color-primary` | `#102A43` | Primary buttons, headings, high-emphasis text, and the SAVZIX wordmark. |
| `--color-primary-hover` | `#0B1F33` | Hover and pressed state for primary controls. |
| `--color-accent` | `#2457A6` | Links, active category states, focus styling, and selected controls. |
| `--color-text-secondary` | `#52616B` | Supporting copy, product metadata, and helper text. |
| `--color-border` | `#D9E2EC` | Dividers, input borders, and card outlines. |
| `--color-success` | `#247A4B` | In-stock and successful action messages. |
| `--color-sale` | `#C53B30` | Sale prices, limited offers, and errors only. |

Gold is not part of the SAVZIX palette. Do not introduce gold as an accent, hover state, gradient, border, or typographic treatment.

## Typography

Use **Space Grotesk** throughout the storefront. It should read as modern retail typography: confident, legible, and efficient.

| Element | Weight | Guidance |
| --- | --- | --- |
| Main page heading | 700 | Navy, clear and concise; avoid oversized editorial display treatment. |
| Section heading | 700 | Navy with practical retail hierarchy. |
| Product title | 600–700 | Navy; limit card titles to two lines. |
| Navigation and category labels | 600 | 14–15px; normal or lightly expanded tracking only. |
| Body copy and metadata | 400–500 | 15–17px; use secondary text colour where appropriate. |
| Prices | 700 | Navy by default; sale prices use sale red. |
| Buttons | 600–700 | Sentence case or restrained title case; avoid wide all-caps letter spacing. |

Do not use thin (`300`) text, decorative serif text, or italic text for core retail navigation, product information, prices, and calls to action.

## Header and category navigation

The header must prioritise product discovery and fast shopping.

1. A compact utility strip communicates delivery, secure checkout, and returns.
2. The main header contains the SAVZIX logo, a prominent search field, account, wishlist, and cart actions.
3. A category rail appears underneath: Beauty, Skincare, Haircare, Fragrance, Toiletries, Wellness, Gift Sets, and Offers.

On mobile, categories use a touch-scrollable horizontal rail. On desktop, the rail remains visible and can reveal overflow with explicit arrow controls. Do not use an auto-scrolling or marquee category navigation: movement must be user-controlled and accessible.

## Components

### Buttons

- Primary: navy fill, white text, modest 8–12px rounded corners.
- Secondary: white fill, navy border and text.
- Hover: darken navy controls or use a clear blue border/text response; never use gold.
- Focus: visible blue focus ring using the accent colour.

### Product cards

- Use a pale grey (`#F4F6F8`) product-image stage with the item clearly centred.
- Use a white content area with navy title, readable brand/size metadata, price, availability, and a direct Add to basket action.
- Keep corners modestly rounded (12–16px maximum) and borders light.
- Use minimal shadow; the layout should feel orderly rather than floating.
- Show badges only when useful: New, Offer, Best seller, or Low stock.

### Forms and filters

- White inputs with `#D9E2EC` borders and navy text.
- Use descriptive visible labels; placeholders must not be the only label.
- Show validation and stock information in plain language.

## Layout principles

- Use a wide retail grid with consistent alignment and generous, purposeful whitespace.
- Prioritise search, categories, products, offers, and brand discovery above narrative content.
- Home page sequence: trust strip, header/category rail, restrained campaign banner, category tiles, best sellers, offers, brands, new arrivals, delivery reassurance, footer.
- Avoid carousel overload, giant empty sections, and decorative content that delays product discovery.
- Use animation only to confirm an action or reveal a user-requested state; respect reduced-motion preferences.
