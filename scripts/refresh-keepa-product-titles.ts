import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import {
  buildRetailProductTitle,
  type KeepaTitleSource,
} from "./lib/retail-product-title";

type Mode = "dry-run" | "run";

type ManifestRow = {
  folder_name: string;
  folder_slug: string;
};

type ExistingProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  status: string;
};

type TitleChange = {
  id: string;
  slug: string;
  source_title: string;
  current_title: string;
  proposed_title: string;
  warnings: string[];
  changed: boolean;
  eligible: boolean;
};

const DEFAULT_XLSX = path.join(
  process.cwd(),
  "data",
  "KeepaExport-2026-09-20-savzix-store.xlsx",
);
const DEFAULT_MANIFEST = path.join(process.cwd(), "data", "image-import-manifest.json");
const DEFAULT_REPORT = path.join(process.cwd(), "data", "keepa-title-refresh-report.json");

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseMode(argv: string[]): Mode {
  const hasDryRun = argv.includes("--dry-run");
  const hasRun = argv.includes("--run");
  if (hasDryRun === hasRun) throw new Error("Specify exactly one mode: --dry-run or --run.");
  return hasRun ? "run" : "dry-run";
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadRows(xlsxPath: string): KeepaTitleSource[] {
  const workbook = XLSX.readFile(xlsxPath);
  return workbook.SheetNames.flatMap((sheetName) =>
    XLSX.utils.sheet_to_json<KeepaTitleSource>(workbook.Sheets[sheetName], { defval: null }),
  );
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  await Promise.all([fs.access(DEFAULT_XLSX), fs.access(DEFAULT_MANIFEST)]);

  const sourceRows = loadRows(DEFAULT_XLSX);
  const sourceByTitle = new Map(
    sourceRows
      .map((row) => [text(row.Title), row] as const)
      .filter(([title]) => Boolean(title)),
  );
  const manifest = JSON.parse(await fs.readFile(DEFAULT_MANIFEST, "utf8")) as ManifestRow[];
  const sourceBySlug = new Map<string, KeepaTitleSource>();

  for (const row of manifest) {
    const source = sourceByTitle.get(row.folder_name);
    if (source) sourceBySlug.set(row.folder_slug, source);
  }
  for (const source of sourceRows) {
    const sourceTitle = text(source.Title);
    if (sourceTitle) sourceBySlug.set(slugify(sourceTitle), source);
  }

  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, stock, status")
    .order("id");
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const products = (data ?? []) as ExistingProduct[];
  const missingSources: string[] = [];
  const changes: TitleChange[] = [];

  for (const product of products) {
    const source = sourceBySlug.get(product.slug);
    if (!source) {
      missingSources.push(product.slug);
      continue;
    }

    const result = buildRetailProductTitle(source);
    const changed = product.name !== result.title;
    changes.push({
      id: product.id,
      slug: product.slug,
      source_title: text(source.Title),
      current_title: product.name,
      proposed_title: result.title,
      warnings: result.warnings,
      changed,
      eligible: changed,
    });
  }

  const warningCount = changes.filter((change) => change.warnings.length > 0).length;
  if (mode === "run") {
    const updates = changes
      .filter((change) => change.eligible)
      .map((change) => ({ id: change.id, name: change.proposed_title }));

    for (const batch of chunks(updates, 25)) {
      const results = await Promise.all(
        batch.map((update) =>
          supabase.from("products").update({ name: update.name }).eq("id", update.id),
        ),
      );
      const updateError = results.find((result) => result.error)?.error;
      if (updateError) {
        throw new Error(`Failed to refresh product titles: ${updateError.message}`);
      }
    }

    const { data: verification, error: verificationError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", updates.map((update) => update.id));
    if (verificationError) throw new Error(`Failed to verify titles: ${verificationError.message}`);

    const verifiedById = new Map((verification ?? []).map((row) => [row.id, row.name]));
    const mismatches = updates.filter(
      (update) => verifiedById.get(update.id) !== update.name,
    );
    if (mismatches.length > 0) {
      throw new Error(`Title verification failed for ${mismatches.length} products.`);
    }
  }

  const report = {
    mode,
    generated_at: new Date().toISOString(),
    products_found: products.length,
    products_matched: changes.length,
    products_unmatched: missingSources.length,
    unmatched_slugs: missingSources,
    titles_changed: changes.filter((change) => change.changed).length,
    titles_eligible_for_update: changes.filter((change) => change.eligible).length,
    titles_skipped_for_review: changes.filter(
      (change) => change.changed && !change.eligible,
    ).length,
    titles_with_warnings: warningCount,
    identity_fields_updated: false,
    price_stock_status_updated: false,
    changes,
  };

  await fs.writeFile(DEFAULT_REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ...report, changes: undefined }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unknown title refresh error.");
  process.exit(1);
});
