export type TaxonomyNode = {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  legacyPaths?: string[];
  children?: TaxonomyNode[];
};

export type NavigationCategory = {
  name: string;
  slug: string;
  href: string;
  children?: NavigationCategory[];
};

export type FlatTaxonomyNode = {
  name: string;
  slug: string;
  path: string;
  href: string;
  description?: string;
  sortOrder: number;
  parentPath: string | null;
  legacyPaths: string[];
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeRoutePath(path: string) {
  const decoded = safeDecode(path).trim().toLowerCase();

  if (!decoded) {
    return "/";
  }

  const withLeadingSlash = decoded.startsWith("/") ? decoded : `/${decoded}`;
  const normalizedSlashes = withLeadingSlash.replace(/\/{2,}/g, "/");

  if (normalizedSlashes.length > 1 && normalizedSlashes.endsWith("/")) {
    return normalizedSlashes.slice(0, -1);
  }

  return normalizedSlashes;
}

export function normalizeTaxonomyPath(path: string) {
  const normalizedRoutePath = normalizeRoutePath(path);

  if (normalizedRoutePath === "/") {
    return "";
  }

  return normalizedRoutePath.replace(/^\/c\//, "").replace(/^\//, "");
}

export function toCategoryHref(path: string) {
  const normalizedPath = normalizeTaxonomyPath(path);
  return normalizedPath ? `/c/${normalizedPath}` : "/shop";
}

function joinPath(parentPath: string | null, slug: string) {
  return parentPath ? `${parentPath}/${slug}` : slug;
}

export const taxonomyTree: TaxonomyNode[] = [
  {
    name: "Beauty & Skincare",
    slug: "beauty-skincare",
    description: "Shop cosmetics, nails, and skincare essentials.",
    sortOrder: 0,
    legacyPaths: ["/beauty-skincare", "/beauty"],
    children: [
      {
        name: "Cosmetics",
        slug: "cosmetics",
        description: "Browse face, lip, eye, and everyday cosmetics.",
        sortOrder: 0,
        legacyPaths: ["/beauty-skincare/cosmetics"],
      },
      {
        name: "Nails",
        slug: "nails",
        description: "Explore nail colour, treatments, and manicure essentials.",
        sortOrder: 1,
        legacyPaths: ["/beauty-skincare/nails", "/beauty/nails"],
      },
      {
        name: "Skin Care",
        slug: "skin-care",
        description: "Discover cleansers, moisturisers, serums, and skin treatments.",
        sortOrder: 2,
        legacyPaths: ["/beauty-skincare/skin-care"],
      },
    ],
  },
  {
    name: "Fragrance",
    slug: "fragrance",
    description: "Explore fragrance picks across women's, men's, luxury, and celebrity scents.",
    sortOrder: 1,
    legacyPaths: ["/fragrance"],
    children: [
      {
        name: "Women's Mass Market Fragrance",
        slug: "womens-mass-market-fragrance",
        description: "Popular women's fragrance choices for everyday wear.",
        sortOrder: 0,
      },
      {
        name: "Men's Mass Market Fragrance",
        slug: "mens-mass-market-fragrance",
        description: "Popular men's fragrance choices for everyday wear.",
        sortOrder: 1,
      },
      {
        name: "Women's Luxury Fragrance",
        slug: "womens-luxury-fragrance",
        description: "Premium women's fragrance collections and giftable picks.",
        sortOrder: 2,
      },
      {
        name: "Men's Luxury Fragrance",
        slug: "mens-luxury-fragrance",
        description: "Premium men's fragrance collections and signature scents.",
        sortOrder: 3,
      },
      {
        name: "Unisex Luxury Fragrance",
        slug: "unisex-luxury-fragrance",
        description: "Luxury unisex scents for versatile fragrance wardrobes.",
        sortOrder: 4,
      },
      {
        name: "Women's Celebrity Fragrance",
        slug: "womens-celebrity-fragrance",
        description: "Celebrity-led fragrance picks for women's gifting and personal use.",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Gift Sets",
    slug: "gift-sets",
    description: "Discover ready-to-gift beauty, fragrance, toiletries, and alcohol sets.",
    sortOrder: 2,
    legacyPaths: ["/gift-sets"],
    children: [
      {
        name: "Beauty",
        slug: "beauty",
        description: "Beauty gift set picks for self-care and gifting.",
        sortOrder: 0,
      },
      {
        name: "Fragrance",
        slug: "fragrance",
        description: "Fragrance gift sets for daily use and special occasions.",
        sortOrder: 1,
      },
      {
        name: "Toiletries",
        slug: "toiletries",
        description: "Toiletry gift sets for travel, care, and practical gifting.",
        sortOrder: 2,
      },
      {
        name: "Alcohol",
        slug: "alcohol",
        description: "Alcohol gift sets for celebrations and occasions.",
        sortOrder: 3,
      },
    ],
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Everyday wellness, treatment, and personal health essentials.",
    sortOrder: 3,
    legacyPaths: ["/health-wellness"],
    children: [
      {
        name: "Medicine & Treatment",
        slug: "medicine-treatment",
        description: "Medicine and treatment essentials for everyday care.",
        sortOrder: 0,
      },
      {
        name: "First Aid",
        slug: "first-aid",
        description: "First aid must-haves for home, travel, and work.",
        sortOrder: 1,
      },
      {
        name: "Baby & Child Health",
        slug: "baby-child-health",
        description: "Wellness essentials for babies and children.",
        sortOrder: 2,
      },
      {
        name: "Lifestyle & Personal Health",
        slug: "lifestyle-personal-health",
        description: "Personal wellbeing essentials for everyday routines.",
        sortOrder: 3,
      },
      {
        name: "CBD",
        slug: "cbd",
        description: "CBD-led wellness products and related essentials.",
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Suncare & Travel",
    slug: "suncare-travel",
    description: "Shop suncare and travel-ready everyday essentials.",
    sortOrder: 4,
    legacyPaths: ["/suncare-travel"],
    children: [
      {
        name: "Suncare",
        slug: "suncare",
        description: "Sun protection and after-sun care for everyday use and holidays.",
        sortOrder: 0,
      },
      {
        name: "Travel",
        slug: "travel",
        description: "Travel-size essentials and practical on-the-go picks.",
        sortOrder: 1,
      },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    description: "Shop practical electrical, grooming, and wellbeing tools.",
    sortOrder: 5,
    legacyPaths: ["/electrical"],
    children: [
      {
        name: "Batteries",
        slug: "batteries",
        description: "Everyday batteries and portable power essentials.",
        sortOrder: 0,
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        description: "Electrical appliances for home convenience and everyday use.",
        sortOrder: 1,
      },
      {
        name: "Health & Personal Appliances",
        slug: "health-personal-appliances",
        description: "Electrical devices for personal care and home wellbeing.",
        sortOrder: 2,
      },
      {
        name: "Electrical Dental",
        slug: "electrical-dental",
        description: "Electrical dental-care tools and accessories.",
        sortOrder: 3,
      },
      {
        name: "Hair Styling Tools",
        slug: "hair-styling-tools",
        description: "Hair tools for styling, drying, and finishing.",
        sortOrder: 4,
      },
      {
        name: "Male Grooming Tools",
        slug: "male-grooming-tools",
        description: "Electrical grooming tools curated for men.",
        sortOrder: 5,
      },
      {
        name: "Female Grooming Tools",
        slug: "female-grooming-tools",
        description: "Electrical grooming tools curated for women.",
        sortOrder: 6,
      },
      {
        name: "Electrical Health & Wellbeing",
        slug: "electrical-health-wellbeing",
        description: "Electrical devices that support everyday wellbeing.",
        sortOrder: 7,
      },
    ],
  },
  {
    name: "Toiletries",
    slug: "toiletries",
    description: "Shop bathing, dental, hair, hygiene, and family toiletries.",
    sortOrder: 6,
    legacyPaths: ["/toiletries"],
    children: [
      {
        name: "Washing & Bathing",
        slug: "washing-bathing",
        description: "Body wash, soaps, and bathing essentials.",
        sortOrder: 0,
      },
      {
        name: "Dental Care",
        slug: "dental-care",
        description: "Toothpaste, brushes, and oral-care essentials.",
        sortOrder: 1,
      },
      {
        name: "Hair Care",
        slug: "hair-care",
        description: "Haircare staples for cleansing, care, and styling.",
        sortOrder: 2,
      },
      {
        name: "Men's Toiletries",
        slug: "mens-toiletries",
        description: "Everyday toiletries and grooming essentials for men.",
        sortOrder: 3,
      },
      {
        name: "Women's Toiletries",
        slug: "womens-toiletries",
        description: "Everyday toiletries and personal-care essentials for women.",
        sortOrder: 4,
      },
      {
        name: "Children's Toiletries",
        slug: "childrens-toiletries",
        description: "Toiletries and care essentials for children.",
        sortOrder: 5,
      },
      {
        name: "Feminine Hygiene",
        slug: "feminine-hygiene",
        description: "Feminine hygiene essentials for everyday care.",
        sortOrder: 6,
      },
      {
        name: "Wipes & Tissues",
        slug: "wipes-tissues",
        description: "Practical wipes and tissues for home, travel, and family use.",
        sortOrder: 7,
      },
    ],
  },
];

function flattenTaxonomy(
  nodes: TaxonomyNode[],
  parentPath: string | null = null,
): FlatTaxonomyNode[] {
  return nodes.flatMap((node) => {
    const path = joinPath(parentPath, node.slug);
    const flatNode: FlatTaxonomyNode = {
      name: node.name,
      slug: node.slug,
      path,
      href: toCategoryHref(path),
      description: node.description,
      sortOrder: node.sortOrder ?? 0,
      parentPath,
      legacyPaths: (node.legacyPaths ?? []).map(normalizeRoutePath),
    };

    return [
      flatNode,
      ...flattenTaxonomy(node.children ?? [], path),
    ];
  });
}

function buildNavigationCategories(
  nodes: TaxonomyNode[],
  parentPath: string | null = null,
): NavigationCategory[] {
  return nodes
    .slice()
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((node) => {
      const path = joinPath(parentPath, node.slug);
      const children = buildNavigationCategories(node.children ?? [], path);

      return {
        name: node.name,
        slug: node.slug,
        href: toCategoryHref(path),
        children: children.length > 0 ? children : undefined,
      };
    });
}

export const flatTaxonomy = flattenTaxonomy(taxonomyTree);
export const navigationCategories = buildNavigationCategories(taxonomyTree);
const taxonomyNodeByPath = new Map(flatTaxonomy.map((node) => [node.path, node] as const));

export function getTaxonomyNodeByPath(path: string) {
  const normalizedPath = normalizeTaxonomyPath(path);
  return taxonomyNodeByPath.get(normalizedPath) ?? null;
}

const legacyPathMap = new Map<string, string>([
  ...flatTaxonomy.flatMap((node) =>
    node.legacyPaths.map((legacyPath) => [legacyPath, node.path] as const),
  ),
  ["/beauty-skincare/cosmetics/face-cosmetics", "beauty-skincare/cosmetics"],
  ["/beauty-skincare/cosmetics/eye-cosmetics", "beauty-skincare/cosmetics"],
  ["/beauty-skincare/cosmetics/lip-cosmetics", "beauty-skincare/cosmetics"],
  ["/beauty-skincare/cosmetics/make-up-remover", "beauty-skincare/cosmetics"],
  ["/beauty-skincare/cosmetics/cosmetic-tools-accessories", "beauty-skincare/cosmetics"],
  ["/beauty-skincare/cosmetics/cosmetic-gift-sets", "gift-sets/beauty"],
  ["/beauty-skincare/cosmetics/cosmetic-palettes", "beauty-skincare/cosmetics"],
  ["/beauty/nails/nail-polish", "beauty-skincare/nails"],
  ["/beauty/nails/false-nails", "beauty-skincare/nails"],
  ["/beauty/nails/nail-polish-remover", "beauty-skincare/nails"],
  ["/beauty/nails/nail-treatment", "beauty-skincare/nails"],
  ["/beauty/nails/nail-tools-accessories", "beauty-skincare/nails"],
  ["/beauty/nails/nail-gift-sets", "gift-sets/beauty"],
  ["/beauty-skincare/skin-care/face-moisturisers-serums", "beauty-skincare/skin-care"],
  ["/beauty-skincare/skin-care/body-moisturiser-lotion", "beauty-skincare/skin-care"],
  ["/beauty-skincare/skin-care/cleanser-toner", "beauty-skincare/skin-care"],
  ["/beauty-skincare/skin-care/eye-cream", "beauty-skincare/skin-care"],
  ["/beauty-skincare/skin-care/hand-foot-cream", "beauty-skincare/skin-care"],
  ["/beauty-skincare/skin-care/treatments-face-masks", "beauty-skincare/skin-care"],
]);

export function resolveLegacyCategoryPath(legacyPath: string) {
  return legacyPathMap.get(normalizeRoutePath(legacyPath)) ?? null;
}
