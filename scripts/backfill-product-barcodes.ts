import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

type Mode = "dry-run" | "run";

type SourceRow = Record<string, unknown> & {
  Title?: unknown;
  ean?: unknown;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
};

type TitleRefreshReport = {
  changes?: Array<{
    id: string;
    source_title: string;
  }>;
};

type PreparedUpdate = {
  id: string;
  eanBarcodes: string[];
  match: "title-refresh" | "source-slug";
};

const SOURCE_XLSX = "data/Keepa/KeepaExport-2026-09-20-savzix-store.xlsx";
const TITLE_REPORT = "data/keepa-title-refresh-report.json";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseMode(args: string[]): Mode {
  if (args.length !== 1 || (args[0] !== "--dry-run" && args[0] !== "--run")) {
    throw new Error("Use exactly one argument: --dry-run or --run.");
  }

  return args[0] === "--run" ? "run" : "dry-run";
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

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function getVerifiedEans(row: SourceRow): string[] {
  return [...new Set(text(row.ean).match(/\d{13}/g) ?? [])];
}

function loadSourceRows(): SourceRow[] {
  const workbook = XLSX.readFile(SOURCE_XLSX);
  return workbook.SheetNames.flatMap((sheetName) =>
    XLSX.utils.sheet_to_json<SourceRow>(workbook.Sheets[sheetName], { defval: null }),
  );
}

function indexRows(rows: SourceRow[]): Map<string, SourceRow[]> {
  const index = new Map<string, SourceRow[]>();

  for (const row of rows) {
    const title = text(row.Title);
    if (!title) continue;

    const existing = index.get(title) ?? [];
    existing.push(row);
    index.set(title, existing);
  }

  return index;
}

function getVerifiedEansForRows(rows: SourceRow[] | undefined): string[] {
  if (!rows) return [];

  return [...new Set(rows.flatMap(getVerifiedEans))];
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const rows = loadSourceRows();
  const sourceRowsByTitle = indexRows(rows);
  const sourceRowsBySlug = new Map<string, SourceRow[]>();

  for (const row of rows) {
    const slug = slugify(text(row.Title));
    if (!slug) continue;
    sourceRowsBySlug.set(slug, [...(sourceRowsBySlug.get(slug) ?? []), row]);
  }

  const report = (await import(`../${TITLE_REPORT}`, { with: { type: "json" } })).default as TitleRefreshReport;
  const sourceTitleByProductId = new Map(
    (report.changes ?? []).map((change) => [change.id, change.source_title]),
  );

  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase.from("products").select("id, slug, name");
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const updates: PreparedUpdate[] = [];
  const unresolvedSlugs: string[] = [];

  for (const product of (data ?? []) as ProductRow[]) {
    const sourceTitle = sourceTitleByProductId.get(product.id);
    const titleEans = getVerifiedEansForRows(sourceTitle ? sourceRowsByTitle.get(sourceTitle) : undefined);
    const slugEans = titleEans.length > 0 ? [] : getVerifiedEansForRows(sourceRowsBySlug.get(product.slug));
    const eanBarcodes = titleEans.length > 0 ? titleEans : slugEans;

    if (eanBarcodes.length === 0) {
      unresolvedSlugs.push(product.slug);
      continue;
    }

    updates.push({
      id: product.id,
      eanBarcodes,
      match: titleEans.length > 0 ? "title-refresh" : "source-slug",
    });
  }

  if (mode === "run") {
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ ean_barcodes: update.eanBarcodes })
        .eq("id", update.id);
      if (updateError) throw new Error(`Failed to update ${update.id}: ${updateError.message}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode,
        products_total: data?.length ?? 0,
        verified_eans: updates.length,
        unresolved_products: unresolvedSlugs.length,
        unresolved_slugs: unresolvedSlugs,
        matched_by_title_refresh: updates.filter((update) => update.match === "title-refresh").length,
        matched_by_source_slug: updates.filter((update) => update.match === "source-slug").length,
      },
      null,
      2,
    ),
  );
}

void main();
