import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

type Mode = "dry-run" | "run";
type ProductStatus = "Active" | "Draft" | "Archived";

type CliOptions = {
  mode: Mode;
  xlsxPath: string;
  manifestPath: string;
  defaultPrice: number;
  defaultStock: number;
  status: ProductStatus;
  summaryPath: string;
};

type KeepaRow = Record<string, unknown> & {
  Title?: unknown;
  Brand?: unknown;
  Manufacturer?: unknown;
  "Item Highlights"?: unknown;
  "Product Benefit"?: unknown;
  "Target Audience"?: unknown;
  "Recommended Uses"?: unknown;
};

type ManifestRow = {
  category_slug: string;
  folder_name: string;
  folder_slug: string;
  sequence: string;
  public_url: string;
};

type ExistingProduct = {
  id: string;
  slug: string;
};

type ProductPayload = {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
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

const DEFAULT_XLSX = path.join(
  process.cwd(),
  "data",
  "KeepaExport-2026-09-20-savzix-store.xlsx",
);
const DEFAULT_MANIFEST = path.join(process.cwd(), "data", "image-import-manifest.json");
const DEFAULT_SUMMARY = path.join(process.cwd(), "data", "keepa-catalogue-sync-summary.json");

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePath(input: string): string {
  return path.isAbsolute(input) ? path.normalize(input) : path.join(process.cwd(), input);
}

function parseNonNegativeNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative number.`);
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  let mode: Mode | null = null;
  const options: Omit<CliOptions, "mode"> = {
    xlsxPath: DEFAULT_XLSX,
    manifestPath: DEFAULT_MANIFEST,
    defaultPrice: 0,
    defaultStock: 0,
    status: "Draft",
    summaryPath: DEFAULT_SUMMARY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") {
      if (mode === "run") throw new Error("Use either --dry-run or --run, not both.");
      mode = "dry-run";
      continue;
    }
    if (argument === "--run") {
      if (mode === "dry-run") throw new Error("Use either --dry-run or --run, not both.");
      mode = "run";
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}.`);
    }

    switch (argument) {
      case "--xlsx":
        options.xlsxPath = normalizePath(value);
        break;
      case "--manifest":
        options.manifestPath = normalizePath(value);
        break;
      case "--default-price":
        options.defaultPrice = parseNonNegativeNumber(value, "default-price");
        break;
      case "--default-stock":
        options.defaultStock = parseNonNegativeNumber(value, "default-stock");
        if (!Number.isInteger(options.defaultStock)) {
          throw new Error("default-stock must be an integer.");
        }
        break;
      case "--status":
        if (value !== "Active" && value !== "Draft" && value !== "Archived") {
          throw new Error("status must be one of: Active, Draft, Archived.");
        }
        options.status = value;
        break;
      case "--summary-path":
        options.summaryPath = normalizePath(value);
        break;
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
    index += 1;
  }

  if (!mode) {
    throw new Error("Specify exactly one mode: --dry-run or --run.");
  }

  if (options.status === "Active" && (options.defaultPrice <= 0 || options.defaultStock <= 0)) {
    throw new Error("Active imports require positive --default-price and --default-stock values.");
  }

  return { mode, ...options };
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function slugify(value: string): string {
  const ascii = value
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

function sentence(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim().replace(/[.]+$/g, "");
  return cleaned ? `${cleaned}.` : "";
}

function sourceDescription(row: KeepaRow): string {
  const parts = [
    text(row["Item Highlights"]),
    text(row["Product Benefit"]),
    text(row["Recommended Uses"]),
  ]
    .filter(Boolean)
    .map(sentence);

  const audience = text(row["Target Audience"]);
  if (audience) {
    parts.push(sentence(`Suitable for ${audience}`));
  }

  return parts.join(" ") || sentence(text(row.Title));
}

function loadWorkbookRows(xlsxPath: string): KeepaRow[] {
  const workbook = XLSX.readFile(xlsxPath);
  return workbook.SheetNames.flatMap((sheetName) =>
    XLSX.utils.sheet_to_json<KeepaRow>(workbook.Sheets[sheetName], { defval: null }),
  );
}

function primaryImages(manifest: ManifestRow[]): Map<string, ManifestRow> {
  const primaryBySlug = new Map<string, ManifestRow>();
  for (const row of manifest) {
    const existing = primaryBySlug.get(row.folder_slug);
    if (!existing || row.sequence === "01") {
      primaryBySlug.set(row.folder_slug, row);
    }
  }
  return primaryBySlug;
}

function nextIdGenerator(existingIds: string[]) {
  let cursor = existingIds.reduce((maximum, id) => {
    const numeric = Number.parseInt(id.replace(/\D/g, ""), 10);
    return Number.isFinite(numeric) ? Math.max(maximum, numeric) : maximum;
  }, 0) + 1;

  return () => {
    const id = `PROD-${String(cursor).padStart(3, "0")}`;
    cursor += 1;
    return id;
  };
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await fs.access(options.xlsxPath);
  await fs.access(options.manifestPath);

  const manifest = JSON.parse(await fs.readFile(options.manifestPath, "utf8")) as ManifestRow[];
  const packageBySlug = primaryImages(manifest);
  const workbookRows = loadWorkbookRows(options.xlsxPath);
  const workbookByTitle = new Map<string, KeepaRow>(
    workbookRows.flatMap((row): Array<[string, KeepaRow]> => {
      const title = text(row.Title);
      return title ? [[title, row]] : [];
    }),
  );

  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingRows, error: existingError } = await supabase
    .from("products")
    .select("id, slug");
  if (existingError) {
    throw new Error(`Failed to load existing products: ${existingError.message}`);
  }

  const existing = (existingRows ?? []) as ExistingProduct[];
  const existingBySlug = new Map(existing.map((row) => [row.slug, row.id]));
  const nextId = nextIdGenerator(existing.map((row) => row.id));
  const missingWorkbookRows: string[] = [];
  const unsupportedCategories: string[] = [];
  const payload: ProductPayload[] = [];

  for (const [folderSlug, packageRow] of [...packageBySlug.entries()].sort()) {
    const sourceRow = workbookByTitle.get(packageRow.folder_name);
    if (!sourceRow) {
      missingWorkbookRows.push(packageRow.folder_name);
      continue;
    }

    const category = CATEGORY_LABELS[packageRow.category_slug];
    if (!category) {
      unsupportedCategories.push(packageRow.category_slug);
      continue;
    }

    const title = text(sourceRow.Title);
    const slug = slugify(title);
    if (slug !== folderSlug) {
      throw new Error(`Slug mismatch for ${title}: manifest=${folderSlug}, workbook=${slug}`);
    }

    payload.push({
      id: existingBySlug.get(slug) ?? nextId(),
      slug,
      name: title,
      description: sourceDescription(sourceRow),
      brand: text(sourceRow.Brand) || text(sourceRow.Manufacturer) || title.split(/\s+/)[0] || "Brand",
      category,
      price: Number(options.defaultPrice.toFixed(2)),
      stock: options.defaultStock,
      status: options.status,
      image: packageRow.public_url,
    });
  }

  if (missingWorkbookRows.length > 0 || unsupportedCategories.length > 0) {
    throw new Error(
      `Catalogue preparation failed: ${missingWorkbookRows.length} missing workbook rows, ${unsupportedCategories.length} unsupported categories.`,
    );
  }

  if (payload.length !== packageBySlug.size) {
    throw new Error(`Prepared ${payload.length} products for ${packageBySlug.size} packages.`);
  }

  if (options.mode === "run") {
    for (const batch of chunks(payload, 100)) {
      const { error } = await supabase.from("products").upsert(batch, { onConflict: "slug" });
      if (error) {
        throw new Error(`Failed to upsert products: ${error.message}`);
      }
    }
  }

  let verified = 0;
  if (options.mode === "run") {
    for (const batch of chunks(payload.map((row) => row.slug), 100)) {
      const { data, error } = await supabase.from("products").select("slug").in("slug", batch);
      if (error) {
        throw new Error(`Failed to verify products: ${error.message}`);
      }
      verified += data?.length ?? 0;
    }
    if (verified !== payload.length) {
      throw new Error(`Verification mismatch: expected ${payload.length}, found ${verified}.`);
    }
  }

  const summary = {
    mode: options.mode,
    source_xlsx: options.xlsxPath,
    manifest: options.manifestPath,
    products_prepared: payload.length,
    products_upserted: options.mode === "run" ? payload.length : 0,
    products_verified: verified,
    images_in_manifest: manifest.length,
    status: options.status,
    default_price: options.defaultPrice,
    default_stock: options.defaultStock,
    category_counts: Object.fromEntries(
      Object.values(CATEGORY_LABELS).map((category) => [
        category,
        payload.filter((row) => row.category === category).length,
      ]),
    ),
    created_at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(options.summaryPath), { recursive: true });
  await fs.writeFile(options.summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unknown Keepa catalogue sync error.");
  process.exit(1);
});
