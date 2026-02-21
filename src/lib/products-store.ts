import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { NewProductInput, Product, ProductStatus } from "@/types/product";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");

const ALLOWED_STATUS: ProductStatus[] = ["Active", "Draft", "Archived"];

async function ensureStoreFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readProductsFromDisk(): Promise<Product[]> {
  await ensureStoreFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

async function writeProductsToDisk(products: Product[]) {
  await ensureStoreFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getNextProductId(products: Product[]): string {
  const maxId = products.reduce((max, product) => {
    const numericPart = Number(product.id.replace(/\D/g, ""));
    if (Number.isNaN(numericPart)) {
      return max;
    }

    return Math.max(max, numericPart);
  }, 0);

  return `PROD-${String(maxId + 1).padStart(3, "0")}`;
}

function getUniqueSlug(baseSlug: string, products: Product[]): string {
  let candidate = baseSlug;
  let suffix = 2;

  while (products.some((product) => product.slug === candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function sortNewestFirst(products: Product[]) {
  return products
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await readProductsFromDisk();
  return sortNewestFirst(products);
}

export async function getPublicProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(
    (product) => product.status === "Active" && product.stock > 0,
  );
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug);
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

  const products = await readProductsFromDisk();
  const baseSlug = slugify(name) || `product-${Date.now()}`;

  const product: Product = {
    id: getNextProductId(products),
    slug: getUniqueSlug(baseSlug, products),
    name,
    description,
    category,
    price,
    stock,
    status,
    image,
    createdAt: new Date().toISOString(),
  };

  products.push(product);
  await writeProductsToDisk(products);

  return product;
}
