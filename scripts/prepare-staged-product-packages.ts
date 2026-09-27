import { promises as fs } from "node:fs";
import path from "node:path";

type Mode = "dry-run" | "run";

type StagingRow = {
  keepa_row: number;
  status: string;
  hold_reasons: string[];
  asin: string;
  brand: string;
  source_title: string;
  seo_title: string;
  slug: string;
  ean_gtin_upc: string[];
  keepa_category_tree: string;
  proposed_category_path: string;
  keepa_description_source: string;
  supplier_sheet_description: string;
  supplier_cost_gbp: number | null;
  supplier_rsp_gbp: number | null;
  proposed_website_price_gbp: number | null;
  ingredients_source: string;
  primary_image_source_url: string;
  keepa_source_url: string;
  amazon_source_url: string;
};

type DuplicateRow = {
  keepa_row: number;
};

type CliOptions = {
  mode: Mode;
  stagingPath: string;
  duplicatePath: string;
  sourceRoot: string;
  reportPath: string;
  concurrency: number;
};

type PackageResult = {
  keepa_row: number;
  slug: string;
  category_slug: string;
  package_path: string;
  result: "prepared" | "skipped_existing" | "failed";
  source_image_path: string | null;
  error: string | null;
};

type PreparationReport = {
  mode: Mode;
  staging_path: string;
  duplicate_path: string;
  source_root: string;
  candidate_count: number;
  prepared: number;
  skipped_existing: number;
  failed: number;
  created_at: string;
  results: PackageResult[];
};

const DEFAULT_BATCH_DIRECTORY = path.join(
  process.cwd(),
  "data",
  "import-reports",
  "keepa-pricecheck-2026-09-27",
);

function normalizePath(input: string): string {
  return path.isAbsolute(input) ? path.normalize(input) : path.join(process.cwd(), input);
}

function parsePositiveInt(value: string, field: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  let mode: Mode | null = null;
  const options: Omit<CliOptions, "mode"> = {
    stagingPath: path.join(DEFAULT_BATCH_DIRECTORY, "staging-catalogue.json"),
    duplicatePath: path.join(DEFAULT_BATCH_DIRECTORY, "duplicate-report.json"),
    sourceRoot: path.join(process.cwd(), "data", "product images"),
    reportPath: path.join(DEFAULT_BATCH_DIRECTORY, "local-package-preparation-report.json"),
    concurrency: 4,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--dry-run":
        if (mode === "run") throw new Error("Use either --dry-run or --run, not both.");
        mode = "dry-run";
        break;
      case "--run":
        if (mode === "dry-run") throw new Error("Use either --dry-run or --run, not both.");
        mode = "run";
        break;
      case "--staging":
        index += 1;
        options.stagingPath = normalizePath(argv[index] ?? "");
        break;
      case "--duplicates":
        index += 1;
        options.duplicatePath = normalizePath(argv[index] ?? "");
        break;
      case "--source":
        index += 1;
        options.sourceRoot = normalizePath(argv[index] ?? "");
        break;
      case "--report":
        index += 1;
        options.reportPath = normalizePath(argv[index] ?? "");
        break;
      case "--concurrency":
        index += 1;
        options.concurrency = parsePositiveInt(argv[index] ?? "", "concurrency");
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!mode) throw new Error("Specify exactly one mode: --dry-run or --run.");
  return { mode, ...options };
}

function categorySlug(categoryPath: string): string {
  return categoryPath.split("/")[0]?.trim() || "uncategorised";
}

function detailFile(row: StagingRow): string {
  return [
    "Preparation status: Hold — local source package only; not approved for Supabase upload.",
    `Keepa row: ${row.keepa_row}`,
    `Proposed final title: ${row.seo_title}`,
    `Brand: ${row.brand}`,
    `EAN/GTIN/UPC: ${row.ean_gtin_upc.join(", ") || "Not supplied"}`,
    `ASIN: ${row.asin || "Not supplied"}`,
    `Supplier cost GBP: ${row.supplier_cost_gbp?.toFixed(2) ?? "Unresolved"}`,
    `Proposed website price GBP: ${row.proposed_website_price_gbp?.toFixed(2) ?? "Unresolved"}`,
    `Supplier RSP GBP: ${row.supplier_rsp_gbp?.toFixed(2) ?? "Unresolved"}`,
    `Category path: ${row.proposed_category_path}`,
    `Slug: ${row.slug}`,
    "",
    "Source product title:",
    row.source_title || "Not supplied",
    "",
    "Source description (requires manufacturer or packaging verification before use):",
    row.keepa_description_source || row.supplier_sheet_description || "Not supplied",
    "",
    "Source ingredients (requires manufacturer or packaging verification before use):",
    row.ingredients_source || "Not supplied",
    "",
    "Source references:",
    `Keepa: ${row.keepa_source_url || "Not supplied"}`,
    `Amazon listing: ${row.amazon_source_url || "Not supplied"}`,
    `Original image: ${row.primary_image_source_url || "Not supplied"}`,
    "",
    "Required before final package approval:",
    "- Verify product identity, size, pack count, description and ingredients against manufacturer information or packaging.",
    "- Review the retained original image and create 01.webp only when it needs presentation cleanup.",
    "- Compare any edited image with the original to confirm packaging, labels, logos, colours and variant remain exact.",
    "- Recheck the catalogue for duplicate conflicts immediately before any Supabase write.",
    "",
    "Staging hold reasons:",
    ...row.hold_reasons.map((reason) => `- ${reason}`),
    "",
  ].join("\n");
}

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
}

async function downloadSourceImage(url: string, destinationPath: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "follow" });
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (!response.ok || !contentType.startsWith("image/")) {
      throw new Error(`Image fetch failed with HTTP ${response.status} (${contentType || "unknown type"}).`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(destinationPath, bytes, { flag: "wx" });
  } finally {
    clearTimeout(timeout);
  }
}

async function processRow(row: StagingRow, options: CliOptions): Promise<PackageResult> {
  const category = categorySlug(row.proposed_category_path);
  const packagePath = path.join(options.sourceRoot, category, row.slug);
  const detailPath = path.join(packagePath, "product-details.txt");

  try {
    await fs.access(detailPath);
    return {
      keepa_row: row.keepa_row,
      slug: row.slug,
      category_slug: category,
      package_path: packagePath,
      result: "skipped_existing",
      source_image_path: null,
      error: null,
    };
  } catch {
    // A missing package is expected for a new candidate.
  }

  if (options.mode === "dry-run") {
    return {
      keepa_row: row.keepa_row,
      slug: row.slug,
      category_slug: category,
      package_path: packagePath,
      result: "prepared",
      source_image_path: row.primary_image_source_url ? path.join(packagePath, `${row.slug}-source-original.jpg`) : null,
      error: row.primary_image_source_url ? null : "No source image URL.",
    };
  }

  try {
    if (!row.primary_image_source_url) throw new Error("No source image URL.");

    await fs.mkdir(packagePath, { recursive: true });

    const response = await fetch(row.primary_image_source_url, { method: "HEAD", redirect: "follow" });
    const extension = extensionFromContentType(response.headers.get("content-type")?.toLowerCase() ?? "");
    const sourceImagePath = path.join(packagePath, `${row.slug}-source-original.${extension}`);
    await downloadSourceImage(row.primary_image_source_url, sourceImagePath);
    await fs.writeFile(detailPath, detailFile(row), { flag: "wx" });

    return {
      keepa_row: row.keepa_row,
      slug: row.slug,
      category_slug: category,
      package_path: packagePath,
      result: "prepared",
      source_image_path: sourceImagePath,
      error: null,
    };
  } catch (error) {
    return {
      keepa_row: row.keepa_row,
      slug: row.slug,
      category_slug: category,
      package_path: packagePath,
      result: "failed",
      source_image_path: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await mapper(items[current]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const staging = JSON.parse(await fs.readFile(options.stagingPath, "utf8")) as StagingRow[];
  const duplicates = JSON.parse(await fs.readFile(options.duplicatePath, "utf8")) as DuplicateRow[];
  const duplicateRows = new Set(duplicates.map((row) => row.keepa_row));
  const candidates = staging.filter((row) => {
    return !duplicateRows.has(row.keepa_row)
      && row.supplier_cost_gbp !== null
      && row.proposed_website_price_gbp !== null
      && row.slug
      && row.proposed_category_path;
  });
  const results = await mapConcurrent(candidates, options.concurrency, (row) => processRow(row, options));
  const report: PreparationReport = {
    mode: options.mode,
    staging_path: options.stagingPath,
    duplicate_path: options.duplicatePath,
    source_root: options.sourceRoot,
    candidate_count: candidates.length,
    prepared: results.filter((result) => result.result === "prepared" && !result.error).length,
    skipped_existing: results.filter((result) => result.result === "skipped_existing").length,
    failed: results.filter((result) => result.result === "failed" || Boolean(result.error)).length,
    created_at: new Date().toISOString(),
    results,
  };

  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });
  await fs.writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
