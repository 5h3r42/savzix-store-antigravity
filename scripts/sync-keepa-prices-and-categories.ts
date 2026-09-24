import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { flatTaxonomy } from "../src/config/category-taxonomy";
import {
  classifyProductTaxonomy,
  expandCategoryPaths,
} from "../src/lib/product-taxonomy-classifier";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "../src/lib/supabase/env";
import type { Database } from "../src/types/supabase";

type Mode = "dry-run" | "run";
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductCategoryInsert = Database["public"]["Tables"]["product_categories"]["Insert"];

type CliOptions = {
  mode: Mode;
  keepaPath: string;
  pricePath: string;
  manifestPath: string;
  summaryPath: string;
  activatePriced: boolean;
  stock: number;
};

type KeepaRow = Record<string, unknown> & {
  Title?: unknown;
  Brand?: unknown;
  Manufacturer?: unknown;
  ean?: unknown;
  "Product Codes: GTIN"?: unknown;
  "Product Codes: UPC"?: unknown;
};

type PriceRow = Record<string, unknown> & {
  DESCRIPTION?: unknown;
  "Real Price"?: unknown;
  BARCODE?: unknown;
};

type ManifestRow = {
  category_slug: string;
  folder_name: string;
  folder_slug: string;
};

type PriceResolution = {
  price: number | null;
  method: "ean" | "title" | null;
  reason: "matched" | "no-match" | "invalid-price" | "conflicting-prices";
  codes: string[];
  candidatePrices: number[];
};

const CATEGORY_LABELS: Record<string, string> = {
  "beauty-skincare": "Beauty & Skincare",
  fragrance: "Fragrance",
  toiletries: "Toiletries",
  "health-wellness": "Health & Wellness",
  "gift-sets": "Gift Sets",
  "suncare-travel": "Suncare & Travel",
  electrical: "Electrical",
};

const DEFAULT_KEEPA = path.join(
  process.cwd(),
  "data",
  "KeepaExport-2026-09-20-savzix-store.xlsx",
);
const DEFAULT_PRICES = path.join(process.cwd(), "data", "Real Price.xlsx");
const DEFAULT_MANIFEST = path.join(process.cwd(), "data", "image-import-manifest.json");
const DEFAULT_SUMMARY = path.join(
  process.cwd(),
  "data",
  "keepa-price-category-sync-summary.json",
);

function normalizePath(input: string) {
  return path.isAbsolute(input) ? path.normalize(input) : path.join(process.cwd(), input);
}

function parseArgs(argv: string[]): CliOptions {
  let mode: Mode | null = null;
  const options: Omit<CliOptions, "mode"> = {
    keepaPath: DEFAULT_KEEPA,
    pricePath: DEFAULT_PRICES,
    manifestPath: DEFAULT_MANIFEST,
    summaryPath: DEFAULT_SUMMARY,
    activatePriced: false,
    stock: 0,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run" || argument === "--run") {
      const nextMode: Mode = argument === "--run" ? "run" : "dry-run";
      if (mode && mode !== nextMode) {
        throw new Error("Use either --dry-run or --run, not both.");
      }
      mode = nextMode;
      continue;
    }

    if (argument === "--activate-priced") {
      options.activatePriced = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}.`);
    }

    switch (argument) {
      case "--keepa-xlsx":
        options.keepaPath = normalizePath(value);
        break;
      case "--price-xlsx":
        options.pricePath = normalizePath(value);
        break;
      case "--manifest":
        options.manifestPath = normalizePath(value);
        break;
      case "--summary-path":
        options.summaryPath = normalizePath(value);
        break;
      case "--stock": {
        const stock = Number(value);
        if (!Number.isInteger(stock) || stock <= 0) {
          throw new Error("stock must be a positive integer.");
        }
        options.stock = stock;
        break;
      }
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
    index += 1;
  }

  if (!mode) {
    throw new Error("Specify exactly one mode: --dry-run or --run.");
  }

  if (options.activatePriced && options.stock <= 0) {
    throw new Error("--activate-priced requires a positive --stock value.");
  }

  return { mode, ...options };
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizeTitle(value: unknown) {
  return text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function barcodeTokens(value: unknown) {
  return text(value)
    .split(/[^0-9]+/)
    .map((token) => token.replace(/^0+(?=\d)/, ""))
    .filter((token) => token.length >= 7);
}

function keepaCodes(row: KeepaRow) {
  return [
    ...barcodeTokens(row.ean),
    ...barcodeTokens(row["Product Codes: GTIN"]),
    ...barcodeTokens(row["Product Codes: UPC"]),
  ].filter((code, index, all) => all.indexOf(code) === index);
}

function parsePrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number.parseFloat(text(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function loadRows<T>(filePath: string): T[] {
  const workbook = XLSX.readFile(filePath);
  return workbook.SheetNames.flatMap((sheetName) =>
    XLSX.utils.sheet_to_json<T>(workbook.Sheets[sheetName], { defval: null, raw: true }),
  );
}

function indexPriceRows(rows: PriceRow[]) {
  const byBarcode = new Map<string, PriceRow[]>();
  const byTitle = new Map<string, PriceRow[]>();

  for (const row of rows) {
    for (const code of barcodeTokens(row.BARCODE)) {
      const matches = byBarcode.get(code) ?? [];
      matches.push(row);
      byBarcode.set(code, matches);
    }

    const title = normalizeTitle(row.DESCRIPTION);
    if (title) {
      const matches = byTitle.get(title) ?? [];
      matches.push(row);
      byTitle.set(title, matches);
    }
  }

  return { byBarcode, byTitle };
}

function resolvePrice(
  row: KeepaRow,
  indexes: ReturnType<typeof indexPriceRows>,
): PriceResolution {
  const codes = keepaCodes(row);
  let method: PriceResolution["method"] = "ean";
  let candidates = codes.flatMap((code) => indexes.byBarcode.get(code) ?? []);
  candidates = [...new Set(candidates)];

  if (candidates.length === 0) {
    method = "title";
    candidates = indexes.byTitle.get(normalizeTitle(row.Title)) ?? [];
  }

  if (candidates.length === 0) {
    return { price: null, method: null, reason: "no-match", codes, candidatePrices: [] };
  }

  const candidatePrices = [
    ...new Set(
      candidates
        .map((candidate) => parsePrice(candidate["Real Price"]))
        .filter((price): price is number => price !== null && price > 0)
        .map((price) => Number(price.toFixed(2))),
    ),
  ];

  if (candidatePrices.length === 0) {
    return { price: null, method, reason: "invalid-price", codes, candidatePrices };
  }

  if (candidatePrices.length > 1) {
    return { price: null, method, reason: "conflicting-prices", codes, candidatePrices };
  }

  return {
    price: candidatePrices[0],
    method,
    reason: "matched",
    codes,
    candidatePrices,
  };
}

function chunks<T>(items: T[], size: number) {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await Promise.all([
    fs.access(options.keepaPath),
    fs.access(options.pricePath),
    fs.access(options.manifestPath),
  ]);

  const manifest = JSON.parse(await fs.readFile(options.manifestPath, "utf8")) as ManifestRow[];
  const packages = new Map(
    manifest.map((row) => [
      row.folder_slug,
      {
        folderName: row.folder_name,
        folderSlug: row.folder_slug,
        categorySlug: row.category_slug,
      },
    ]),
  );
  const keepaRows = loadRows<KeepaRow>(options.keepaPath);
  const keepaByTitle = new Map(
    keepaRows.map((row) => [text(row.Title), row] as const).filter(([title]) => Boolean(title)),
  );
  const priceIndexes = indexPriceRows(loadRows<PriceRow>(options.pricePath));

  const { url } = getSupabaseEnv();
  const supabase = createClient<Database>(url, getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: productRows, error: productsError }, { data: categoryRows, error: categoriesError }] =
    await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("categories").select("id, name, path").eq("is_active", true),
    ]);

  if (productsError) throw new Error(`Failed to load products: ${productsError.message}`);
  if (categoriesError) throw new Error(`Failed to load categories: ${categoriesError.message}`);

  const existingBySlug = new Map((productRows ?? []).map((product) => [product.slug, product]));
  const categoryByPath = new Map(
    (categoryRows ?? [])
      .filter((category) => Boolean(category.path))
      .map((category) => [category.path as string, category]),
  );
  const taxonomyNameByPath = new Map(flatTaxonomy.map((node) => [node.path, node.name]));
  const updatedProducts: ProductRow[] = [];
  const assignments: ProductCategoryInsert[] = [];
  const unresolved: Array<{
    slug: string;
    title: string;
    reason: PriceResolution["reason"];
    codes: string[];
    candidatePrices: number[];
  }> = [];
  const primaryCategoryCounts = new Map<string, number>();
  let matchedByEan = 0;
  let matchedByTitle = 0;

  for (const packageRow of [...packages.values()].sort((left, right) =>
    left.folderSlug.localeCompare(right.folderSlug),
  )) {
    const keepaRow = keepaByTitle.get(packageRow.folderName);
    if (!keepaRow) throw new Error(`Missing Keepa row for ${packageRow.folderName}.`);

    const product = existingBySlug.get(packageRow.folderSlug);
    if (!product) throw new Error(`Missing Supabase product for ${packageRow.folderSlug}.`);

    const packageCategory = CATEGORY_LABELS[packageRow.categorySlug];
    if (!packageCategory) throw new Error(`Unsupported package category: ${packageRow.categorySlug}.`);

    const classification = classifyProductTaxonomy({
      name: product.name,
      brand: product.brand,
      category: packageCategory,
    });
    const primaryPath = classification.primaryPath ?? packageRow.categorySlug;
    const categoryPaths = classification.primaryPath
      ? expandCategoryPaths(classification)
      : [packageRow.categorySlug];
    const topLevelPath = primaryPath.split("/")[0];
    const topLevelName = taxonomyNameByPath.get(topLevelPath) ?? packageCategory;
    const price = resolvePrice(keepaRow, priceIndexes);

    if (price.price !== null) {
      if (price.method === "ean") matchedByEan += 1;
      if (price.method === "title") matchedByTitle += 1;
    } else {
      unresolved.push({
        slug: product.slug,
        title: product.name,
        reason: price.reason,
        codes: price.codes,
        candidatePrices: price.candidatePrices,
      });
    }

    updatedProducts.push({
      ...product,
      category: topLevelName,
      price: price.price ?? product.price,
      stock: options.activatePriced ? (price.price !== null ? options.stock : 0) : product.stock,
      status: options.activatePriced
        ? price.price !== null
          ? "Active"
          : "Draft"
        : product.status,
    });
    primaryCategoryCounts.set(primaryPath, (primaryCategoryCounts.get(primaryPath) ?? 0) + 1);

    for (const [index, categoryPath] of categoryPaths.entries()) {
      const category = categoryByPath.get(categoryPath);
      if (!category) {
        throw new Error(`Missing seeded category path "${categoryPath}" for ${product.name}.`);
      }
      assignments.push({
        product_id: product.id,
        category_id: category.id,
        is_primary: index === 0,
        sort_order: index,
      });
    }
  }

  if (updatedProducts.length !== packages.size) {
    throw new Error(`Prepared ${updatedProducts.length} products for ${packages.size} packages.`);
  }

  const productIds = updatedProducts.map((product) => product.id);
  if (options.mode === "run") {
    for (const batch of chunks(updatedProducts, 100)) {
      const { error } = await supabase.from("products").upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`Failed to update products: ${error.message}`);
    }

    for (const batch of chunks(productIds, 100)) {
      const { error } = await supabase.from("product_categories").delete().in("product_id", batch);
      if (error) throw new Error(`Failed to clear category assignments: ${error.message}`);
    }

    for (const batch of chunks(assignments, 500)) {
      const { error } = await supabase.from("product_categories").insert(batch);
      if (error) throw new Error(`Failed to add category assignments: ${error.message}`);
    }
  }

  let verifiedProducts = 0;
  let verifiedAssignments = 0;
  if (options.mode === "run") {
    for (const batch of chunks(productIds, 100)) {
      const [{ count: productCount, error: productError }, { count: assignmentCount, error: assignmentError }] =
        await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }).in("id", batch),
          supabase
            .from("product_categories")
            .select("product_id", { count: "exact", head: true })
            .in("product_id", batch),
        ]);
      if (productError) throw new Error(`Failed to verify products: ${productError.message}`);
      if (assignmentError) {
        throw new Error(`Failed to verify category assignments: ${assignmentError.message}`);
      }
      verifiedProducts += productCount ?? 0;
      verifiedAssignments += assignmentCount ?? 0;
    }
  }

  const summary = {
    mode: options.mode,
    keepa_xlsx: options.keepaPath,
    price_xlsx: options.pricePath,
    products_prepared: updatedProducts.length,
    prices_matched: matchedByEan + matchedByTitle,
    matched_by_ean: matchedByEan,
    matched_by_exact_title: matchedByTitle,
    prices_unresolved: unresolved.length,
    unresolved_by_reason: Object.fromEntries(
      ["no-match", "invalid-price", "conflicting-prices"].map((reason) => [
        reason,
        unresolved.filter((row) => row.reason === reason).length,
      ]),
    ),
    category_assignments_prepared: assignments.length,
    primary_category_counts: Object.fromEntries(
      [...primaryCategoryCounts.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
    products_verified: verifiedProducts,
    category_assignments_verified: verifiedAssignments,
    products_remain_draft: updatedProducts.filter((product) => product.status === "Draft").length,
    products_activated: updatedProducts.filter((product) => product.status === "Active").length,
    activated_stock_per_product: options.activatePriced ? options.stock : null,
    unresolved_products: unresolved,
    created_at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(options.summaryPath), { recursive: true });
  await fs.writeFile(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unknown price/category sync error.");
  process.exit(1);
});
