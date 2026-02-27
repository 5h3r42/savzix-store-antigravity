import "server-only";

import type { Database } from "@/types/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NewProductInput, Product, ProductStatus } from "@/types/product";

const ALLOWED_STATUS: ProductStatus[] = ["Active", "Draft", "Archived"];

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    stock: row.stock,
    status: row.status,
    image: row.image,
    createdAt: row.created_at,
  };
}

async function getNextProductId() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("id");

  if (error) {
    throw new Error("Failed to generate product ID.");
  }

  const maxId = (data ?? []).reduce((max, product) => {
    const numericPart = Number(product.id.replace(/\D/g, ""));

    if (Number.isNaN(numericPart)) {
      return max;
    }

    return Math.max(max, numericPart);
  }, 0);

  return `PROD-${String(maxId + 1).padStart(3, "0")}`;
}

async function getUniqueSlug(baseSlug: string) {
  const supabase = await createServerSupabaseClient();

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error("Failed to generate product slug.");
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load products.");
  }

  return (data ?? []).map(mapProduct);
}

export async function getPublicProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "Active")
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load public products.", error);
      return [];
    }

    return (data ?? []).map(mapProduct);
  } catch (error) {
    console.error("Failed to load public products.", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load product details.");
  }

  return data ? mapProduct(data) : undefined;
}

export async function addProduct(input: NewProductInput): Promise<Product> {
  const name = input.name.trim();
  const description = input.description.trim();
  const category = input.category.trim() || "General";
  const image = input.image?.trim() || "/product_bottle.png";

  const price = Number(input.price);
  const stock = Number(input.stock);
  const status = ALLOWED_STATUS.includes(input.status ?? "Active")
    ? (input.status ?? "Active")
    : "Active";

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!description) {
    throw new Error("Product description is required.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a valid non-negative number.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Stock must be a valid non-negative integer.");
  }

  const baseSlug = slugify(name) || `product-${Date.now()}`;
  const [id, slug] = await Promise.all([getNextProductId(), getUniqueSlug(baseSlug)]);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      id,
      slug,
      name,
      description,
      category,
      price: Number(price.toFixed(2)),
      stock,
      status,
      image,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42501") {
      throw new Error("You do not have permission to create products.");
    }

    throw new Error("Failed to create product.");
  }

  return mapProduct(data);
}
