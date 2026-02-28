import "server-only";

import { getTaxonomyNodeByPath } from "@/config/category-taxonomy";
import type { ShopProduct } from "@/components/shop/types";
import {
  classifyProductTaxonomy,
  expandCategoryPaths,
} from "@/lib/product-taxonomy-classifier";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/normalizeText";
import type { Product } from "@/types/product";
import type { Database } from "@/types/supabase";

type ProductWithOptionalFields = Product & {
  title?: string | null;
  brand?: string | null;
  image_url?: string | null;
  availability?: number | string | boolean | null;
  created_at?: string | null;
};

type ProductCategoryLinkRow = Pick<
  Database["public"]["Tables"]["product_categories"]["Row"],
  "product_id" | "category_id"
>;

type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name" | "path"
>;

type ShopProductCategoryMeta = {
  primaryCategoryPath: string | null;
  primaryCategoryName: string | null;
  topLevelCategoryPath: string | null;
  topLevelCategoryName: string | null;
};

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : fallback;
}

function safePrice(value: unknown) {
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

async function loadProductCategoryMeta(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, ShopProductCategoryMeta>();
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: linkRows, error: linksError } = await supabase
      .from("product_categories")
      .select("product_id, category_id")
      .eq("is_primary", true)
      .in("product_id", productIds);

    if (linksError) {
      console.error("Failed to load product category links.", linksError);
      return new Map<string, ShopProductCategoryMeta>();
    }

    const links = (linkRows ?? []) as ProductCategoryLinkRow[];
    const categoryIds = [...new Set(links.map((row) => row.category_id))];

    if (categoryIds.length === 0) {
      return new Map<string, ShopProductCategoryMeta>();
    }

    const { data: categoryRows, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, path")
      .in("id", categoryIds)
      .eq("is_active", true);

    if (categoriesError) {
      console.error("Failed to load category metadata for shop products.", categoriesError);
      return new Map<string, ShopProductCategoryMeta>();
    }

    const categoryById = new Map(
      ((categoryRows ?? []) as CategoryRow[]).map((row) => [row.id, row] as const),
    );

    return new Map(
      links.map((link) => {
        const category = categoryById.get(link.category_id);
        const primaryCategoryPath = category?.path ?? null;
        const primaryCategoryNode = primaryCategoryPath
          ? getTaxonomyNodeByPath(primaryCategoryPath)
          : null;
        const topLevelPath = primaryCategoryPath?.split("/")[0] ?? null;
        const topLevelNode = topLevelPath ? getTaxonomyNodeByPath(topLevelPath) : null;

        return [
          link.product_id,
          {
            primaryCategoryPath,
            primaryCategoryName: primaryCategoryNode?.name ?? category?.name ?? null,
            topLevelCategoryPath: topLevelNode?.path ?? topLevelPath,
            topLevelCategoryName: topLevelNode?.name ?? primaryCategoryNode?.name ?? category?.name ?? null,
          },
        ] as const;
      }),
    );
  } catch (error) {
    console.error("Failed to attach taxonomy metadata to shop products.", error);
    return new Map<string, ShopProductCategoryMeta>();
  }
}

export function mapToShopProduct(
  product: Product,
  categoryMeta?: ShopProductCategoryMeta | null,
): ShopProduct {
  const source = product as ProductWithOptionalFields;
  const imageFromSource =
    (typeof source.image === "string" && source.image.trim().length > 0
      ? source.image.trim()
      : null) ??
    (typeof source.image_url === "string" && source.image_url.trim().length > 0
      ? source.image_url.trim()
      : null) ??
    "/product_bottle.png";
  const fallbackClassification = classifyProductTaxonomy({
    name: safeText(source.name ?? source.title, "Untitled product"),
    brand: safeText(source.brand, ""),
    category: safeText(source.category, ""),
  });
  const fallbackPrimaryCategoryPath = fallbackClassification.primaryPath;
  const fallbackPrimaryCategoryNode = fallbackPrimaryCategoryPath
    ? getTaxonomyNodeByPath(fallbackPrimaryCategoryPath)
    : null;
  const fallbackTopLevelPath = fallbackPrimaryCategoryPath
    ? expandCategoryPaths(fallbackClassification)[1] ?? fallbackPrimaryCategoryPath.split("/")[0]
    : null;
  const fallbackTopLevelNode = fallbackTopLevelPath
    ? getTaxonomyNodeByPath(fallbackTopLevelPath)
    : null;

  return {
    id: safeText(source.id, `product-${Date.now()}`),
    slug: safeText(source.slug, safeText(source.id, "product")),
    title: safeText(source.name ?? source.title, "Untitled product"),
    brand: safeText(source.brand, "Brand"),
    category:
      categoryMeta?.topLevelCategoryName ??
      fallbackTopLevelNode?.name ??
      safeText(source.category, "Other"),
    subcategory:
      categoryMeta?.primaryCategoryName ?? fallbackPrimaryCategoryNode?.name ?? null,
    primaryCategoryPath:
      categoryMeta?.primaryCategoryPath ?? fallbackPrimaryCategoryPath ?? null,
    primaryCategoryName:
      categoryMeta?.primaryCategoryName ?? fallbackPrimaryCategoryNode?.name ?? null,
    topLevelCategoryPath:
      categoryMeta?.topLevelCategoryPath ?? fallbackTopLevelNode?.path ?? fallbackTopLevelPath ?? null,
    topLevelCategoryName:
      categoryMeta?.topLevelCategoryName ?? fallbackTopLevelNode?.name ?? null,
    price: safePrice(source.price),
    inStock: resolveInStock(source.stock ?? source.availability),
    imageUrl: imageFromSource,
    createdAt: safeText(source.createdAt ?? source.created_at, new Date(0).toISOString()),
  };
}

export async function mapProductsToShopProducts(products: Product[]) {
  const categoryMetaByProductId = await loadProductCategoryMeta(
    [...new Set(products.map((product) => product.id))],
  );

  return products.map((product) =>
    mapToShopProduct(product, categoryMetaByProductId.get(product.id) ?? null),
  );
}
