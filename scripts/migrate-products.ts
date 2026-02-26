import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type ProductStatus = "Active" | "Draft" | "Archived";

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  createdAt: string;
};

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function assertValidProduct(raw: unknown, index: number): RawProduct {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid product at index ${index}: expected object.`);
  }

  const candidate = raw as Partial<RawProduct>;
  const requiredStringFields: Array<keyof RawProduct> = [
    "id",
    "slug",
    "name",
    "description",
    "category",
    "image",
    "createdAt",
  ];

  requiredStringFields.forEach((field) => {
    if (typeof candidate[field] !== "string" || !candidate[field]?.trim()) {
      throw new Error(`Invalid product at index ${index}: missing ${field}.`);
    }
  });

  if (typeof candidate.price !== "number" || Number.isNaN(candidate.price)) {
    throw new Error(`Invalid product at index ${index}: missing price.`);
  }

  if (typeof candidate.stock !== "number" || Number.isNaN(candidate.stock)) {
    throw new Error(`Invalid product at index ${index}: missing stock.`);
  }

  if (
    candidate.status !== "Active" &&
    candidate.status !== "Draft" &&
    candidate.status !== "Archived"
  ) {
    throw new Error(`Invalid product at index ${index}: invalid status.`);
  }

  return candidate as RawProduct;
}

async function main() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const dataFile = path.join(process.cwd(), "data", "products.json");

  const rawContents = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(rawContents) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("data/products.json must contain an array of products.");
  }

  const products = parsed.map(assertValidProduct);

  if (products.length === 0) {
    console.log("No products found in data/products.json. Nothing to migrate.");
    return;
  }

  const slugSet = new Set<string>();

  for (const product of products) {
    if (slugSet.has(product.slug)) {
      throw new Error(`Duplicate slug in source data: ${product.slug}`);
    }

    slugSet.add(product.slug);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rows = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    price: Number(product.price.toFixed(2)),
    stock: Math.max(0, Math.trunc(product.stock)),
    status: product.status,
    image: product.image,
    created_at: product.createdAt,
  }));

  const { error: upsertError } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });

  if (upsertError) {
    throw new Error(`Failed to upsert products: ${upsertError.message}`);
  }

  const { data: migrated, error: verifyError } = await supabase
    .from("products")
    .select("slug")
    .in("slug", Array.from(slugSet));

  if (verifyError) {
    throw new Error(`Failed to verify migrated products: ${verifyError.message}`);
  }

  const migratedCount = migrated?.length ?? 0;

  if (migratedCount !== products.length) {
    throw new Error(
      `Migration validation failed. Expected ${products.length} rows, found ${migratedCount}.`,
    );
  }

  console.log(`Migrated ${migratedCount} products successfully.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown migration error";
  console.error(message);
  process.exit(1);
});
