import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

type Mode = "dry-run" | "run";

type CliOptions = {
  mode: Mode;
  sourceRoot: string;
  reportPath: string;
  refreshFromReportPath: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  ean_barcodes: string[];
  ingredients: string | null;
};

type SourceIngredient = {
  sourcePath: string;
  ean: string;
  ingredients: string;
};

type ReportResult = {
  slug: string | null;
  productId: string | null;
  ean: string | null;
  sourcePaths: string[];
  result:
    | "prepared"
    | "updated"
    | "refreshed"
    | "skipped_existing_ingredients"
    | "skipped_source_conflict"
    | "skipped_catalogue_ean_conflict"
    | "unmatched_ean";
  reason: string | null;
};

type Report = {
  mode: Mode;
  sourceRoot: string;
  sourcePackageCount: number;
  packagesWithIngredients: number;
  packagesWithoutUsableEan: number;
  candidateEanCount: number;
  prepared: number;
  updated: number;
  skippedExistingIngredients: number;
  skippedSourceConflicts: number;
  skippedCatalogueEanConflicts: number;
  unmatchedEans: number;
  results: ReportResult[];
};

const DEFAULT_SOURCE_ROOT = path.join(process.cwd(), "data", "product images");
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  "data",
  "import-reports",
  "ingredient-backfill-2026-09-27.json",
);

const STOP_HEADINGS = new Set([
  "safety warning",
  "original image urls",
  "image download status",
  "product-information source",
  "image source",
  "image-rights status",
  "image review",
  "evidence reviewed",
  "source details",
  "category",
  "product attributes",
  "generated description",
  "verified description",
  "verified ingredients",
  "final title",
  "brand",
  "ean/gtin/upc",
  "asin",
  "supplier cost gbp",
  "proposed website price gbp",
  "category path",
  "slug",
]);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalizePath(value: string): string {
  return path.isAbsolute(value) ? path.normalize(value) : path.join(process.cwd(), value);
}

function parseArgs(args: string[]): CliOptions {
  let mode: Mode | null = null;
  let sourceRoot = DEFAULT_SOURCE_ROOT;
  let reportPath = DEFAULT_REPORT_PATH;
  let refreshFromReportPath: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      mode = mode === "run" ? null : "dry-run";
    } else if (arg === "--run") {
      mode = mode === "dry-run" ? null : "run";
    } else if (arg === "--source") {
      sourceRoot = normalizePath(args[++index] ?? "");
    } else if (arg === "--report") {
      reportPath = normalizePath(args[++index] ?? "");
    } else if (arg === "--refresh-from-report") {
      refreshFromReportPath = normalizePath(args[++index] ?? "");
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!mode) throw new Error("Use exactly one of --dry-run or --run.");
  return { mode, sourceRoot, reportPath, refreshFromReportPath };
}

function canonicalBarcode(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  if (digits.length === 14 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12) return `0${digits}`;
  return digits;
}

function extractBarcodes(document: string): string[] {
  const values = document
    .split(/\r?\n/)
    .filter((line) => /^EAN(?:\/GTIN\/UPC)?:/i.test(line.trim()))
    .flatMap((line) => line.slice(line.indexOf(":") + 1).match(/\d[\d\s-]{6,16}\d/g) ?? [])
    .map(canonicalBarcode)
    .filter((value): value is string => value !== null);

  return [...new Set(values)];
}

function extractField(document: string, label: string): string | null {
  const lines = document.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim().toLowerCase().startsWith(`${label.toLowerCase()}:`));
  if (startIndex < 0) return null;

  const firstLine = lines[startIndex].slice(lines[startIndex].indexOf(":") + 1).trim();
  const valueLines = firstLine ? [firstLine] : [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const heading = line.match(/^([^:]{2,80}):/);
    const normalizedHeading = heading?.[1].trim().toLowerCase() ?? "";
    const lowerLine = line.toLowerCase();
    if (
      (heading && STOP_HEADINGS.has(normalizedHeading)) ||
      normalizedHeading.startsWith("original image urls") ||
      normalizedHeading.startsWith("image download status") ||
      lowerLine === "original image urls" ||
      lowerLine === "image download status"
    ) {
      break;
    }
    if (line) valueLines.push(line);
  }

  const value = valueLines.join(" ").replace(/\s+/g, " ").trim();
  if (!value || /^(not supplied|n\/?a|unknown|see (the )?label)$/i.test(value)) return null;
  return value;
}

async function findPackageFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findPackageFiles(entryPath);
      return entry.isFile() && entry.name === "product-details.txt" ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

async function loadSourceIngredients(sourceRoot: string): Promise<{
  packageCount: number;
  withoutUsableEan: number;
  entries: SourceIngredient[];
}> {
  const files = await findPackageFiles(sourceRoot);
  const entries: SourceIngredient[] = [];
  let withoutUsableEan = 0;

  for (const filePath of files) {
    const document = await fs.readFile(filePath, "utf8");
    const ingredients = extractField(document, "Ingredients") ?? extractField(document, "Verified ingredients");
    if (!ingredients) continue;

    const eans = extractBarcodes(document);
    if (eans.length === 0) {
      withoutUsableEan += 1;
      continue;
    }

    for (const ean of eans) {
      entries.push({
        sourcePath: path.relative(process.cwd(), filePath),
        ean,
        ingredients,
      });
    }
  }

  return { packageCount: files.length, withoutUsableEan, entries };
}

async function writeReport(reportPath: string, report: Report): Promise<void> {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

async function loadRefreshProductIds(reportPath: string | null): Promise<Set<string>> {
  if (!reportPath) return new Set();

  const document = await fs.readFile(reportPath, "utf8");
  const parsed = JSON.parse(document) as { results?: Array<{ productId?: unknown; result?: unknown }> };
  const productIds = (parsed.results ?? [])
    .filter((result) => result.result === "updated" && typeof result.productId === "string")
    .map((result) => result.productId as string);

  return new Set(productIds);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = await loadSourceIngredients(options.sourceRoot);
  const refreshProductIds = await loadRefreshProductIds(options.refreshFromReportPath);
  const ingredientsByEan = new Map<string, SourceIngredient[]>();
  for (const entry of source.entries) {
    ingredientsByEan.set(entry.ean, [...(ingredientsByEan.get(entry.ean) ?? []), entry]);
  }

  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, ean_barcodes, ingredients");
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const productsByEan = new Map<string, ProductRow[]>();
  for (const product of (data ?? []) as ProductRow[]) {
    for (const ean of product.ean_barcodes ?? []) {
      productsByEan.set(ean, [...(productsByEan.get(ean) ?? []), product]);
    }
  }

  const results: ReportResult[] = [];
  const prepared = new Map<string, { product: ProductRow; ingredients: string; ean: string; sourcePaths: string[] }>();

  for (const [ean, sourceEntries] of ingredientsByEan) {
    const uniqueIngredients = [...new Set(sourceEntries.map((entry) => entry.ingredients))];
    const sourcePaths = sourceEntries.map((entry) => entry.sourcePath);
    if (uniqueIngredients.length !== 1) {
      results.push({ slug: null, productId: null, ean, sourcePaths, result: "skipped_source_conflict", reason: "Multiple local packages contain different ingredient lists for this EAN." });
      continue;
    }

    const products = productsByEan.get(ean) ?? [];
    if (products.length === 0) {
      results.push({ slug: null, productId: null, ean, sourcePaths, result: "unmatched_ean", reason: "No existing product has this EAN barcode." });
      continue;
    }
    if (products.length > 1) {
      results.push({ slug: null, productId: null, ean, sourcePaths, result: "skipped_catalogue_ean_conflict", reason: "Multiple catalogue products share this EAN barcode." });
      continue;
    }

    const product = products[0];
    const isRefreshCandidate = refreshProductIds.has(product.id);
    if (product.ingredients && !isRefreshCandidate) {
      results.push({ slug: product.slug, productId: product.id, ean, sourcePaths, result: "skipped_existing_ingredients", reason: "The product already has an ingredient list and was not overwritten." });
      continue;
    }
    prepared.set(product.id, { product, ingredients: uniqueIngredients[0], ean, sourcePaths });
  }

  for (const candidate of prepared.values()) {
    if (options.mode === "run") {
      let query = supabase
        .from("products")
        .update({ ingredients: candidate.ingredients })
        .eq("id", candidate.product.id);
      if (!refreshProductIds.has(candidate.product.id)) query = query.is("ingredients", null);
      const { error: updateError } = await query;
      if (updateError) throw new Error(`Failed to update ${candidate.product.slug}: ${updateError.message}`);
    }
    results.push({
      slug: candidate.product.slug,
      productId: candidate.product.id,
      ean: candidate.ean,
      sourcePaths: candidate.sourcePaths,
      result: options.mode === "run" ? (refreshProductIds.has(candidate.product.id) ? "refreshed" : "updated") : "prepared",
      reason: refreshProductIds.has(candidate.product.id) ? "Refreshed an ingredient list created by the specified earlier run report." : null,
    });
  }

  const report: Report = {
    mode: options.mode,
    sourceRoot: path.relative(process.cwd(), options.sourceRoot),
    sourcePackageCount: source.packageCount,
    packagesWithIngredients: new Set(source.entries.map((entry) => entry.sourcePath)).size,
    packagesWithoutUsableEan: source.withoutUsableEan,
    candidateEanCount: ingredientsByEan.size,
    prepared: options.mode === "dry-run" ? prepared.size : 0,
    updated: options.mode === "run" ? prepared.size : 0,
    skippedExistingIngredients: results.filter((result) => result.result === "skipped_existing_ingredients").length,
    skippedSourceConflicts: results.filter((result) => result.result === "skipped_source_conflict").length,
    skippedCatalogueEanConflicts: results.filter((result) => result.result === "skipped_catalogue_ean_conflict").length,
    unmatchedEans: results.filter((result) => result.result === "unmatched_ean").length,
    results: results.sort((left, right) => (left.slug ?? left.ean ?? "").localeCompare(right.slug ?? right.ean ?? "")),
  };
  await writeReport(options.reportPath, report);
  console.log(JSON.stringify(report, null, 2));
}

void main();
