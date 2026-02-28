import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateProductCategoriesBody = {
  primaryCategoryId?: string;
  secondaryCategoryIds?: string[];
};

async function assertAdminAccess() {
  const supabase = await createServerSupabaseClient();
  const hasAdminAccess = await isAdmin(supabase);

  if (!hasAdminAccess) {
    return {
      supabase,
      forbiddenResponse: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      ),
    };
  }

  return { supabase, forbiddenResponse: null };
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { supabase, forbiddenResponse } = await assertAdminAccess();

  if (forbiddenResponse) {
    return forbiddenResponse;
  }

  try {
    const body = (await request.json()) as UpdateProductCategoriesBody;
    const primaryCategoryId = body.primaryCategoryId?.trim() ?? "";
    const secondaryCategoryIds = Array.isArray(body.secondaryCategoryIds)
      ? body.secondaryCategoryIds.filter(
          (categoryId): categoryId is string =>
            typeof categoryId === "string" && categoryId.trim().length > 0,
        )
      : [];

    if (!primaryCategoryId) {
      return NextResponse.json(
        { error: "A primary category is required." },
        { status: 400 },
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      throw new Error("Failed to validate product.");
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const uniqueCategoryIds = [...new Set([primaryCategoryId, ...secondaryCategoryIds])];
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id")
      .in("id", uniqueCategoryIds)
      .eq("is_active", true);

    if (categoriesError) {
      throw new Error("Failed to validate categories.");
    }

    const validCategoryIds = new Set((categories ?? []).map((category) => category.id));

    if (!validCategoryIds.has(primaryCategoryId)) {
      return NextResponse.json(
        { error: "Primary category is invalid or inactive." },
        { status: 400 },
      );
    }

    const assignments = [
      {
        product_id: id,
        category_id: primaryCategoryId,
        is_primary: true,
        sort_order: 0,
      },
      ...secondaryCategoryIds
        .filter((categoryId) => categoryId !== primaryCategoryId && validCategoryIds.has(categoryId))
        .map((categoryId, index) => ({
          product_id: id,
          category_id: categoryId,
          is_primary: false,
          sort_order: index + 1,
        })),
    ];

    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", id);

    if (deleteError) {
      throw new Error("Failed to clear existing category assignments.");
    }

    const { error: insertError } = await supabase
      .from("product_categories")
      .insert(assignments);

    if (insertError) {
      throw new Error("Failed to save category assignments.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save category assignments.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
