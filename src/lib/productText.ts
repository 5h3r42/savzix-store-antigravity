import { normalizeText } from "@/lib/normalizeText";

type DescriptionContext = {
  brand?: string;
  title?: string;
  category?: string;
};

const WEIRD_ENCODING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/‚Äî/g, "—"],
  [/‚Äì/g, "–"],
  [/â€”/g, "—"],
  [/â€“/g, "–"],
  [/â€™/g, "’"],
  [/â€˜/g, "‘"],
  [/â€œ/g, '"'],
  [/â€\x9d/g, '"'],
  [/Â/g, ""],
  [/\u00a0/g, " "],
];

const TRAILING_PACK_PATTERNS: RegExp[] = [
  /\s*\((?:pack\s*of\s*\d+|\d+\s*-\s*pack|\d+\s*pack|x\s*\d+|twin\s*pack)\)\s*$/i,
  /\s*(?:,|[-–—|])?\s*(?:pack\s*of\s*\d+|\d+\s*-\s*pack|\d+\s*pack|x\s*\d+|twin\s*pack)\s*$/i,
];

const NON_RETAIL_BENEFIT_PATTERNS: RegExp[] = [
  /\b(?:performance|analytics?|metrics?|roi|margin|profit|data|dataset)\b/i,
  /\b(?:amazon|fba|asin|seller|listing|catalog|marketplace|ranking|conversion)\b/i,
  /\b(?:keyword|traffic|ad(?:s|vertising)?|inventory|fulfillment)\b/i,
  /\b(?:reliable performance data|commercial use|resale|wholesale)\b/i,
];

function cleanupSpacing(value: string): string {
  return value
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/([,.;:!?]){2,}/g, "$1")
    .replace(/^[\s,.;:!?|–—-]+|[\s,.;:!?|–—-]+$/g, "")
    .trim();
}

function sanitizeRawText(value: string): string {
  // ADDED: normalize common mojibake artifacts before applying text cleanup rules.
  let normalized = value ?? "";

  for (const [pattern, replacement] of WEIRD_ENCODING_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalizeText(normalized);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveBrand(brand: string | undefined, title: string): string {
  const cleanedBrand = stripAmazonArtifacts(brand ?? "");
  if (cleanedBrand && !/^brand$/i.test(cleanedBrand)) {
    return cleanedBrand;
  }

  const firstWord = cleanTitle(title).split(/\s+/).find(Boolean);
  return firstWord ?? "this brand";
}

function deriveCoreProductType(title: string, brand: string, category?: string): string {
  let core = cleanTitle(title);
  if (!core) {
    return category ? `${stripAmazonArtifacts(category)} product` : "product";
  }

  if (brand && brand !== "this brand") {
    const brandPrefix = new RegExp(`^${escapeRegExp(brand)}\\s+`, "i");
    core = core.replace(brandPrefix, "");
  }

  const beforeComma = core.split(",")[0]?.trim();
  if (beforeComma && beforeComma.length >= 4) {
    core = beforeComma;
  }

  core = core
    .replace(/\b\d+(?:\.\d+)?\s*(?:ml|l|g|kg|oz|fl\s?oz)\b/gi, "")
    .replace(/^[\s,|–—-]+|[\s,|–—-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (core) {
    return core;
  }

  return category ? `${stripAmazonArtifacts(category)} product` : "product";
}

function extractBenefit(text: string, cleanedTitle: string): string {
  const sanitized = stripAmazonArtifacts(text);
  if (!sanitized) {
    return "";
  }

  const withMatch = sanitized.match(
    /\b(?:with|featuring|infused with|contains)\s+([^.!?]{4,120})/i,
  );
  if (withMatch?.[1]) {
    return withMatch[1].replace(/[.]+$/g, "").trim();
  }

  const sentences = sanitized
    .split(/[.!?]+/)
    .map((part) =>
      part
        .replace(/^experience\s+/i, "")
        .replace(/\bperfect\s+for\b.*$/i, "")
        .trim(),
    )
    .filter(Boolean);

  for (const sentence of sentences) {
    if (sentence.length < 8) {
      continue;
    }

    if (/^(amazon|asin|fba)\b/i.test(sentence)) {
      continue;
    }

    if (sentence.toLowerCase() === cleanedTitle.toLowerCase()) {
      continue;
    }

    return sentence;
  }

  return "";
}

function isRetailBenefit(value: string): boolean {
  if (!value) {
    return false;
  }

  const cleaned = cleanupSpacing(value);
  if (cleaned.length < 4) {
    return false;
  }

  if (NON_RETAIL_BENEFIT_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return false;
  }

  return true;
}

function buildSubject(brand: string, coreType: string): string {
  if (!coreType) {
    return brand !== "this brand" ? brand : "";
  }

  if (brand === "this brand") {
    return coreType;
  }

  const startsWithBrand = coreType.toLowerCase().startsWith(brand.toLowerCase());
  return startsWithBrand ? coreType : `${brand} ${coreType}`;
}

export function stripAmazonArtifacts(text: string): string {
  let value = sanitizeRawText(text ?? "");

  // ADDED: strip platform metadata and marketplace terms from customer-facing copy.
  value = value
    .replace(/\bASIN\s*[:#-]?\s*[A-Z0-9]{8,14}\b/gi, "")
    .replace(/\bperfect\s+for\s+amazon\s*fba(?:\s+sellers?)?\b/gi, "")
    .replace(/\bamazon(?:\.[a-z.]{2,8})?\b/gi, "")
    .replace(/\bfba\b/gi, "");

  return cleanupSpacing(value);
}

export function cleanTitle(title: string): string {
  let cleaned = stripAmazonArtifacts(title ?? "");

  // ADDED: remove trailing pack/quantity noise while preserving meaningful size terms.
  let previous = "";
  while (cleaned && cleaned !== previous) {
    previous = cleaned;
    for (const pattern of TRAILING_PACK_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
    cleaned = cleaned.replace(/[,\s|–—-]+$/g, "").trim();
  }

  return cleanupSpacing(cleaned);
}

export function cleanDescription(desc: string, product: DescriptionContext): string {
  const cleanedTitle = cleanTitle(product.title ?? "");
  const brand = deriveBrand(product.brand, cleanedTitle);
  const coreType = deriveCoreProductType(cleanedTitle, brand, product.category);
  const extractedBenefit = extractBenefit(desc ?? "", cleanedTitle)
    .replace(/^with\s+/i, "")
    .replace(/[.]+$/g, "")
    .trim();
  const benefit = isRetailBenefit(extractedBenefit) ? extractedBenefit : "";
  const subject = buildSubject(brand, coreType);

  // CHANGED: generate short retail-safe copy with deterministic fallback text.
  const generated =
    subject && benefit.length > 0
      ? `${subject} with ${benefit}. Ideal for daily use.`
      : subject
        ? `${subject}. Ideal for daily use.`
        : `A reliable everyday essential from ${brand}. Suitable for regular use.`;

  return stripAmazonArtifacts(generated);
}
