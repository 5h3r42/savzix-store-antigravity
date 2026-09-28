import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CatalogueIssueSeverity = "blocker" | "warning";

type CatalogueIssue = {
  severity: CatalogueIssueSeverity;
  type:
    | "duplicate-barcode"
    | "duplicate-slug"
    | "duplicate-title"
    | "invalid-barcode"
    | "barcode-in-title"
    | "missing-required-field"
    | "invalid-price"
    | "invalid-stock"
    | "invalid-image-reference"
    | "short-description"
    | "missing-ingredients";
  productIds: string[];
  slugs: string[];
  detail: string;
};

type CatalogueAuditReport = {
  generatedAt: string;
  mode: "read-only";
  totals: {
    products: number;
    activeProducts: number;
    blockers: number;
    warnings: number;
    productsWithIngredients: number;
    activeProductsWithIngredients: number;
  };
  issues: CatalogueIssue[];
};

type CliOptions = {
  outputPath: string;
};

const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), "data", "catalogue-quality-report.json");
const REQUIRED_ACTIVE_FIELDS: Array<keyof Pick<ProductRow, "slug" | "name" | "description" | "brand" | "category" | "image">> = [
  "slug",
  "name",
  "description",
  "brand",
  "category",
  "image",
];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalisePath(value: string): string {
  return path.isAbsolute(value) ? path.normalize(value) : path.join(process.cwd(), value);
}

function parseArgs(args: string[]): CliOptions {
  let outputPath = DEFAULT_OUTPUT_PATH;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument !== "--output") {
      throw new Error(`Unknown option: ${argument}.`);
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("Missing value for --output.");
    }

    outputPath = normalisePath(value);
    index += 1;
  }

  return { outputPath };
}

function normaliseText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hasContent(value: string | null): boolean {
  return Boolean(value?.trim());
}

function isValidGtin(value: string): boolean {
  if (!/^(?:\d{8}|\d{12,14})$/.test(value)) return false;

  const values = [...value].map(Number);
  const expectedCheckDigit = values.pop();
  if (expectedCheckDigit === undefined) return false;

  const weightedSum = values
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);

  return (10 - (weightedSum % 10)) % 10 === expectedCheckDigit;
}

function isImageReference(value: string): boolean {
  return /^(?:https?:\/\/|\/)/i.test(value.trim());
}

function getProductKeys(products: ProductRow[]): { productIds: string[]; slugs: string[] } {
  return {
    productIds: products.map((product) => product.id),
    slugs: products.map((product) => product.slug),
  };
}

function findDuplicateIssues(
  products: ProductRow[],
  valueForProduct: (product: ProductRow) => string[],
  type: Extract<CatalogueIssue["type"], "duplicate-barcode" | "duplicate-slug" | "duplicate-title">,
  label: string,
  severity: CatalogueIssueSeverity,
): CatalogueIssue[] {
  const productsByValue = new Map<string, ProductRow[]>();

  for (const product of products) {
    for (const value of [...new Set(valueForProduct(product))]) {
      if (!value) continue;
      productsByValue.set(value, [...(productsByValue.get(value) ?? []), product]);
    }
  }

  return [...productsByValue.entries()]
    .filter(([, matchingProducts]) => matchingProducts.length > 1)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([value, matchingProducts]) => ({
      severity,
      type,
      ...getProductKeys(matchingProducts),
      detail: `${label} "${value}" is shared by ${matchingProducts.length} products.`,
    }));
}

function auditProducts(products: ProductRow[]): CatalogueAuditReport {
  const issues: CatalogueIssue[] = [];
  const activeProducts = products.filter((product) => product.status === "Active");

  issues.push(
    ...findDuplicateIssues(products, (product) => [product.slug.trim().toLowerCase()], "duplicate-slug", "Slug", "blocker"),
    ...findDuplicateIssues(
      products,
      (product) => [normaliseText(product.name)],
      "duplicate-title",
      "Normalised title",
      "warning",
    ),
    ...findDuplicateIssues(
      products,
      (product) => product.ean_barcodes.map((barcode) => barcode.replace(/\D/g, "")),
      "duplicate-barcode",
      "Barcode",
      "blocker",
    ),
  );

  for (const product of activeProducts) {
    const productKeys = getProductKeys([product]);

    for (const field of REQUIRED_ACTIVE_FIELDS) {
      if (!hasContent(product[field])) {
        issues.push({
          severity: "blocker",
          type: "missing-required-field",
          ...productKeys,
          detail: `Active product is missing ${field}.`,
        });
      }
    }

    if (product.ean_barcodes.length === 0) {
      issues.push({
        severity: "blocker",
        type: "missing-required-field",
        ...productKeys,
        detail: "Active product is missing an EAN, GTIN, or UPC barcode.",
      });
    }

    for (const barcode of product.ean_barcodes) {
      const digits = barcode.replace(/\D/g, "");
      if (!isValidGtin(digits)) {
        issues.push({
          severity: "warning",
          type: "invalid-barcode",
          ...productKeys,
          detail: `Barcode "${barcode}" is not a valid EAN, GTIN, or UPC check-digit value.`,
        });
      }
    }

    if (/\b\d{8}(?:\d{4}(?:\d{1,2})?)?\b/.test(product.name)) {
      issues.push({
        severity: "warning",
        type: "barcode-in-title",
        ...productKeys,
        detail: "Title contains an 8- to 14-digit number that may be a barcode and needs review.",
      });
    }

    if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      issues.push({
        severity: "blocker",
        type: "invalid-price",
        ...productKeys,
        detail: "Active product does not have a positive price.",
      });
    }

    if (!Number.isInteger(product.stock) || product.stock < 0) {
      issues.push({
        severity: "blocker",
        type: "invalid-stock",
        ...productKeys,
        detail: "Active product has an invalid stock quantity.",
      });
    }

    if (hasContent(product.image) && !isImageReference(product.image)) {
      issues.push({
        severity: "blocker",
        type: "invalid-image-reference",
        ...productKeys,
        detail: "Active product image is not an absolute URL or public site path.",
      });
    }

    if (normaliseText(product.description).length < 80) {
      issues.push({
        severity: "warning",
        type: "short-description",
        ...productKeys,
        detail: "Description is shorter than 80 characters and should be reviewed for product-detail quality.",
      });
    }

    if (!hasContent(product.ingredients)) {
      issues.push({
        severity: "warning",
        type: "missing-ingredients",
        ...productKeys,
        detail: "Ingredients are not recorded; verify whether the product type requires them before publishing.",
      });
    }
  }

  const blockers = issues.filter((issue) => issue.severity === "blocker").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read-only",
    totals: {
      products: products.length,
      activeProducts: activeProducts.length,
      blockers,
      warnings,
      productsWithIngredients: products.filter((product) => hasContent(product.ingredients)).length,
      activeProductsWithIngredients: activeProducts.filter((product) => hasContent(product.ingredients)).length,
    },
    issues,
  };
}

async function main() {
  loadEnvConfig(process.cwd());
  const { outputPath } = parseArgs(process.argv.slice(2));
  const supabase = createClient<Database>(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, description, brand, category, price, stock, reserved_quantity, status, image, ean_barcodes, ingredients, created_at, updated_at")
    .order("slug");

  if (error) throw new Error(`Failed to load catalogue products: ${error.message}`);

  const report = auditProducts(data ?? []);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        reportPath: outputPath,
        ...report.totals,
      },
      null,
      2,
    ),
  );
}

void main();
