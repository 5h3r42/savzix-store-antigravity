import { createClient } from "@supabase/supabase-js";
import { taxonomyTree, type TaxonomyNode } from "../src/config/category-taxonomy";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "../src/lib/supabase/env";
import type { Database } from "../src/types/supabase";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

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

async function upsertCategory(
  parentId: string | null,
  node: TaxonomyNode,
) {
  const supabase = createAdminClient();
  const existingQuery = supabase
    .from("categories")
    .select("id")
    .eq("slug", node.slug)
    .limit(1);

  const { data: existing, error: existingError } = parentId
    ? await existingQuery.eq("parent_id", parentId).maybeSingle()
    : await existingQuery.is("parent_id", null).maybeSingle();

  if (existingError) {
    throw new Error(`Failed to look up category "${node.slug}": ${existingError.message}`);
  }

  const payload: CategoryInsert = {
    name: node.name,
    slug: node.slug,
    parent_id: parentId,
    description: node.description,
    is_active: true,
    sort_order: node.sortOrder ?? 0,
  };

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Failed to update category "${node.slug}": ${updateError.message}`);
    }

    return existing.id;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("categories")
    .insert(payload)
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to insert category "${node.slug}": ${insertError?.message}`);
  }

  return inserted.id;
}

async function seedNodes(nodes: TaxonomyNode[], parentId: string | null = null) {
  const orderedNodes = nodes
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  for (const node of orderedNodes) {
    const categoryId = await upsertCategory(parentId, node);
    await seedNodes(node.children ?? [], categoryId);
  }
}

async function main() {
  await seedNodes(taxonomyTree);
  console.log("Category taxonomy seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
