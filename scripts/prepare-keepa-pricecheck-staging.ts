import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { classifyProductTaxonomy } from "../src/lib/product-taxonomy-classifier";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "../src/lib/supabase/env";
import type { Database } from "../src/types/supabase";
import { buildRetailProductTitle } from "./lib/retail-product-title";

type KeepaRow = Record<string, unknown> & {
  ASIN?: unknown;
  Title?: unknown;
  Brand?: unknown;
  Manufacturer?: unknown;
  Image?: unknown;
  Ingredients?: unknown;
  "Description & Features: Description"?: unknown;
  "Categories: Root"?: unknown;
  "Categories: Sub"?: unknown;
  "Categories: Tree"?: unknown;
  "Product Codes: EAN"?: unknown;
  "Product Codes: GTIN"?: unknown;
  "Product Codes: UPC"?: unknown;
  "URL: Amazon"?: unknown;
  "URL: Keepa"?: unknown;
  Size?: unknown;
  "Number of Items"?: unknown;
  "Package: Quantity"?: unknown;
};

type PricecheckRow = Record<string, unknown> & {
  DESCRIPTION?: unknown;
  RSP?: unknown;
  "Cost Price"?: unknown;
  BARCODE?: unknown;
};

type ExistingProduct = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "slug" | "name" | "brand" | "ean_barcodes"
>;

type CliOptions = {
  keepaPath: string;
  pricePath: string;
  reportDirectory: string;
};

type PriceMatch = {
  priceRow: PricecheckRow | null;
  matchedBarcode: string | null;
  reason: "matched" | "missing-keepa-barcode" | "unmatched-barcode" | "ambiguous-barcode";
};

type DuplicateReason = "barcode" | "slug" | "title" | "internal-barcode" | "internal-slug";

type DuplicateRecord = {
  keepa_row: number;
  title: string;
  asin: string;
  candidate_slug: string;
  reason: DuplicateReason;
  matched_value: string;
  existing_product?: Pick<ExistingProduct, "id" | "slug" | "name" | "brand">;
};

type MissingDataRecord = {
  keepa_row: number;
  title: string;
  asin: string;
  missing_fields: string[];
  source_verification_required: string[];
};

type ImageValidationRecord = {
  keepa_row: number;
  title: string;
  asin: string;
  primary_image_url: string | null;
  source_reference: string | null;
  validation_status: "missing" | "pending-exact-match-verification";
  blocking_reason: string;
};

type StagingRecord = {
  keepa_row: number;
  status: "Hold";
  hold_reasons: string[];
  asin: string;
  brand: string;
  source_title: string;
  seo_title: string;
  slug: string;
  ean_gtin_upc: string[];
  keepa_category_tree: string;
  proposed_category_path: string | null;
  keepa_description_source: string;
  supplier_sheet_description: string;
  supplier_cost_gbp: number | null;
  supplier_rsp_gbp: number | null;
  proposed_website_price_gbp: number | null;
  ingredients_source: string;
  primary_image_source_url: string | null;
  keepa_source_url: string;
  amazon_source_url: string;
};

const DEFAULT_KEEPA = path.join(process.cwd(), "data/Keepa/Keepa-Savzix-2026-09-27.xlsx");
const DEFAULT_PRICECHECK = path.join(
  process.cwd(),
  "data/Pricecheck/Luxury_Fragrance_26_09_26.xlsx",
);
const DEFAULT_REPORT_DIRECTORY = path.join(
  process.cwd(),
  "data/import-reports/keepa-pricecheck-2026-09-27",
);

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizePath(input: string): string {
  return path.isAbsolute(input) ? path.normalize(input) : path.join(process.cwd(), input);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    keepaPath: DEFAULT_KEEPA,
    pricePath: DEFAULT_PRICECHECK,
    reportDirectory: DEFAULT_REPORT_DIRECTORY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
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
      case "--report-directory":
        options.reportDirectory = normalizePath(value);
        break;
      default:
        throw new Error(`Unknown option: ${argument}.`);
    }
    index += 1;
  }

  return options;
}

function normalizeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value: string): string {
  return normalizeTitle(value).replace(/\s+/g, "-") || "product";
}

function isValidGtin(value: string): boolean {
  if (!/^\d{8}$|^\d{12,14}$/.test(value)) return false;

  const digits = [...value].map(Number);
  const expectedCheckDigit = digits.pop();
  if (expectedCheckDigit === undefined) return false;

  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === expectedCheckDigit;
}

function canonicalBarcode(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!isValidGtin(digits)) return null;
  return digits.padStart(14, "0");
}

function barcodeTokens(value: unknown): string[] {
  return [...new Set(
    text(value)
      .split(/[^0-9]+/)
      .map(canonicalBarcode)
      .filter((barcode): barcode is string => barcode !== null),
  )];
}

function keepaBarcodes(row: KeepaRow): string[] {
  return [...new Set([
    ...barcodeTokens(row["Product Codes: EAN"]),
    ...barcodeTokens(row["Product Codes: GTIN"]),
    ...barcodeTokens(row["Product Codes: UPC"]),
  ])];
}

function primaryImage(value: unknown): string | null {
  const image = text(value).split(";").map((item) => item.trim()).find(Boolean);
  return image && /^https:\/\//i.test(image) ? image : null;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  const parsed = Number.parseFloat(text(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function loadRows<T>(filePath: string): T[] {
  const workbook = XLSX.readFile(filePath);
  return workbook.SheetNames.flatMap((sheetName) =>
    XLSX.utils.sheet_to_json<T>(workbook.Sheets[sheetName], { defval: null, raw: true }),
  );
}

function indexPriceRows(rows: PricecheckRow[]): Map<string, PricecheckRow[]> {
  const index = new Map<string, PricecheckRow[]>();
  for (const row of rows) {
    for (const barcode of barcodeTokens(row.BARCODE)) {
      const matches = index.get(barcode) ?? [];
      matches.push(row);
      index.set(barcode, matches);
    }
  }
  return index;
}

function resolvePrice(row: KeepaRow, priceIndex: Map<string, PricecheckRow[]>): PriceMatch {
  const barcodes = keepaBarcodes(row);
  if (barcodes.length === 0) {
    return { priceRow: null, matchedBarcode: null, reason: "missing-keepa-barcode" };
  }

  const candidates = [...new Set(barcodes.flatMap((barcode) => priceIndex.get(barcode) ?? []))];
  if (candidates.length === 0) {
    return { priceRow: null, matchedBarcode: null, reason: "unmatched-barcode" };
  }
  if (candidates.length > 1) {
    return { priceRow: null, matchedBarcode: null, reason: "ambiguous-barcode" };
  }

  const priceRow = candidates[0];
  const matchedBarcode = barcodes.find((barcode) => (priceIndex.get(barcode) ?? []).includes(priceRow)) ?? null;
  return { priceRow, matchedBarcode, reason: "matched" };
}

function csvCell(value: unknown): string {
  const textValue = Array.isArray(value) ? value.join(" | ") : text(value);
  return `"${textValue.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "\n";
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return `${fields.join(",")}\n${rows.map((row) => fields.map((field) => csvCell(row[field])).join(",")).join("\n")}\n`;
}

async function writeReport(directory: string, name: string, value: unknown): Promise<void> {
  await fs.writeFile(path.join(directory, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  if (Array.isArray(value)) {
    await fs.writeFile(path.join(directory, `${name}.csv`), toCsv(value as Record<string, unknown>[]), "utf8");
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  await Promise.all([fs.access(options.keepaPath), fs.access(options.pricePath)]);

  const [keepaRows, pricecheckRows] = await Promise.all([
    Promise.resolve(loadRows<KeepaRow>(options.keepaPath)),
    Promise.resolve(loadRows<PricecheckRow>(options.pricePath)),
  ]);
  const { url } = getSupabaseEnv();
  const supabase = createClient<Database>(url, getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, brand, ean_barcodes");
  if (error) throw new Error(`Failed to read the existing catalogue: ${error.message}`);
  const existingProducts = (data ?? []) as ExistingProduct[];

  const priceIndex = indexPriceRows(pricecheckRows);
  const existingByBarcode = new Map<string, ExistingProduct>();
  const existingBySlug = new Map(existingProducts.map((product) => [product.slug, product]));
  const existingByTitle = new Map(
    existingProducts.map((product) => [normalizeTitle(product.name), product]),
  );
  for (const product of existingProducts) {
    for (const barcode of product.ean_barcodes ?? []) {
      const canonical = canonicalBarcode(barcode);
      if (canonical) existingByBarcode.set(canonical, product);
    }
  }

  const duplicateReport: DuplicateRecord[] = [];
  const unmatchedBarcodeReport: Array<Record<string, unknown>> = [];
  const missingDataReport: MissingDataRecord[] = [];
  const imageValidationReport: ImageValidationRecord[] = [];
  const stagingCatalogue: StagingRecord[] = [];
  const seenCandidateBarcode = new Map<string, number>();
  const seenCandidateSlug = new Map<string, number>();

  keepaRows.forEach((row, index) => {
    const keepaRow = index + 2;
    const sourceTitle = text(row.Title);
    const retailTitle = sourceTitle ? buildRetailProductTitle(row).title : "";
    const candidateSlug = slugify(retailTitle || sourceTitle);
    const barcodes = keepaBarcodes(row);
    const asin = text(row.ASIN);
    const primaryImageUrl = primaryImage(row.Image);
    const priceMatch = resolvePrice(row, priceIndex);
    const duplicateReasons: DuplicateRecord[] = [];

    for (const barcode of barcodes) {
      const existing = existingByBarcode.get(barcode);
      if (existing) {
        duplicateReasons.push({
          keepa_row: keepaRow,
          title: sourceTitle,
          asin,
          candidate_slug: candidateSlug,
          reason: "barcode",
          matched_value: barcode,
          existing_product: existing,
        });
      }
      const firstKeepaRow = seenCandidateBarcode.get(barcode);
      if (firstKeepaRow !== undefined) {
        duplicateReasons.push({
          keepa_row: keepaRow,
          title: sourceTitle,
          asin,
          candidate_slug: candidateSlug,
          reason: "internal-barcode",
          matched_value: `${barcode} (first seen in Keepa row ${firstKeepaRow})`,
        });
      }
      seenCandidateBarcode.set(barcode, keepaRow);
    }

    const existingSlug = existingBySlug.get(candidateSlug);
    if (existingSlug) {
      duplicateReasons.push({
        keepa_row: keepaRow,
        title: sourceTitle,
        asin,
        candidate_slug: candidateSlug,
        reason: "slug",
        matched_value: candidateSlug,
        existing_product: existingSlug,
      });
    }
    const existingTitle = existingByTitle.get(normalizeTitle(sourceTitle));
    if (sourceTitle && existingTitle) {
      duplicateReasons.push({
        keepa_row: keepaRow,
        title: sourceTitle,
        asin,
        candidate_slug: candidateSlug,
        reason: "title",
        matched_value: normalizeTitle(sourceTitle),
        existing_product: existingTitle,
      });
    }
    const firstSlugRow = seenCandidateSlug.get(candidateSlug);
    if (firstSlugRow !== undefined) {
      duplicateReasons.push({
        keepa_row: keepaRow,
        title: sourceTitle,
        asin,
        candidate_slug: candidateSlug,
        reason: "internal-slug",
        matched_value: `${candidateSlug} (first seen in Keepa row ${firstSlugRow})`,
      });
    }
    seenCandidateSlug.set(candidateSlug, keepaRow);
    duplicateReport.push(...duplicateReasons);

    if (priceMatch.reason !== "matched") {
      unmatchedBarcodeReport.push({
        keepa_row: keepaRow,
        title: sourceTitle,
        asin,
        keepa_barcodes: barcodes,
        match_status: priceMatch.reason,
      });
    }

    const missingFields = [
      !sourceTitle && "title",
      !text(row.Brand) && !text(row.Manufacturer) && "brand",
      barcodes.length === 0 && "valid_ean_gtin_upc",
      !text(row["Description & Features: Description"]) && "description_source",
      !text(row.Ingredients) && "ingredients_source",
      !primaryImageUrl && "primary_image_source",
      priceMatch.reason !== "matched" && "barcode_matched_supplier_price",
      priceMatch.priceRow && parsePrice(priceMatch.priceRow.RSP) === null && "supplier_rsp",
      priceMatch.priceRow && parsePrice(priceMatch.priceRow["Cost Price"]) === null && "supplier_cost",
      retailTitle.length > 90 && "seo_title_under_90_characters",
    ].filter((field): field is string => Boolean(field));
    const sourceVerificationRequired = [
      "manufacturer-or-packaging-description-verification",
      "manufacturer-or-packaging-ingredients-verification",
      "exact-product-size-pack-count-image-and-rights-verification",
    ];
    if (missingFields.length > 0 || sourceVerificationRequired.length > 0) {
      missingDataReport.push({
        keepa_row: keepaRow,
        title: sourceTitle,
        asin,
        missing_fields: missingFields,
        source_verification_required: sourceVerificationRequired,
      });
    }

    imageValidationReport.push({
      keepa_row: keepaRow,
      title: sourceTitle,
      asin,
      primary_image_url: primaryImageUrl,
      source_reference: text(row["URL: Keepa"]) || text(row["URL: Amazon"]) || null,
      validation_status: primaryImageUrl ? "pending-exact-match-verification" : "missing",
      blocking_reason: primaryImageUrl
        ? "Keepa image is a source reference only; exact product, variant, pack count and rights are not yet verified."
        : "No valid HTTPS primary image source was supplied.",
    });

    const category = classifyProductTaxonomy({
      name: retailTitle || sourceTitle,
      brand: text(row.Brand) || text(row.Manufacturer),
      category: text(row["Categories: Root"]),
    });
    const holdReasons = [
      "No Supabase write authorised until the reports are approved.",
      "Manufacturer or packaging verification is required for descriptions and ingredients.",
      "A final local white-background WebP package has not been approved.",
      ...duplicateReasons.map((duplicate) => `Duplicate conflict: ${duplicate.reason}.`),
      ...missingFields.map((field) => `Missing or invalid: ${field}.`),
    ];
    if (priceMatch.reason === "matched" && duplicateReasons.length === 0 && missingFields.length === 0) {
      holdReasons.splice(3, 0, "Candidate otherwise passed the automated barcode, price and exact-conflict checks.");
    }

    stagingCatalogue.push({
      keepa_row: keepaRow,
      status: "Hold",
      hold_reasons: holdReasons,
      asin,
      brand: text(row.Brand) || text(row.Manufacturer),
      source_title: sourceTitle,
      seo_title: retailTitle,
      slug: candidateSlug,
      ean_gtin_upc: barcodes,
      keepa_category_tree: text(row["Categories: Tree"]),
      proposed_category_path: category.primaryPath,
      keepa_description_source: text(row["Description & Features: Description"]),
      supplier_sheet_description: text(priceMatch.priceRow?.DESCRIPTION),
      supplier_cost_gbp: priceMatch.priceRow ? parsePrice(priceMatch.priceRow["Cost Price"]) : null,
      supplier_rsp_gbp: priceMatch.priceRow ? parsePrice(priceMatch.priceRow.RSP) : null,
      proposed_website_price_gbp: priceMatch.priceRow ? parsePrice(priceMatch.priceRow.RSP) : null,
      ingredients_source: text(row.Ingredients),
      primary_image_source_url: primaryImageUrl,
      keepa_source_url: text(row["URL: Keepa"]),
      amazon_source_url: text(row["URL: Amazon"]),
    });
  });

  const duplicateRows = new Set(duplicateReport.map((row) => row.keepa_row));
  const barcodeMatched = stagingCatalogue.filter(
    (row) => !row.hold_reasons.some((reason) => reason.includes("barcode_matched_supplier_price")),
  ).length;
  const priceMatched = stagingCatalogue.filter((row) => row.supplier_rsp_gbp !== null).length;
  const automatedCandidates = stagingCatalogue.filter(
    (row) =>
      !duplicateRows.has(row.keepa_row) &&
      row.supplier_rsp_gbp !== null &&
      row.supplier_cost_gbp !== null &&
      row.ean_gtin_upc.length > 0 &&
      row.seo_title.length > 0 &&
      row.seo_title.length <= 90 &&
      row.proposed_category_path !== null &&
      row.primary_image_source_url !== null,
  ).length;
  const summary = {
    mode: "pre-import-dry-run",
    keepa_source: options.keepaPath,
    pricecheck_source: options.pricePath,
    keepa_rows: keepaRows.length,
    pricecheck_rows: pricecheckRows.length,
    existing_supabase_products_read: existingProducts.length,
    barcode_matching: "canonical EAN/GTIN/UPC only; no title matching used",
    supplier_price_evidence: "RSP and Cost Price retained without altering any website price",
    barcode_matched_supplier_rows: barcodeMatched,
    supplier_rsp_resolved_by_barcode: priceMatched,
    unmatched_or_ambiguous_barcodes: unmatchedBarcodeReport.length,
    duplicate_conflicts: duplicateReport.length,
    candidate_rows_with_duplicate_conflicts: duplicateRows.size,
    candidates_passing_automated_checks: automatedCandidates,
    importable_now: 0,
    import_action: "No images uploaded and no Supabase rows created or modified.",
    blockers: [
      "Descriptions and ingredients require manufacturer or packaging verification.",
      "Primary images require exact product, size, pack-count and rights verification before download and WebP processing.",
      "The current products schema does not store supplier SKU or ASIN, so those two duplicate checks cannot be completed against Supabase.",
      "Explicit approval is required before any Supabase upload or product creation.",
    ],
    generated_at: new Date().toISOString(),
  };

  await fs.mkdir(options.reportDirectory, { recursive: true });
  await Promise.all([
    writeReport(options.reportDirectory, "duplicate-report", duplicateReport),
    writeReport(options.reportDirectory, "unmatched-barcode-report", unmatchedBarcodeReport),
    writeReport(options.reportDirectory, "missing-data-report", missingDataReport),
    writeReport(options.reportDirectory, "image-validation-report", imageValidationReport),
    writeReport(options.reportDirectory, "staging-catalogue", stagingCatalogue),
    writeReport(options.reportDirectory, "dry-run-summary", summary),
  ]);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unknown staging preparation error.");
  process.exit(1);
});
