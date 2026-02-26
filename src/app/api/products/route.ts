import { NextResponse } from "next/server";
import { addProduct, getAllProducts, getPublicProducts } from "@/lib/products-store";
import { isAdmin } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NewProductInput } from "@/types/product";

export const dynamic = "force-dynamic";

async function assertAdminAccess() {
  const supabase = await createServerSupabaseClient();
  const hasAdminAccess = await isAdmin(supabase);

  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "public") {
    const products = await getPublicProducts();
    return NextResponse.json({ products });
  }

  const forbiddenResponse = await assertAdminAccess();
  if (forbiddenResponse) {
    return forbiddenResponse;
  }

  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const forbiddenResponse = await assertAdminAccess();
    if (forbiddenResponse) {
      return forbiddenResponse;
    }

    const body = (await request.json()) as Partial<NewProductInput>;

    const product = await addProduct({
      name: body.name ?? "",
      description: body.description ?? "",
      category: body.category ?? "General",
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      status: body.status,
      image: body.image,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
