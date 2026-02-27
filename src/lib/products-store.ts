import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, OrderStatus } from "@/types/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NewProductInput, Product, ProductStatus } from "@/types/product";

const ALLOWED_STATUS: ProductStatus[] = ["Active", "Draft", "Archived"];

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

type BestsellerOptions = {
  days?: number;
  statuses?: OrderStatus[];
  limit?: number;
};

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
    brand: row.brand ?? "Brand",
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
  const brand = input.brand?.trim() || "Brand";
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
      brand,
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

export async function getBestsellerProducts(
  options: BestsellerOptions = {},
): Promise<Product[]> {
  const days = options.days ?? 30;
  const limit = options.limit ?? 12;
  const statuses = options.statuses ?? ["Pending", "Confirmed"];

  const fallbackProducts = await getPublicProducts();
  const fallbackResult = fallbackProducts.slice(0, limit);

  try {
    const supabase = createAdminSupabaseClient();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: orderRows, error: orderError } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .in("status", statuses)
      .gte("created_at", cutoffDate);

    if (orderError) {
      console.error("Failed to load orders for bestseller ranking.", orderError);
      return fallbackResult;
    }

    const orders = (orderRows ?? []) as Pick<OrderRow, "id" | "status" | "created_at">[];
    if (orders.length === 0) {
      return fallbackResult;
    }

    const orderIds = orders.map((order) => order.id);
    const { data: orderItemRows, error: orderItemError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .in("order_id", orderIds);

    if (orderItemError) {
      console.error("Failed to load order items for bestseller ranking.", orderItemError);
      return fallbackResult;
    }

    const quantityByProductId = new Map<string, number>();
    for (const row of (orderItemRows ?? []) as Pick<OrderItemRow, "product_id" | "quantity">[]) {
      quantityByProductId.set(
        row.product_id,
        (quantityByProductId.get(row.product_id) ?? 0) + row.quantity,
      );
    }

    const rankedProductIds = [...quantityByProductId.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([productId]) => productId);

    if (rankedProductIds.length === 0) {
      return fallbackResult;
    }

    const { data: bestsellerRows, error: bestsellerError } = await supabase
      .from("products")
      .select("*")
      .in("id", rankedProductIds)
      .eq("status", "Active")
      .gt("stock", 0);

    if (bestsellerError) {
      console.error("Failed to load bestseller products.", bestsellerError);
      return fallbackResult;
    }

    const bestsellerById = new Map(
      ((bestsellerRows ?? []) as ProductRow[]).map((row) => [row.id, mapProduct(row)]),
    );
    const rankedProducts = rankedProductIds
      .map((productId) => bestsellerById.get(productId))
      .filter((product): product is Product => Boolean(product));

    if (rankedProducts.length >= limit) {
      return rankedProducts.slice(0, limit);
    }

    const seenProductIds = new Set(rankedProducts.map((product) => product.id));
    const fallbackTopUp = fallbackProducts.filter((product) => !seenProductIds.has(product.id));

    return [...rankedProducts, ...fallbackTopUp].slice(0, limit);
  } catch (error) {
    console.error("Failed to compute bestseller products.", error);
    return fallbackResult;
  }
}
