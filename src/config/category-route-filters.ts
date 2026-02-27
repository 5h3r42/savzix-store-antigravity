import { normalizeCategoryPath } from "@/config/categories";

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
    includeKeywords: ["nail", "polish", "false nails", "manicure", "pedicure"],
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

  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const topLevelPath = `/${segments[0]}`;
  return TOP_LEVEL_CATEGORY_RULES[topLevelPath] ?? null;
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
