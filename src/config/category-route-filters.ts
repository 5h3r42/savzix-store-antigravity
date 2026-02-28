import { normalizeCategoryPath } from "@/config/categories";
import { normalizeTaxonomyPath } from "@/config/category-taxonomy";

export type CategoryRouteFilterRule = {
  includeCategories?: string[];
  includeKeywords?: string[];
  excludeKeywords?: string[];
};

export type CategoryRouteFilterCandidate = {
  title: string;
  category: string;
  brand?: string;
};

const TOP_LEVEL_CATEGORY_RULES: Record<string, CategoryRouteFilterRule> = {
  "/beauty-skincare": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: [
      "beauty",
      "skincare",
      "skin care",
      "cosmetic",
      "make-up",
      "makeup",
      "moistur",
      "serum",
      "cleanser",
      "toner",
      "face mask",
      "eye cream",
      "nail",
      "lip",
    ],
    excludeKeywords: ["electrical", "tv stand", "stationery", "dog poo"],
  },
  "/beauty": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: ["beauty", "cosmetic", "make-up", "makeup", "nail", "skincare"],
  },
  "/fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: [
      "fragrance",
      "perfume",
      "eau de",
      "cologne",
      "aftershave",
      "body spray",
      "deodorant",
      "scent",
    ],
  },
  "/gift-sets": {
    includeCategories: ["Beauty", "Health & Personal Care", "Grocery"],
    includeKeywords: ["gift set", "gift", "set", "bundle"],
  },
  "/health-wellness": {
    includeCategories: ["Health & Personal Care", "Grocery", "Baby Products"],
    includeKeywords: [
      "health",
      "wellness",
      "vitamin",
      "supplement",
      "hygiene",
      "oral care",
      "pain relief",
      "care",
      "medicine",
      "first aid",
      "cbd",
    ],
  },
  "/suncare-travel": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: ["sun", "spf", "suncare", "travel", "mini", "pocket", "portable"],
  },
  "/electrical": {
    includeCategories: ["Electronics & Photo", "Home & Kitchen", "Automotive"],
    includeKeywords: [
      "electric",
      "electrical",
      "battery",
      "charger",
      "device",
      "led",
      "adapter",
      "tv stand",
    ],
  },
  "/toiletries": {
    includeCategories: ["Beauty", "Health & Personal Care", "Grocery"],
    includeKeywords: [
      "toiletries",
      "shampoo",
      "conditioner",
      "soap",
      "body wash",
      "toothpaste",
      "deodorant",
      "shower",
      "hand wash",
      "cleanser",
    ],
  },
};

const EXACT_CATEGORY_RULES: Record<string, CategoryRouteFilterRule> = {
  "/beauty-skincare/cosmetics": {
    includeCategories: ["Beauty"],
    includeKeywords: [
      "cosmetic",
      "make-up",
      "makeup",
      "palette",
      "lip",
      "eye",
      "face cosmetic",
      "remover",
    ],
  },
  "/beauty-skincare/nails": {
    includeCategories: ["Beauty"],
    includeKeywords: ["nail", "polish", "false nails", "manicure", "pedicure", "cuticle"],
  },
  "/beauty/nails": {
    includeCategories: ["Beauty"],
    includeKeywords: ["nail", "polish", "false nails", "manicure", "pedicure", "cuticle"],
  },
  "/beauty-skincare/skin-care": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: [
      "skin care",
      "skincare",
      "moistur",
      "serum",
      "cleanser",
      "toner",
      "eye cream",
      "mask",
      "lotion",
    ],
  },
};

const EXACT_TAXONOMY_RULES: Record<string, CategoryRouteFilterRule> = {
  "beauty-skincare/cosmetics": EXACT_CATEGORY_RULES["/beauty-skincare/cosmetics"],
  "beauty-skincare/nails": EXACT_CATEGORY_RULES["/beauty-skincare/nails"],
  "beauty-skincare/skin-care": EXACT_CATEGORY_RULES["/beauty-skincare/skin-care"],
  "suncare-travel/suncare": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: ["sun", "spf", "suncare", "after sun", "sun cream", "sun lotion"],
  },
  "suncare-travel/travel": {
    includeCategories: ["Beauty", "Health & Personal Care", "Grocery"],
    includeKeywords: ["travel", "mini", "portable", "pocket", "carry on", "travel size"],
  },
  "toiletries/washing-bathing": {
    includeCategories: ["Beauty", "Health & Personal Care", "Grocery"],
    includeKeywords: ["soap", "body wash", "shower", "bath", "washing", "hand wash"],
  },
  "toiletries/dental-care": {
    includeCategories: ["Health & Personal Care", "Beauty"],
    includeKeywords: ["dental", "toothpaste", "toothbrush", "mouthwash", "oral care"],
  },
  "toiletries/hair-care": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: ["hair care", "haircare", "shampoo", "conditioner", "hair mask", "styling"],
  },
  "electrical/batteries": {
    includeCategories: ["Electronics & Photo", "Home & Kitchen", "Automotive"],
    includeKeywords: ["battery", "batteries", "power cell"],
  },
  "health-wellness/first-aid": {
    includeCategories: ["Health & Personal Care"],
    includeKeywords: ["first aid", "bandage", "plaster", "antiseptic", "wound"],
  },
  "health-wellness/medicine-treatment": {
    includeCategories: ["Health & Personal Care", "Grocery"],
    includeKeywords: ["medicine", "treatment", "relief", "pain", "tablet", "capsule"],
  },
  "health-wellness/cbd": {
    includeCategories: ["Health & Personal Care", "Grocery"],
    includeKeywords: ["cbd", "cannabidiol"],
  },
  "gift-sets/beauty": {
    includeCategories: ["Beauty", "Health & Personal Care"],
    includeKeywords: ["beauty gift", "gift set", "cosmetic gift", "nail gift"],
  },
  "gift-sets/fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["fragrance gift", "perfume gift", "gift set", "eau de"],
  },
  "gift-sets/toiletries": {
    includeCategories: ["Beauty", "Health & Personal Care", "Grocery"],
    includeKeywords: ["toiletry gift", "bath gift", "body gift", "gift set"],
  },
  "gift-sets/alcohol": {
    includeCategories: ["Grocery"],
    includeKeywords: ["alcohol", "spirit", "whisky", "wine", "gin", "gift set"],
  },
  "fragrance/womens-mass-market-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["for women", "women", "woman", "ladies", "body mist", "eau de toilette"],
  },
  "fragrance/mens-mass-market-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["for men", "men", "man", "aftershave", "body spray", "eau de toilette"],
  },
  "fragrance/womens-luxury-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["for women", "women", "woman", "parfum", "luxury", "eau de parfum"],
  },
  "fragrance/mens-luxury-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["for men", "men", "man", "parfum", "luxury", "eau de parfum"],
  },
  "fragrance/unisex-luxury-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["unisex", "luxury", "parfum", "niche", "eau de parfum"],
  },
  "fragrance/womens-celebrity-fragrance": {
    includeCategories: ["Beauty"],
    includeKeywords: ["celebrity", "for women", "women", "woman", "perfume"],
  },
};

const TOP_LEVEL_TAXONOMY_RULES: Record<string, CategoryRouteFilterRule> = {
  "beauty-skincare": TOP_LEVEL_CATEGORY_RULES["/beauty-skincare"],
  fragrance: TOP_LEVEL_CATEGORY_RULES["/fragrance"],
  "gift-sets": TOP_LEVEL_CATEGORY_RULES["/gift-sets"],
  "health-wellness": TOP_LEVEL_CATEGORY_RULES["/health-wellness"],
  "suncare-travel": TOP_LEVEL_CATEGORY_RULES["/suncare-travel"],
  electrical: TOP_LEVEL_CATEGORY_RULES["/electrical"],
  toiletries: TOP_LEVEL_CATEGORY_RULES["/toiletries"],
};

function containsAny(haystack: string, values: string[] | undefined) {
  if (!values?.length) {
    return false;
  }

  return values.some((value) => haystack.includes(value.toLowerCase()));
}

function matchesCategory(
  category: string,
  allowedCategories: string[] | undefined,
) {
  if (!allowedCategories?.length) {
    return false;
  }

  const normalizedCategory = category.trim().toLowerCase();
  return allowedCategories.some((allowed) => normalizedCategory === allowed.toLowerCase());
}

export function resolveCategoryRouteFilter(
  requestedPath: string | null | undefined,
) {
  if (!requestedPath) {
    return null;
  }

  const normalizedPath = normalizeCategoryPath(requestedPath);

  if (EXACT_CATEGORY_RULES[normalizedPath]) {
    return EXACT_CATEGORY_RULES[normalizedPath];
  }

  const taxonomyPath = normalizeTaxonomyPath(normalizedPath);

  if (taxonomyPath && EXACT_TAXONOMY_RULES[taxonomyPath]) {
    return EXACT_TAXONOMY_RULES[taxonomyPath];
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return taxonomyPath ? TOP_LEVEL_TAXONOMY_RULES[taxonomyPath] ?? null : null;
  }

  const topLevelPath = `/${segments[0]}`;
  if (TOP_LEVEL_CATEGORY_RULES[topLevelPath]) {
    return TOP_LEVEL_CATEGORY_RULES[topLevelPath];
  }

  const taxonomySegments = taxonomyPath.split("/").filter(Boolean);
  if (taxonomySegments.length === 0) {
    return null;
  }

  return TOP_LEVEL_TAXONOMY_RULES[taxonomySegments[0]] ?? null;
}

export function matchesCategoryRouteFilter(
  product: CategoryRouteFilterCandidate,
  rule: CategoryRouteFilterRule,
) {
  const title = product.title ?? "";
  const category = product.category ?? "";
  const brand = product.brand ?? "";
  const haystack = `${title} ${category} ${brand}`.toLowerCase();

  const hasIncludedCategory = matchesCategory(category, rule.includeCategories);
  const hasIncludedKeyword = containsAny(haystack, rule.includeKeywords);
  const hasIncludeConstraints = Boolean(
    rule.includeCategories?.length || rule.includeKeywords?.length,
  );

  if (hasIncludeConstraints && !hasIncludedCategory && !hasIncludedKeyword) {
    return false;
  }

  if (containsAny(haystack, rule.excludeKeywords)) {
    return false;
  }

  return true;
}
