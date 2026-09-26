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

const PRODUCT_SIZE_PATTERN = /\b\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz)\b/i;

const TITLE_OVERRIDES: Record<string, string> = {
  "1 x elastic knee support running copressions sleeves sports knee injury":
    "Elastic Knee Support Compression Sleeve",
  "12 Pack Aqua Clean Baby Wet Wipes (72 Wipes) 99% Water 100% Biodegradable Plastic Free":
    "Aqua Clean Baby Wet Wipes, 72 Wipes, Pack of 12",
  "2 Anti Yellow CleanFudge Clean Blonde Violet Toning Shampoo 250 ml":
    "Fudge Clean Blonde Violet Toning Shampoo 250ml",
  "2-Pack Denture Toothbrushes for Cleaning & Care – Soft Bristles, Ergonomic Handle, Ideal for Dentures & Partials":
    "Pristine Gleam Denture Toothbrushes, Pack of 2",
  "(2 PACK)Lynx AFRICA Anti Perspirant DRY 48h (2 x 150ml)":
    "Lynx Africa Dry Antiperspirant 150ml, Pack of 2",
  "(3 PACK) Toni & Guy Men 2 in 1 Anti Dandruff Shampoo & Conditioner 2 x 250ml & Toni & Guy Men Deep Clean Shampoo x 250ml":
    "Toni & Guy Men's Shampoo & Conditioner Set, 3 x 250ml",
  "3 x Old Spice Wolfthorn After Shave Lotion 100 ml Shaving Water For Man":
    "Old Spice Wolfthorn Aftershave Lotion 100ml, Pack of 3",
  "3 colgate EXTRA CLEAN medium tooth brush":
    "Colgate Extra Clean Medium Toothbrushes, Pack of 3",
  "4 x Tubs Of Masterplast Freeze Gel 300ml ideal for muscles, cools soothes":
    "Masterplast Freeze Gel 300ml, Pack of 4",
  "4711 Real Cologne Water Shower Gel from the Fragrance Classic 4711 – has a beneficial effect on body, mind and soul | 200 ml":
    "4711 Original Eau de Cologne Shower Gel 200ml",
  "75 Pack Dental Floss Sticks D Shape Tooth Floss Picks Premium Polymer Threads Easy to Use, Durable & Portable Flossing":
    "D-Shape Dental Floss Picks, Pack of 75",
  "80 Waterproof Mixed palsters Washable First Aid Dressing":
    "Masterplast Waterproof Mixed Plasters, Pack of 80",
  "80 Shave Bic Three Bic Pure 3 Lady Women USA BLADES Shaver Razor Blades and GETTE":
    "BIC Pure 3 Lady Disposable Razors, Pack of 80",
  "150pk Dental Floss Sticks":
    "Pristine Gleam Dental Floss Sticks, Pack of 150",
  "6 PC Face Kit":
    "Royal & Langnickel 6-Piece Face Brush Kit",
  "BABOR gift set with various serum ampoules, For moisture, regeneration and firmness, Vegan formula, The White Collection, 7 x 2 ml":
    "BABOR The White Collection Ampoule Gift Set, 7 x 2ml",
  "Adidas Active Skin & Mind, Energy Deodorant Spray for Men and Women 24 Hours of Protection, 100 ml - Unisex":
    "Adidas Active Skin & Mind Energy Deodorant Spray 100ml, Unisex",
  "Astonish 3 in 1 Multi-Purpose Super Concentrated Disinfectant with Long Lasting Fragrance, Linen Fresh, 300ml":
    "Astonish 3-in-1 Super Concentrated Disinfectant Linen Fresh 300ml",
  "Beauty Formulas BRIGHTENING VITAMIN C Bundle BRIGHTENING Facial Tonic 150ml, Facial Wash 150ml, Daily Moisturiser 100ml, 3 Pieces":
    "Beauty Formulas Vitamin C Skincare Bundle, 3 Pieces",
  "Beauty of Joseon Green Plum Refreshing Cleanser Plum Water + Mung Bean Extract | Daily Korean Skincare Face Cleanser for All Skin Types, pH-Balanced and Non-Drying 100 ml, 3.38 fl. oz":
    "Beauty of Joseon Green Plum Refreshing Cleanser 100ml",
  "Carmen Hair Dryer with Concentrator Nozzle, Three Heat Settings, 2 Speed Settings, 2200W, Black and Grey, C81237BLK":
    "Carmen C81237BLK Hair Dryer 2200W, Black & Grey",
  "Collection Cosmetics Lip & Cheek Trio, Soft Glow Blusher, Cheek and Lip Stain, Gloss Me Up Lip Gloss, Long Lasting Flush, Makeup Gift Set":
    "Collection Cosmetics Lip & Cheek Trio Makeup Gift Set",
  "Disney Princess Lip Balm Set – 5 Flavored Lip Balms for Kids – Cherry, Sugar, Apple, Strawberry & Grape – Ariel, Cinderella, Tiana, Rapunzel & Jasmine – Fun Moisturizing Lip Care Gift Set for Girls":
    "Disney Princess Flavoured Lip Balm Gift Set, 5 Pieces",
  "Dove Gift Packaging Beauty Routine with Mousse Shower 200 ml, Mousse Face 200 ml, Dove Shower Foam 250 ml, Body Cream Silky 300 ml & Diary Dove":
    "Dove Beauty Routine Gift Set, 4 Pieces",
};

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
  return normalizeSizes(value).match(PRODUCT_SIZE_PATTERN)?.[0] ?? "";
}

function normalizeSourceErrors(value: string, brand: string): string {
  let normalized = value
    .replace(/\bcopressions\b/gi, "compression")
    .replace(/\bpalsters\b/gi, "plasters")
    .replace(/\banitperspirant\b/gi, "antiperspirant")
    .replace(/\bcolagate\b/gi, "Colgate")
    .replace(/\bEngergy\b/g, "Energy")
    .replace(/\bVertiver\b/g, "Vetiver")
    .replace(/\*{2}Despatched Within Double Wall Box\*{2}/gi, "")
    .replace(/\s*-\s*\(With A Free Fridge Magnet\)/gi, "")
    .replace(/\bBack In Stock:\s*/gi, "");

  if (/^Dove$/i.test(brand)) {
    normalized = normalized
      .replace(/\bWHERE Liquid Soap\b/i, "Dove Liquid Soap")
      .replace(/\b250l\b/i, "250ml");
  }

  if (/^Elizabeth Arden$/i.test(brand)) {
    normalized = normalized.replace(/^1342\s+/, "");
  }

  return normalized;
}

function normalizeLeadingPack(value: string): string {
  const match = value.match(/^\(?\s*(\d+)\s*(?:x|×|pack)\s*\)?\s*/i);
  if (!match) return value;

  const quantity = Number(match[1]);
  const remainder = cleanup(value.slice(match[0].length));
  if (!remainder || quantity <= 1) return remainder || value;
  return cleanup(`${remainder}, Pack of ${quantity}`);
}

function removeRedundantTail(value: string): string {
  let normalized = value
    .replace(/\s+-\s+(?:balsamo|mousse capelli|lacca illuminante)[^-]*$/i, "")
    .replace(/\s+-\s+(?:rehydrating mask|intense anti-orange mild shampoo|illuminating serum|silk-effect oil elixir)$/i, "")
    .replace(/\s+\|\s+(?:daily |hot chocolate gift set).*$/i, "")
    .replace(/\s+(?:ideal for muscles,?\s*)?cools soothes$/i, "")
    .replace(/\s+Shaving Water For Man$/i, "")
    .replace(/\s+Each(?=, Pack of \d+$|$)/i, "")
    .replace(/\s+Rich(?=, Pack of \d+$|$)/i, "");

  normalized = normalized.replace(/\s+-\s+(?:Fragrance Family|Top Notes|Heart Notes|Base Notes):.*$/i, "");
  return cleanup(normalized);
}

function shortenLongTitle(value: string): string {
  if (value.length <= 90) return value;

  const size = extractSize(value);
  const pack = value.match(/, Pack of \d+$/i)?.[0] ?? "";
  const suffix = cleanup(`${size}${pack}`);
  let title = value;

  const pipeIndex = title.indexOf(" |");
  if (pipeIndex >= 35) title = title.slice(0, pipeIndex);

  if (title.length > 90) {
    const fragrance = title.match(
      /^(.*?\b(?:Eau de Parfum|Eau de Toilette|Aftershave)(?: Intense)?(?: for (?:Her|Him|Women|Men))?)/i,
    )?.[1];
    if (fragrance) title = fragrance;
  }

  if (title.length > 90) {
    const giftSet = title.match(/^(.*?\b(?:Gift Set|Makeup Gift Set|Bundle))/i)?.[1];
    if (giftSet) title = giftSet;
  }

  if (title.length > 90) {
    const separators = [
      " - Reduces ",
      " - Enhances ",
      ", with ",
      ", For ",
      ", Gentle ",
      ", Citrus Fragrance ",
      ", Woody Fragrance ",
      " Infused with ",
      " Easy Application",
      " to Detangle ",
      " Up to Zero ",
      " Up to 100% ",
      ", Automatic Spray ",
      ", Professional ",
      ", Designed ",
    ];
    for (const separator of separators) {
      const index = title.toLowerCase().indexOf(separator.toLowerCase());
      if (index >= 30) {
        title = title.slice(0, index);
        break;
      }
    }
  }

  if (title.length > 90) {
    const dashIndex = title.indexOf(" - ", 35);
    if (dashIndex >= 35) title = title.slice(0, dashIndex);
  }

  if (title.length > 90) {
    const commaIndex = title.indexOf(",", 45);
    if (commaIndex >= 45) title = title.slice(0, commaIndex);
  }

  if (title.length > 90) {
    const clauseIndex = title.search(/\s+(?:with|featuring|for all|designed for|while)\s+/i);
    if (clauseIndex >= 35) title = title.slice(0, clauseIndex);
  }

  if (suffix && !title.toLowerCase().includes(size.toLowerCase())) {
    title = cleanup(`${title} ${suffix}`);
  }

  return cleanup(title);
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
  const brand = cleanup(text(source.Brand) || text(source.Manufacturer));
  let title = TITLE_OVERRIDES[sourceTitle] ?? normalizeSizes(normalizeSourceErrors(sourceTitle, brand))
    .replace(/\(\s*1\s*x\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*\)/gi, "$1")
    .replace(/\(\s*1x\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*\)/gi, "$1")
    .replace(/\(\s*pack\s+of\s+1\s*\)/gi, "")
    .replace(/,\s*(\d+(?:\.\d+)?(?:fl oz|ml|cl|kg|g|L|oz))\s*$/i, " $1");

  title = cleanup(normalizeKnownPhrases(title));
  title = normalizeLeadingPack(title);
  title = removeRedundantTail(title);
  title = shortenLongTitle(title);

  const size = extractSize(title);

  const warnings: string[] = [];
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
