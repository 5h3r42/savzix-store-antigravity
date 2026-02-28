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
import { getProductsForCategoryPath } from "@/lib/category-taxonomy";
import { mapProductsToShopProducts } from "@/lib/shop-products";
import { getPublicProducts } from "@/lib/products-store";

export const dynamic = "force-dynamic";

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

  let products = await getPublicProducts(); // CHANGED: keep existing data source.
  let browseLabel: string | null = null;
  let description =
    "Discover premium beauty, fragrance, wellness, and daily essentials.";
  let fallbackRouteCategoryPath = routeCategoryPath;

  if (routeCategoryPath) {
    try {
      const categoryResult = await getProductsForCategoryPath(routeCategoryPath);

      if (categoryResult.category) {
        products = categoryResult.products;
        browseLabel = categoryResult.category.name;
        description =
          categoryResult.category.description?.trim() || description;
        fallbackRouteCategoryPath = null; // ADDED: route-scoped products now come from relational category assignments.
      }
    } catch (error) {
      console.error("Failed to load relational category products. Falling back to route filters.", error);
    }
  }

  const normalizedProducts = await mapProductsToShopProducts(products); // ADDED: attach primary taxonomy metadata to public shop products.

  return (
    <ShopLayout
      products={normalizedProducts}
      routeCategoryPath={fallbackRouteCategoryPath}
      description={description}
      browseLabel={browseLabel}
    />
  ); // CHANGED: render retail PLP shell + route-aware filters.
}
