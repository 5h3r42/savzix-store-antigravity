/*
 * What changed:
 * - src/app/shop/page.tsx
 * - src/components/shop/ShopLayout.tsx
 * - src/components/shop/ShopFilters.tsx
 * - src/components/shop/ShopSort.tsx
 * - src/components/shop/ProductGrid.tsx
 * - src/components/shop/ProductCard.tsx
 * - src/components/shop/types.ts
 * - src/config/category-route-filters.ts
 * - src/lib/formatPrice.ts
 * - src/lib/normalizeText.ts
 */

import { ShopLayout } from "@/components/shop/ShopLayout"; // CHANGED: switch /shop to the new retail PLP layout.
import { isKnownCategoryPath, normalizeCategoryPath } from "@/config/categories";
import type { ShopProduct } from "@/components/shop/types"; // ADDED: shared /shop product type.
import { normalizeText } from "@/lib/normalizeText"; // ADDED: normalize odd source strings for clean UI.
import { getPublicProducts } from "@/lib/products-store";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

type ProductWithOptionalFields = Product & {
  title?: string | null;
  brand?: string | null;
  image_url?: string | null;
  availability?: number | string | boolean | null;
  created_at?: string | null;
};

function safeText(value: unknown, fallback: string) {
  // ADDED: normalized text with fallback for missing/malformed fields.
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : fallback;
}

function safePrice(value: unknown) {
  // ADDED: parse numeric/string prices safely for GBP formatting downstream.
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function resolveInStock(value: unknown) {
  // ADDED: default in-stock unless the source explicitly provides 0/false.
  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed !== 0 : true;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return true;
}

function mapToShopProduct(product: Product): ShopProduct {
  // ADDED: normalize existing product source for the retail /shop UI.
  const source = product as ProductWithOptionalFields;
  const imageFromSource =
    (typeof source.image === "string" && source.image.trim().length > 0
      ? source.image.trim()
      : null) ??
    (typeof source.image_url === "string" && source.image_url.trim().length > 0
      ? source.image_url.trim()
      : null) ??
    "/product_bottle.png";

  return {
    id: safeText(source.id, `product-${Date.now()}`),
    slug: safeText(source.slug, safeText(source.id, "product")),
    title: safeText(source.name ?? source.title, "Untitled product"),
    brand: safeText(source.brand, "Brand"),
    category: safeText(source.category, "Other"),
    price: safePrice(source.price),
    inStock: resolveInStock(source.stock ?? source.availability),
    imageUrl: imageFromSource,
    createdAt: safeText(source.createdAt ?? source.created_at, new Date(0).toISOString()),
  };
}

type ShopPageProps = {
  searchParams: Promise<{
    categoryPath?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoryPath } = await searchParams;
  const normalizedCategoryPath = categoryPath ? normalizeCategoryPath(categoryPath) : null;
  const routeCategoryPath =
    normalizedCategoryPath && isKnownCategoryPath(normalizedCategoryPath)
      ? normalizedCategoryPath
      : null; // ADDED: only accept known category paths from config.

  const products = await getPublicProducts(); // CHANGED: keep existing data source.
  const normalizedProducts = products.map(mapToShopProduct); // ADDED: UI-safe product shape.

  return (
    <ShopLayout
      products={normalizedProducts}
      routeCategoryPath={routeCategoryPath}
    />
  ); // CHANGED: render retail PLP shell + route-aware filters.
}
