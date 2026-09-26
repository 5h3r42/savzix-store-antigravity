export type KeepaTitleSource = Record<string, unknown> & {
  Title?: unknown;
  Brand?: unknown;
  Manufacturer?: unknown;
  Size?: unknown;
  "Unit Details: Unit Value"?: unknown;
  "Unit Details: Unit Type"?: unknown;
};

export type RetailTitleResult = {
  title: string;
  warnings: string[];
};

const SIZE_PATTERN =
  /\b(\d+(?:\.\d+)?)\s*(fl\s*oz|millilit(?:re|er)s?|lit(?:re|er)s?|centilit(?:re|er)s?|kilograms?|grams?|ounces?|ml|cl|kg|g|l|oz)\b/i;

const MARKETING_PATTERN =
  /\b(?:back in stock|packaging may vary|ideal for|perfect for|travel-friendly|fast-acting|medium longevity|luxury gifting|everyday use|easy application|streak free|clinically proven|dermatologist tested)\b/i;

const SOURCE_QUALITY_PATTERN =
  /\b(?:where liquid|copressions|palsters|anitperspirant|colagate|despatched within|free fridge magnet)\b/i;

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function cleanup(value: string): string {
  return value
    .replace(/[®™]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,.;:]){2,}/g, "$1")
    .replace(/^[\s,.;:|–—-]+|[\s,.;:|–—-]+$/g, "")
    .trim();
}

function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().replace(/\s+/g, "");
  if (normalized === "floz" || normalized.startsWith("fluidounce")) return "fl oz";
  if (normalized === "ml" || normalized.startsWith("millilit")) return "ml";
  if (normalized === "cl" || normalized.startsWith("centilit")) return "cl";
  if (normalized === "l" || normalized.startsWith("lit")) return "L";
  if (normalized === "kg" || normalized.startsWith("kilogram")) return "kg";
  if (normalized === "g" || normalized.startsWith("gram")) return "g";
  if (normalized === "oz" || normalized.startsWith("ounce")) return "oz";
  return unit;
}

function normalizeSizes(value: string): string {
  return value.replace(
    new RegExp(SIZE_PATTERN.source, "gi"),
    (_match, amount: string, unit: string) => `${amount}${normalizeUnit(unit)}`,
  );
}

function extractSize(value: string): string {
  return normalizeSizes(value).match(/\b\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz)\b/i)?.[0] ?? "";
}

function normalizeKnownPhrases(value: string): string {
  return value
    .replace(/\bHair and Body\b/gi, "Hair & Body")
    .replace(/\bBath and Wash\b/gi, "Bath & Wash")
    .replace(/\bScars and Stretch Marks\b/gi, "Scars & Stretch Marks")
    .replace(/\bCabinets and Drawers\b/gi, "Cabinets & Drawers");
}

export function buildRetailProductTitle(source: KeepaTitleSource): RetailTitleResult {
  const sourceTitle = cleanup(text(source.Title));
  let title = normalizeSizes(sourceTitle)
    .replace(/\(\s*1\s*x\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*\)/gi, "$1")
    .replace(/\(\s*1x\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*\)/gi, "$1")
    .replace(/\(\s*pack\s+of\s+1\s*\)/gi, "")
    .replace(/,\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*$/i, " $1");

  title = cleanup(normalizeKnownPhrases(title));

  const size = extractSize(title);

  const warnings: string[] = [];
  const brand = cleanup(text(source.Brand) || text(source.Manufacturer));
  if (!brand || /^(?:unknown|brand|n\/a)$/i.test(brand)) warnings.push("missing_brand");
  if (!size) warnings.push("missing_size");
  if (title.length > 90) warnings.push("title_over_90_characters");
  if (title.length < 12) warnings.push("title_too_short");
  if (/^\d+\s*[x×]\s+/i.test(title)) warnings.push("leading_wholesale_quantity");
  if (/^\d{2,}\s+(?!ml\b|g\b|oz\b)/i.test(title)) warnings.push("suspicious_leading_number");
  if (/^[2-9]\s+(?!in1\b)/i.test(title)) warnings.push("possible_wholesale_quantity");
  if (SOURCE_QUALITY_PATTERN.test(sourceTitle)) warnings.push("source_title_needs_review");
  if (MARKETING_PATTERN.test(title)) warnings.push("marketing_language_remaining");

  const litreMatch = title.match(/\b(\d+(?:\.\d+)?)L\b/);
  if (litreMatch && Number(litreMatch[1]) > 20) warnings.push("suspicious_volume");

  if (!title) {
    title = sourceTitle || "Untitled product";
    warnings.push("fallback_to_source_title");
  }

  return { title, warnings };
}
