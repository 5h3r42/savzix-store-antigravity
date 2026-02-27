import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

type ProductStatus = "Active" | "Draft" | "Archived";
type Mode = "dry-run" | "run";

type CliOptions = {
  mode: Mode;
  xlsxPath: string;
  manifestPath: string;
  defaultStock: number;
  status: ProductStatus;
  summaryPath: string;
};

type ManifestRow = {
  folder_slug: string;
  sequence: string;
  public_url: string;
};

type CatalogRow = {
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  slug: string;
  image: string;
};

type ExistingProduct = {
  id: string;
  slug: string;
};

type SyncSummary = {
  mode: Mode;
  xlsx_path: string;
  manifest_path: string;
  rows_in_sheet: number;
  rows_parsed: number;
  rows_skipped_missing_name: number;
  rows_skipped_missing_price: number;
  rows_skipped_duplicate_slug: number;
  products_prepared: number;
  products_upserted: number;
  default_stock: number;
  status: ProductStatus;
  missing_primary_images: string[];
  sample_missing_primary_images: string[];
  created_at: string;
};

const DEFAULT_XLSX =
  "/Users/sherazkhalid/Documents/AITECHINNOVATIONS/savzix.com/Product_Description/ProductDescription.xlsx";
const DEFAULT_MANIFEST = path.join(process.cwd(), "data", "image-import-manifest.json");
const DEFAULT_SUMMARY = path.join(process.cwd(), "data", "catalog-sync-summary.json");

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizePath(input: string): string {
  if (path.isAbsolute(input)) {
    return path.normalize(input);
  }

  return path.join(process.cwd(), input);
}

function slugify(value: string): string {
  const normalizedInput = value
    .replace(/√©/g, "e")
    .replace(/√®/g, "e");

  const ascii = normalizedInput
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "");

  return ascii
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";
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
  let xlsxPath = DEFAULT_XLSX;
  let manifestPath = DEFAULT_MANIFEST;
  let defaultStock = 25;
  let status: ProductStatus = "Active";
  let summaryPath = DEFAULT_SUMMARY;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--dry-run":
        if (mode === "run") {
          throw new Error("Use either --dry-run or --run, not both.");
        }
        mode = "dry-run";
        break;
      case "--run":
        if (mode === "dry-run") {
          throw new Error("Use either --dry-run or --run, not both.");
        }
        mode = "run";
        break;
      case "--xlsx":
        index += 1;
        xlsxPath = normalizePath(argv[index] ?? "");
        break;
      case "--manifest":
        index += 1;
        manifestPath = normalizePath(argv[index] ?? "");
        break;
      case "--default-stock":
        index += 1;
        defaultStock = parsePositiveInt(argv[index] ?? "", "default-stock");
        break;
      case "--status": {
        index += 1;
        const value = (argv[index] ?? "") as ProductStatus;
        if (value !== "Active" && value !== "Draft" && value !== "Archived") {
          throw new Error("status must be one of: Active, Draft, Archived.");
        }
        status = value;
        break;
      }
      case "--summary-path":
        index += 1;
        summaryPath = normalizePath(argv[index] ?? "");
        break;
      default:
        if (!arg.startsWith("--")) {
          throw new Error(`Unexpected positional argument: ${arg}`);
        }

        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!mode) {
    throw new Error("Specify exactly one mode: --dry-run or --run.");
  }

  return {
    mode,
    xlsxPath,
    manifestPath,
    defaultStock,
    status,
    summaryPath,
  };
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 0 ? value : null;
  }

  const raw = toStringValue(value);
  if (!raw) {
    return null;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return null;
  }

  let cleaned = raw.replace(/[^\d.,-]/g, "");
  if (!cleaned) {
    return null;
  }

  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    cleaned = cleaned.replace(/,/g, ".");
  }

  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
    return null;
  }

  return parsed;
}

function detectPrice(row: unknown[]): number | null {
  const preferred = [11, 10, 12];

  for (const index of preferred) {
    const value = parsePrice(row[index]);
    if (value !== null) {
      return value;
    }
  }

  for (const value of row) {
    const asString = toStringValue(value);
    if (asString.includes("£") || asString.includes("¬£")) {
      const parsed = parsePrice(asString);
      if (parsed !== null) {
        return parsed;
      }
    }
  }

  return null;
}

function extractFolderSlug(row: unknown[], fallbackName: string): string {
  const rawFolder = toStringValue(row[9]);

  if (rawFolder) {
    const normalized = rawFolder.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) {
      return slugify(last);
    }
  }

  return slugify(fallbackName);
}

function pickDescription(row: unknown[], fallbackName: string): string {
  const candidates = [row[4], row[2], row[3], row[5]];

  for (const candidate of candidates) {
    const value = toStringValue(candidate);
    if (value) {
      return value;
    }
  }

  return `Premium ${fallbackName}`;
}

function pickBrand(row: unknown[], fallbackName: string): string {
  const explicitBrand = toStringValue(row[8]);
  if (explicitBrand) {
    return explicitBrand;
  }

  const firstWord = fallbackName.split(/\s+/).find(Boolean);
  return firstWord ?? "Brand";
}

function parseXlsxRows(xlsxPath: string): unknown[][] {
  const workbook = XLSX.readFile(xlsxPath);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Workbook has no sheets.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  });

  return rows.filter((row) => Array.isArray(row));
}

function loadPrimaryImageMap(manifestRows: ManifestRow[]): Map<string, string> {
  const byFolder = new Map<string, ManifestRow[]>();

  for (const row of manifestRows) {
    if (!row.folder_slug || !row.public_url || !row.sequence) {
      continue;
    }

    const existing = byFolder.get(row.folder_slug) ?? [];
    existing.push(row);
    byFolder.set(row.folder_slug, existing);
  }

  const primaryByFolder = new Map<string, string>();

  for (const [folderSlug, rows] of byFolder.entries()) {
    rows.sort((first, second) => {
      const a = Number.parseInt(first.sequence, 10);
      const b = Number.parseInt(second.sequence, 10);
      return a - b;
    });

    const primary = rows.find((row) => row.sequence === "01") ?? rows[0];
    primaryByFolder.set(folderSlug, primary.public_url);
  }

  return primaryByFolder;
}

function getNextProductIdGenerator(existingIds: string[]) {
  const used = new Set<number>();
  let max = 0;

  for (const id of existingIds) {
    const numeric = Number.parseInt(id.replace(/\D/g, ""), 10);
    if (!Number.isFinite(numeric)) {
      continue;
    }
    used.add(numeric);
    max = Math.max(max, numeric);
  }

  let cursor = max + 1;

  return () => {
    while (used.has(cursor)) {
      cursor += 1;
    }

    const value = cursor;
    used.add(value);
    cursor += 1;
    return `PROD-${String(value).padStart(3, "0")}`;
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const xlsxStat = await fs.stat(options.xlsxPath).catch(() => null);
  if (!xlsxStat?.isFile()) {
    throw new Error(`XLSX file not found: ${options.xlsxPath}`);
  }

  const manifestStat = await fs.stat(options.manifestPath).catch(() => null);
  if (!manifestStat?.isFile()) {
    throw new Error(`Manifest file not found: ${options.manifestPath}`);
  }

  const manifestRaw = await fs.readFile(options.manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw) as ManifestRow[];
  const primaryImageMap = loadPrimaryImageMap(manifest);

  const rows = parseXlsxRows(options.xlsxPath);
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: existingProducts, error: existingError } = await supabase
    .from("products")
    .select("id, slug");

  if (existingError) {
    throw new Error(`Failed to load existing products: ${existingError.message}`);
  }

  const existing = (existingProducts ?? []) as ExistingProduct[];
  const existingBySlug = new Map(existing.map((item) => [item.slug, item.id]));
  const nextId = getNextProductIdGenerator(existing.map((item) => item.id));

  const seenSlugs = new Set<string>();
  const catalogRows: CatalogRow[] = [];
  let skippedMissingName = 0;
  let skippedMissingPrice = 0;
  let skippedDuplicateSlug = 0;

  for (const row of rows) {
    const name = toStringValue(row[0]);
    if (!name) {
      skippedMissingName += 1;
      continue;
    }

    const price = detectPrice(row);
    if (price === null) {
      skippedMissingPrice += 1;
      continue;
    }

    const slug = extractFolderSlug(row, name);
    if (seenSlugs.has(slug)) {
      skippedDuplicateSlug += 1;
      continue;
    }
    seenSlugs.add(slug);

    const description = pickDescription(row, name);
    const brand = pickBrand(row, name);
    const category = toStringValue(row[6]) || "General";
    const image = primaryImageMap.get(slug) ?? "/product_bottle.png";

    catalogRows.push({
      name,
      description,
      brand,
      category,
      price,
      slug,
      image,
    });
  }

  const missingPrimaryImages = catalogRows
    .filter((row) => row.image === "/product_bottle.png")
    .map((row) => row.slug);

  const payload = catalogRows.map((row) => ({
    id: existingBySlug.get(row.slug) ?? nextId(),
    slug: row.slug,
    name: row.name,
    description: row.description,
    brand: row.brand, // CHANGED: sync explicit brand from XLSX into products table.
    category: row.category,
    price: Number(row.price.toFixed(2)),
    stock: options.defaultStock,
    status: options.status,
    image: row.image,
  }));

  if (options.mode === "run") {
    const { error: upsertError } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "slug" });

    if (upsertError) {
      throw new Error(`Failed to upsert products: ${upsertError.message}`);
    }

    const slugs = payload.map((row) => row.slug);
    const { data: verifyRows, error: verifyError } = await supabase
      .from("products")
      .select("slug")
      .in("slug", slugs);

    if (verifyError) {
      throw new Error(`Failed to verify products: ${verifyError.message}`);
    }

    const verifiedCount = verifyRows?.length ?? 0;
    if (verifiedCount !== payload.length) {
      throw new Error(
        `Verification mismatch. Expected ${payload.length} rows, found ${verifiedCount}.`,
      );
    }
  }

  const summary: SyncSummary = {
    mode: options.mode,
    xlsx_path: options.xlsxPath,
    manifest_path: options.manifestPath,
    rows_in_sheet: rows.length,
    rows_parsed: catalogRows.length,
    rows_skipped_missing_name: skippedMissingName,
    rows_skipped_missing_price: skippedMissingPrice,
    rows_skipped_duplicate_slug: skippedDuplicateSlug,
    products_prepared: payload.length,
    products_upserted: options.mode === "run" ? payload.length : 0,
    default_stock: options.defaultStock,
    status: options.status,
    missing_primary_images: missingPrimaryImages,
    sample_missing_primary_images: missingPrimaryImages.slice(0, 20),
    created_at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(options.summaryPath), { recursive: true });
  await fs.writeFile(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Mode: ${options.mode}`);
  console.log(`Products prepared: ${payload.length}`);
  console.log(`Skipped missing name: ${skippedMissingName}`);
  console.log(`Skipped missing price: ${skippedMissingPrice}`);
  console.log(`Skipped duplicate slug: ${skippedDuplicateSlug}`);
  console.log(`Missing primary images: ${missingPrimaryImages.length}`);
  console.log(`Summary: ${options.summaryPath}`);

  if (options.mode === "run") {
    console.log(`Upserted ${payload.length} products into Supabase.`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown catalog sync error.";
  console.error(message);
  process.exit(1);
});
