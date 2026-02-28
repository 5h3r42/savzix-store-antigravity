type ProductTaxonomyCandidate = {
  name: string;
  brand?: string | null;
  category?: string | null;
};

export type ProductTaxonomyClassification = {
  primaryPath: string | null;
  secondaryPaths: string[];
  matchedRule: string | null;
};

const CELEBRITY_FRAGRANCE_KEYWORDS = [
  "britney spears",
];

const MEN_KEYWORDS = [
  " for men",
  " men's",
  " mens",
  " man ",
  " male ",
  "after shave",
  "aftershave",
];

const WOMEN_KEYWORDS = [
  " for women",
  " women's",
  " womens",
  " woman ",
  " ladies",
  " femme",
];

const HOME_FRAGRANCE_KEYWORDS = [
  "candle",
  "air freshener",
  "diffuser",
  "wax melt",
  "car jar",
  "room spray",
];

const FRAGRANCE_KEYWORDS = [
  "fragrance",
  "perfume",
  "eau de toilette",
  "eau de parfum",
  "edt",
  "edp",
  "cologne",
  "parfum",
  "body spray",
  "scent",
  "club de nuit",
  "fantasy",
  ...HOME_FRAGRANCE_KEYWORDS,
];

const GIFT_SET_KEYWORDS = [
  "gift set",
  "giftset",
  "giftpack",
  "gift box",
  "grooming kit",
  "skincare trio",
  "routine kit",
  "starter kit",
  "3-piece set",
  "3 piece set",
];

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/‚Äì|‚Äî|â€“|â€”/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(haystack: string, values: string[]) {
  return values.some((value) => haystack.includes(value));
}

function topLevelPath(path: string) {
  return path.split("/")[0] ?? path;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function classifyGiftSet(haystack: string): ProductTaxonomyClassification {
  if (containsAny(haystack, ["whisky", "wine", "gin", "vodka", "rum", "alcohol"])) {
    return {
      primaryPath: "gift-sets/alcohol",
      secondaryPaths: ["gift-sets"],
      matchedRule: "gift-sets/alcohol",
    };
  }

  if (containsAny(haystack, FRAGRANCE_KEYWORDS)) {
    return {
      primaryPath: "gift-sets/fragrance",
      secondaryPaths: ["fragrance"],
      matchedRule: "gift-sets/fragrance",
    };
  }

  if (
    containsAny(haystack, [
      "shampoo",
      "conditioner",
      "hair",
      "pomade",
      "serum",
      "moisturiser",
      "face wash",
      "cleanser",
      "skincare",
      "eylure",
      "lashes",
      "foundation",
    ])
  ) {
    return {
      primaryPath: "gift-sets/beauty",
      secondaryPaths: ["beauty-skincare"],
      matchedRule: "gift-sets/beauty",
    };
  }

  return {
    primaryPath: "gift-sets/toiletries",
    secondaryPaths: ["toiletries"],
    matchedRule: "gift-sets/toiletries",
  };
}

function classifyElectrical(haystack: string): ProductTaxonomyClassification | null {
  if (containsAny(haystack, ["battery", "batteries"])) {
    return {
      primaryPath: "electrical/batteries",
      secondaryPaths: ["electrical"],
      matchedRule: "electrical/batteries",
    };
  }

  if (
    containsAny(haystack, [
      "electric toothbrush",
      "rechargeable toothbrush",
      "vitality 100",
    ])
  ) {
    return {
      primaryPath: "electrical/electrical-dental",
      secondaryPaths: ["toiletries/dental-care", "electrical"],
      matchedRule: "electrical/electrical-dental",
    };
  }

  if (containsAny(haystack, ["diffuser", "uk plug", "plug-in"])) {
    return {
      primaryPath: "electrical/electrical-health-wellbeing",
      secondaryPaths: ["electrical", "fragrance"],
      matchedRule: "electrical/electrical-health-wellbeing",
    };
  }

  if (containsAny(haystack, ["hair dryer", "straightener", "styler", "curler"])) {
    return {
      primaryPath: "electrical/hair-styling-tools",
      secondaryPaths: ["electrical"],
      matchedRule: "electrical/hair-styling-tools",
    };
  }

  if (containsAny(haystack, ["shaver", "trimmer", "clipper"])) {
    if (containsAny(haystack, WOMEN_KEYWORDS)) {
      return {
        primaryPath: "electrical/female-grooming-tools",
        secondaryPaths: ["electrical"],
        matchedRule: "electrical/female-grooming-tools",
      };
    }

    return {
      primaryPath: "electrical/male-grooming-tools",
      secondaryPaths: ["electrical"],
      matchedRule: "electrical/male-grooming-tools",
    };
  }

  if (containsAny(haystack, ["optical fiber", "colour-changing christmas tree", "color-changing christmas tree"])) {
    return {
      primaryPath: "electrical/home-appliances",
      secondaryPaths: ["electrical"],
      matchedRule: "electrical/home-appliances",
    };
  }

  return null;
}

function classifyHealth(haystack: string): ProductTaxonomyClassification | null {
  if (containsAny(haystack, ["cbd", "cannabidiol"])) {
    return {
      primaryPath: "health-wellness/cbd",
      secondaryPaths: ["health-wellness"],
      matchedRule: "health-wellness/cbd",
    };
  }

  if (
    containsAny(haystack, [
      "baby",
      "newborn",
      "nappy",
      "dummy",
      "bottle",
      "closer to nature",
      "transition cup",
      "soother",
      "babyschnuller",
    ])
  ) {
    return {
      primaryPath: "health-wellness/baby-child-health",
      secondaryPaths: ["health-wellness"],
      matchedRule: "health-wellness/baby-child-health",
    };
  }

  if (containsAny(haystack, ["condom", "lube", "sexual"])) {
    return {
      primaryPath: "health-wellness/lifestyle-personal-health",
      secondaryPaths: ["health-wellness"],
      matchedRule: "health-wellness/lifestyle-personal-health",
    };
  }

  if (containsAny(haystack, ["plaster", "bandage", "antiseptic", "wound", "first aid"])) {
    return {
      primaryPath: "health-wellness/first-aid",
      secondaryPaths: ["health-wellness"],
      matchedRule: "health-wellness/first-aid",
    };
  }

  if (
    containsAny(haystack, [
      "tablet",
      "capsule",
      "supplement",
      "vitamin",
      "balm",
      "muscle rub",
      "energy",
      "panthenol",
      "nappy rash",
    ])
  ) {
    return {
      primaryPath: "health-wellness/medicine-treatment",
      secondaryPaths: ["health-wellness"],
      matchedRule: "health-wellness/medicine-treatment",
    };
  }

  return null;
}

function classifyToiletries(haystack: string): ProductTaxonomyClassification | null {
  if (containsAny(haystack, ["femfresh", "feminine", "intimate"])) {
    return {
      primaryPath: "toiletries/feminine-hygiene",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/feminine-hygiene",
    };
  }

  if (
    containsAny(haystack, [
      "toothpaste",
      "toothbrush",
      "mouthwash",
      "dental floss",
      "toothpowder",
      "oral-b",
      "colgate",
      "pearl drops",
      "eucryl",
    ])
  ) {
    return {
      primaryPath: "toiletries/dental-care",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/dental-care",
    };
  }

  if (
    containsAny(haystack, [
      "shampoo",
      "conditioner",
      "pomade",
      "hair serum",
      "anti frizz",
      "haircare",
      "hair care",
      "hair mask",
      "restructuring mask",
      "hair color",
      "hair colour",
      "haircolor",
      "styling powder",
      "volumising styling",
      "volumizing styling",
      "spiking glue",
      "bleached hair",
      "dry damaged hair",
      "hairdresser's invisible oil",
      "american crew",
      "fanola",
      "fudge",
      "got2b",
      "head & shoulders",
      "schwarzkopf",
      "tigi",
      "bumble and bumble",
    ])
  ) {
    return {
      primaryPath: "toiletries/hair-care",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/hair-care",
    };
  }

  if (
    containsAny(haystack, [
      "razor",
      "beard",
      "after shave",
      "aftershave",
      "shaving",
      "grooming",
      "deodorant",
      "wilkinson sword",
      "gillette",
      "old spice",
    ])
  ) {
    if (containsAny(haystack, WOMEN_KEYWORDS) || containsAny(haystack, ["intuition", "quattro for women"])) {
      return {
        primaryPath: "toiletries/womens-toiletries",
        secondaryPaths: ["toiletries"],
        matchedRule: "toiletries/womens-toiletries",
      };
    }

    return {
      primaryPath: "toiletries/mens-toiletries",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/mens-toiletries",
    };
  }

  if (containsAny(haystack, ["wipe", "wipes", "tissue", "tissues", "kleenex"])) {
    return {
      primaryPath: "toiletries/wipes-tissues",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/wipes-tissues",
    };
  }

  if (
    containsAny(haystack, [
      "soap",
      "body wash",
      "shower gel",
      "hand wash",
      "bath oil",
      "daily wash",
      "washing-up",
    ])
  ) {
    return {
      primaryPath: "toiletries/washing-bathing",
      secondaryPaths: ["toiletries"],
      matchedRule: "toiletries/washing-bathing",
    };
  }

  return null;
}

function classifyBeauty(haystack: string): ProductTaxonomyClassification | null {
  if (containsAny(haystack, ["nail", "polish", "manicure", "pedicure", "cuticle"])) {
    return {
      primaryPath: "beauty-skincare/nails",
      secondaryPaths: ["beauty-skincare"],
      matchedRule: "beauty-skincare/nails",
    };
  }

  if (
    containsAny(haystack, [
      "foundation",
      "eyelash",
      "lashes",
      "false eyelashes",
      "cosmetics",
      "make-up",
      "makeup",
      "palette",
    ])
  ) {
    return {
      primaryPath: "beauty-skincare/cosmetics",
      secondaryPaths: ["beauty-skincare"],
      matchedRule: "beauty-skincare/cosmetics",
    };
  }

  if (
    containsAny(haystack, [
      "moisturis",
      "micellar",
      "cleanser",
      "serum",
      "cream",
      "lotion",
      "balm",
      "ceramide",
      "hyaluronic",
      "sensitive skin",
      "body lotion",
      "exfoliator",
      "hydro boost",
      "nivea",
      "neutrogena",
      "lip therapy",
      "lip balm",
      "cocoa butter",
      "body mist",
      "self-tanning",
      "self tanning",
      "after-shower",
      "skin",
      "bio oil",
      "bioderma",
      "cerave",
      "aveeno",
      "bondi sands",
    ])
  ) {
    return {
      primaryPath: "beauty-skincare/skin-care",
      secondaryPaths: ["beauty-skincare"],
      matchedRule: "beauty-skincare/skin-care",
    };
  }

  return null;
}

function classifySuncareTravel(haystack: string): ProductTaxonomyClassification | null {
  if (containsAny(haystack, ["spf", "sun cream", "sun lotion", "suncare", "after sun", "sunscreen"])) {
    return {
      primaryPath: "suncare-travel/suncare",
      secondaryPaths: ["suncare-travel"],
      matchedRule: "suncare-travel/suncare",
    };
  }

  if (containsAny(haystack, ["travel size", "travel", "mini"])) {
    return {
      primaryPath: "suncare-travel/travel",
      secondaryPaths: ["suncare-travel"],
      matchedRule: "suncare-travel/travel",
    };
  }

  return null;
}

function classifyFragrance(haystack: string): ProductTaxonomyClassification | null {
  if (!containsAny(haystack, FRAGRANCE_KEYWORDS)) {
    return null;
  }

  if (containsAny(haystack, HOME_FRAGRANCE_KEYWORDS)) {
    return {
      primaryPath: "fragrance",
      secondaryPaths: [],
      matchedRule: "fragrance/home",
    };
  }

  if (containsAny(haystack, CELEBRITY_FRAGRANCE_KEYWORDS)) {
    return {
      primaryPath: "fragrance/womens-celebrity-fragrance",
      secondaryPaths: ["fragrance"],
      matchedRule: "fragrance/womens-celebrity-fragrance",
    };
  }

  if (containsAny(haystack, ["unisex"])) {
    return {
      primaryPath: "fragrance/unisex-luxury-fragrance",
      secondaryPaths: ["fragrance"],
      matchedRule: "fragrance/unisex-luxury-fragrance",
    };
  }

  if (containsAny(haystack, WOMEN_KEYWORDS)) {
    return {
      primaryPath: "fragrance/womens-mass-market-fragrance",
      secondaryPaths: ["fragrance"],
      matchedRule: "fragrance/womens-mass-market-fragrance",
    };
  }

  if (containsAny(haystack, MEN_KEYWORDS)) {
    return {
      primaryPath: "fragrance/mens-mass-market-fragrance",
      secondaryPaths: ["fragrance"],
      matchedRule: "fragrance/mens-mass-market-fragrance",
    };
  }

  return {
    primaryPath: "fragrance",
    secondaryPaths: [],
    matchedRule: "fragrance",
  };
}

export function classifyProductTaxonomy(
  candidate: ProductTaxonomyCandidate,
): ProductTaxonomyClassification {
  const haystack = normalize(
    [candidate.name, candidate.brand, candidate.category].filter(Boolean).join(" "),
  );

  if (!haystack) {
    return { primaryPath: null, secondaryPaths: [], matchedRule: null };
  }

  if (containsAny(haystack, GIFT_SET_KEYWORDS)) {
    return classifyGiftSet(haystack);
  }

  const electrical = classifyElectrical(haystack);
  if (electrical) {
    return electrical;
  }

  const health = classifyHealth(haystack);
  if (health) {
    return health;
  }

  const toiletries = classifyToiletries(haystack);
  if (toiletries) {
    return toiletries;
  }

  const beauty = classifyBeauty(haystack);
  if (beauty) {
    return beauty;
  }

  const suncareTravel = classifySuncareTravel(haystack);
  if (suncareTravel) {
    return suncareTravel;
  }

  const fragrance = classifyFragrance(haystack);
  if (fragrance) {
    return fragrance;
  }

  return {
    primaryPath: null,
    secondaryPaths: [],
    matchedRule: null,
  };
}

export function expandCategoryPaths(classification: ProductTaxonomyClassification) {
  if (!classification.primaryPath) {
    return [];
  }

  return unique([
    classification.primaryPath,
    topLevelPath(classification.primaryPath),
    ...classification.secondaryPaths,
  ]);
}
