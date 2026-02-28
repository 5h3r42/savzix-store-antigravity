import { createClient } from "@supabase/supabase-js";
import {
  classifyProductTaxonomy,
  expandCategoryPaths,
} from "../src/lib/product-taxonomy-classifier";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "../src/lib/supabase/env";
import type { Database } from "../src/types/supabase";

type ProductCategoryInsert = Database["public"]["Tables"]["product_categories"]["Insert"];
type BackfillProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "brand" | "category" | "status" | "stock"
>;

function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function main() {
  const supabase = createAdminClient();

  const [
    { data: categories, error: categoriesError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase.from("categories").select("id, path"),
    supabase
      .from("products")
      .select("id, name, brand, category, status, stock")
      .eq("status", "Active")
      .gt("stock", 0),
  ]);

  if (categoriesError) {
    throw new Error(`Failed to load categories: ${categoriesError.message}`);
  }

  if (productsError) {
    throw new Error(`Failed to load products: ${productsError.message}`);
  }

  const categoryIdByPath = new Map(
    (categories ?? [])
      .filter((category) => Boolean(category.path))
      .map((category) => [category.path as string, category.id]),
  );

  const assignmentsByProductId = new Map<string, ProductCategoryInsert[]>();
  const unmatchedProducts: Array<{
    id: string;
    name: string;
    category: string;
  }> = [];
  let missingCategoryPathCount = 0;

  for (const product of (products ?? []) as BackfillProductRow[]) {
    const classification = classifyProductTaxonomy(product);

    if (!classification.primaryPath) {
      unmatchedProducts.push({
        id: product.id,
        name: product.name,
        category: product.category,
      });
      continue;
    }

    const categoryPaths = expandCategoryPaths(classification);
    const inserts: ProductCategoryInsert[] = [];

    for (const [index, categoryPath] of categoryPaths.entries()) {
      const categoryId = categoryIdByPath.get(categoryPath);

      if (!categoryId) {
        missingCategoryPathCount += 1;
        console.warn(
          `Skipping missing category path "${categoryPath}" for product ${product.id} (${product.name}).`,
        );
        continue;
      }

      inserts.push({
        product_id: product.id,
        category_id: categoryId,
        is_primary: index === 0,
        sort_order: index,
      });
    }

    if (inserts.length === 0) {
      unmatchedProducts.push({
        id: product.id,
        name: product.name,
        category: product.category,
      });
      continue;
    }

    assignmentsByProductId.set(product.id, inserts);
  }

  const productIds = [...assignmentsByProductId.keys()];

  if (productIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .in("product_id", productIds);

    if (deleteError) {
      throw new Error(`Failed to clear existing category assignments: ${deleteError.message}`);
    }
  }

  const allAssignments = [...assignmentsByProductId.values()].flat();

  if (allAssignments.length > 0) {
    const { error: insertError } = await supabase
      .from("product_categories")
      .insert(allAssignments);

    if (insertError) {
      throw new Error(`Failed to insert product category assignments: ${insertError.message}`);
    }
  }

  console.log("Product category backfill complete.");
  console.log(`Products considered: ${(products ?? []).length}`);
  console.log(`Products assigned: ${assignmentsByProductId.size}`);
  console.log(`Assignments inserted: ${allAssignments.length}`);
  console.log(`Products unmatched: ${unmatchedProducts.length}`);
  console.log(`Missing category paths during assignment: ${missingCategoryPathCount}`);

  if (unmatchedProducts.length > 0) {
    console.log("Sample unmatched products:");
    for (const product of unmatchedProducts.slice(0, 25)) {
      console.log(`- ${product.id} | ${product.category} | ${product.name}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
