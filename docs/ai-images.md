# AI Image Workflow

This repo has two image lanes:

- `public/` for approved production assets that ship with the site
- `output/imagegen/` for generated candidates that need review before promotion

Use AI for concepting and polished marketing imagery. Do not hotlink temporary OpenAI image URLs into the app.

## Asset conventions

Approved production assets belong here:

- `public/brand/` for logos, marks, favicons, and lockups
- `public/home/` for homepage hero images and section artwork
- `public/categories/` for category banners and collection artwork

Working files belong here:

- `output/imagegen/` for generated outputs
- `tmp/imagegen/` for temporary JSONL batch files

## One-time setup

Create the repo-local Python environment used by the OpenAI image CLI:

```bash
npm run image:setup
```

Add `OPENAI_API_KEY` to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

The image scripts auto-load `.env.local`, so you do not need to export the key separately for normal repo use.

## Core commands

Generate a single asset:

```bash
npm run image:gen -- --prompt-file docs/ai-prompts/home-hero.txt --size 1536x1024 --quality high --output-format webp --out-dir output/imagegen/home-hero --downscale-max-dim 1600
```

Edit an existing image:

```bash
npm run image:edit -- --image public/home/hero-base.png --prompt "Change only the background to a soft ivory studio gradient" --quality high --input-fidelity high --out-dir output/imagegen/home-hero-edits
```

Run a batch from JSONL:

```bash
npm run image:batch -- --input tmp/imagegen/home-variants.jsonl --out-dir output/imagegen/home-batch --concurrency 3
```

## Recommended workflow

1. Start with prompt templates in `docs/ai-prompts/`.
2. Generate candidates into `output/imagegen/...`.
3. Review the results and keep only the strongest options.
4. Move approved final assets into `public/home`, `public/categories`, or `public/brand`.
5. Reference the promoted asset in the Next.js component with `next/image`.

Example:

```tsx
import Image from "next/image";

<Image
  src="/home/hero-desktop.webp"
  alt="Savzix homepage hero"
  width={1600}
  height={1067}
  priority
  sizes="100vw"
/>
```

## Asset-specific guidance

### Hero images

- Prefer `1536x1024` or `1024x1536` depending on layout.
- Leave negative space for headline and CTA.
- Export as `webp`.
- Keep the final approved file in `public/home/`.

### Category banners

- Generate wide landscape compositions with restrained detail.
- Avoid text baked into the image.
- Keep the final approved file in `public/categories/`.

### Logo concepts

- Use AI for exploration only.
- Generate concept boards or marks in `output/imagegen/logo-concepts/`.
- Redraw the approved direction as a clean `SVG` before placing it in `public/brand/`.
- Do not ship a raster AI logo as the final brand asset unless it is strictly temporary.

## Prompting rules for this storefront

- Keep outputs premium, clean, and restrained.
- Avoid visible brand names, product labels, and watermarks.
- Avoid stock-photo clichés, cheap lens flare, oversaturated gradients, and clutter.
- For hero images, specify where text space should remain empty.
- For logos, ask for vector-friendly flat shapes and strong silhouettes.

## Suggested naming

- `public/home/hero-desktop.webp`
- `public/home/hero-mobile.webp`
- `public/categories/fragrance-banner.webp`
- `public/brand/logo.svg`
- `public/brand/logo-mark.svg`

## Notes

- The package scripts use the shared skill CLI at `$CODEX_HOME/skills/imagegen/scripts/image_gen.py`.
- This repo's `next.config.ts` already supports local `public/` assets cleanly, which is the right end state for hero images and branding.
