import { NextResponse } from "next/server";
import { addProduct, getAllProducts, getPublicProducts } from "@/lib/products-store";
import type { NewProductInput } from "@/types/product";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  const products =
    scope === "public" ? await getPublicProducts() : await getAllProducts();

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
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
