import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import type { Database } from "../src/types/supabase";

type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "slug" | "name" | "brand" | "ean_barcodes" | "status"
>;

type CatalogueIssue = {
  severity: "blocker" | "warning";
  type: string;
  productIds: string[];
  slugs: string[];
  detail: string;
};

type CatalogueAuditReport = {
  issues: CatalogueIssue[];
};

type KeepaSourceRow = {
  sourceFile: string;
  title: string;
  asin: string;
  brand: string;
  size: string;
  barcodes: string[];
};

type IdentityTriageEntry = {
  issue: CatalogueIssue;
  products: ProductRow[];
  sourceMatches: KeepaSourceRow[];
  reviewAction: string;
};

const DEFAULT_AUDIT_PATH = path.join(process.cwd(), "data", "catalogue-quality-report.json");
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), "data", "catalogue-identity-triage-report.json");
const DEFAULT_CSV_OUTPUT_PATH = path.join(process.cwd(), "data", "catalogue-identity-triage-report.csv");
const DEFAULT_SOURCES = [
  path.join(process.cwd(), "data", "Keepa", "KeepaExport-2026-09-20-savzix-store.xlsx"),
  path.join(process.cwd(), "data", "Keepa", "Keepa-Savzix-2026-09-27.xlsx"),
];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normaliseBarcode(value: string): string {
  return value.replace(/\D/g, "");
}

function normaliseTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getCell(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function getBarcodes(row: Record<string, unknown>): string[] {
  return ["ean", "Product Codes: EAN", "Product Codes: UPC", "Product Codes: GTIN"]
    .flatMap((key) => getCell(row, key).split(","))
    .map(normaliseBarcode)
    .filter(Boolean);
}

function loadKeepaRows(sourcePath: string): KeepaSourceRow[] {
  const workbook = XLSX.readFile(sourcePath, { raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error(`No worksheet found in ${sourcePath}.`);

  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }).map((row) => ({
    sourceFile: path.basename(sourcePath),
    title: getCell(row, "Title"),
    asin: getCell(row, "ASIN"),
    brand: getCell(row, "Brand"),
    size: getCell(row, "Size"),
    barcodes: getBarcodes(row),
  }));
}

function getBarcodeFromIssue(issue: CatalogueIssue): string | null {
  const match = issue.detail.match(/Barcode "(\d+)"/);
  return match?.[1] ?? null;
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function createReviewCsv(entries: IdentityTriageEntry[]): string {
  const columns = [
    "issue_type",
    "issue_detail",
    "live_product_id",
    "live_status",
    "live_title",
    "live_brand",
    "live_barcodes",
    "source_file",
    "source_asin",
    "source_title",
    "source_brand",
    "source_size",
    "source_barcodes",
    "review_action",
  ];
  const rows = entries.flatMap((entry) =>
    entry.products.flatMap((product) => {
      const sourceMatches = entry.sourceMatches.length > 0 ? entry.sourceMatches : [null];
      return sourceMatches.map((source) =>
        [
          entry.issue.type,
          entry.issue.detail,
          product.id,
          product.status,
          product.name,
          product.brand ?? "",
          product.ean_barcodes.join(", "),
          source?.sourceFile ?? "",
          source?.asin ?? "",
          source?.title ?? "",
          source?.brand ?? "",
          source?.size ?? "",
          source?.barcodes.join(", ") ?? "",
          entry.reviewAction,
        ]
          .map(csvCell)
          .join(","),
      );
    }),
  );

  return `${columns.map(csvCell).join(",")}\n${rows.join("\n")}\n`;
}

function sourceTitleCandidates(product: ProductRow, sources: KeepaSourceRow[]): KeepaSourceRow[] {
  const productTitle = normaliseTitle(product.name);
  const productWords = new Set(productTitle.split(" ").filter((word) => word.length > 3));

  return sources
    .map((source) => {
      const sourceWords = new Set(normaliseTitle(source.title).split(" ").filter((word) => word.length > 3));
      const sharedWords = [...productWords].filter((word) => sourceWords.has(word)).length;
      return { source, sharedWords };
    })
    .filter(({ source, sharedWords }) => sharedWords >= 3 || normaliseTitle(source.title) === productTitle)
    .sort((first, second) => second.sharedWords - first.sharedWords || first.source.title.localeCompare(second.source.title))
    .slice(0, 5)
    .map(({ source }) => source);
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());

  const audit = (await import(DEFAULT_AUDIT_PATH, { with: { type: "json" } })).default as CatalogueAuditReport;
  const sourceRows = DEFAULT_SOURCES.flatMap(loadKeepaRows);
  const supabase = createClient<Database>(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.from("products").select("id, slug, name, brand, ean_barcodes, status");
  if (error) throw new Error(`Could not read products: ${error.message}`);

  const productsById = new Map((data ?? []).map((product) => [product.id, product]));
  const blockers = audit.issues.filter(
    (issue) => issue.severity === "blocker" && (issue.type === "duplicate-barcode" || issue.type === "missing-required-field"),
  );

  const entries: IdentityTriageEntry[] = blockers.map((issue) => {
    const products = issue.productIds.flatMap((id) => {
      const product = productsById.get(id);
      return product ? [product] : [];
    });
    const barcode = issue.type === "duplicate-barcode" ? getBarcodeFromIssue(issue) : null;
    const sourceMatches = barcode
      ? sourceRows.filter((source) => source.barcodes.includes(barcode))
      : products.flatMap((product) => sourceTitleCandidates(product, sourceRows));

    return {
      issue,
      products,
      sourceMatches: [...new Map(sourceMatches.map((source) => [`${source.sourceFile}:${source.asin}:${source.title}`, source])).values()],
      reviewAction: barcode
        ? "Compare each live product's physical pack, size, brand, and manufacturer evidence against these source rows. Do not retain one shared barcode across different product identities."
        : "Locate the physical pack or manufacturer record and add a barcode only when it exactly matches this active product's brand, size, and variant.",
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "read-only",
    sourceFiles: DEFAULT_SOURCES.map((source) => path.relative(process.cwd(), source)),
    totals: {
      blockers: entries.length,
      duplicateBarcodeGroups: entries.filter((entry) => entry.issue.type === "duplicate-barcode").length,
      activeProductsMissingBarcode: entries.filter((entry) => entry.issue.type === "missing-required-field").length,
      sourceRowsConsidered: sourceRows.length,
    },
    entries,
  };

  await mkdir(path.dirname(DEFAULT_OUTPUT_PATH), { recursive: true });
  await writeFile(DEFAULT_OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(DEFAULT_CSV_OUTPUT_PATH, createReviewCsv(entries));
  console.log(
    `Wrote ${path.relative(process.cwd(), DEFAULT_OUTPUT_PATH)} and ${path.relative(process.cwd(), DEFAULT_CSV_OUTPUT_PATH)} with ${entries.length} identity blockers.`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Catalogue identity triage failed: ${message}`);
  process.exitCode = 1;
});
