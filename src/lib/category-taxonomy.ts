import "server-only";

import { normalizeTaxonomyPath } from "@/config/category-taxonomy";
import { mapProductRow } from "@/lib/products-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  CategoryAssignment,
  CategoryOption,
} from "@/types/category-taxonomy";
import type { Product } from "@/types/product";
import type { Database } from "@/types/supabase";

type ProductCategoryRow = Database["public"]["Tables"]["product_categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

function isMissingTaxonomyTableError(error: {
  code?: string | null;
  message?: string | null;
} | null) {
  // ADDED: missing taxonomy tables should degrade gracefully to route/classifier fallback.
  if (!error) {
    return false;
  }

  return (
    error.code === "PGRST205" ||
    error.message?.includes("public.categories") === true ||
    error.message?.includes("public.product_categories") === true
  );
}

async function getCategoryDescendants(path: string) {
  const normalizedPath = normalizeTaxonomyPath(path);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .or(`path.eq.${normalizedPath},path.like.${normalizedPath}/%`)
    .order("path", { ascending: true });

  if (error) {
    if (isMissingTaxonomyTableError(error)) {
      return [];
    }

    throw new Error("Failed to load category descendants.");
  }

  return data ?? [];
}

export async function getActiveCategoryByPath(path: string) {
  const normalizedPath = normalizeTaxonomyPath(path);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("path", normalizedPath)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if (isMissingTaxonomyTableError(error)) {
      return null;
    }

    throw new Error("Failed to load category.");
  }

  return data;
}

export async function getProductsForCategoryPath(path: string) {
  const category = await getActiveCategoryByPath(path);

  if (!category) {
    return {
      category: null,
      products: [] as Product[],
    };
  }

  const descendantCategories = await getCategoryDescendants(category.path ?? "");
  const categoryIds = descendantCategories.map((descendant) => descendant.id);

  if (categoryIds.length === 0) {
    return {
      category,
      products: [] as Product[],
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: links, error: linksError } = await supabase
    .from("product_categories")
    .select("product_id, category_id, is_primary, sort_order, created_at")
    .in("category_id", categoryIds)
    .order("sort_order", { ascending: true });

  if (linksError) {
    if (isMissingTaxonomyTableError(linksError)) {
      return {
        category,
        products: [] as Product[],
      };
    }

    throw new Error("Failed to load category product links.");
  }

  const productIds = [...new Set((links ?? []).map((link) => link.product_id))];

  if (productIds.length === 0) {
    return {
      category,
      products: [] as Product[],
    };
  }

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("status", "Active")
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (productsError) {
    throw new Error("Failed to load category products.");
  }

  return {
    category,
    products: ((productRows ?? []) as ProductRow[]).map(mapProductRow),
  };
}

export async function getActiveCategoryOptions(): Promise<CategoryOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, path, parent_id, sort_order")
    .eq("is_active", true)
    .order("path", { ascending: true });

  if (error) {
    if (isMissingTaxonomyTableError(error)) {
      return [];
    }

    throw new Error("Failed to load categories.");
  }

  return data ?? [];
}

export async function getProductCategoryAssignments(
  productId: string,
): Promise<CategoryAssignment[]> {
  const supabase = await createServerSupabaseClient();
  const { data: links, error: linksError } = await supabase
    .from("product_categories")
    .select("product_id, category_id, is_primary, sort_order, created_at")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (linksError) {
    if (isMissingTaxonomyTableError(linksError)) {
      return [];
    }

    throw new Error("Failed to load product category assignments.");
  }

  const categoryIds = (links ?? []).map((link) => link.category_id);

  if (categoryIds.length === 0) {
    return [];
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, path")
    .in("id", categoryIds);

  if (categoriesError) {
    if (isMissingTaxonomyTableError(categoriesError)) {
      return [];
    }

    throw new Error("Failed to load assigned categories.");
  }

  const categoryById = new Map(
    (categories ?? [])
      .filter((category) => Boolean(category.path))
      .map((category) => [category.id, category]),
  );

  return ((links ?? []) as ProductCategoryRow[])
    .map((link) => {
      const category = categoryById.get(link.category_id);

      if (!category?.path) {
        return null;
      }

      return {
        categoryId: category.id,
        name: category.name,
        path: category.path,
        isPrimary: link.is_primary,
        sortOrder: link.sort_order,
      };
    })
    .filter((assignment): assignment is CategoryAssignment => assignment !== null)
    .sort((left, right) => {
      if (left.isPrimary !== right.isPrimary) {
        return left.isPrimary ? -1 : 1;
      }

      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.path.localeCompare(right.path);
    });
}
