export type Category = {
  name: string;
  slug: string;
  href: string;
  children?: Category[];
};

export const categories: Category[] = [
  {
    name: "Beauty & Skincare",
    slug: "beauty-skincare",
    href: "/beauty-skincare",
    children: [
      {
        name: "Cosmetics",
        slug: "cosmetics",
        href: "/beauty-skincare/cosmetics",
        children: [
          {
            name: "Face Cosmetics",
            slug: "face-cosmetics",
            href: "/beauty-skincare/cosmetics/face-cosmetics",
          },
          {
            name: "Eye Cosmetics",
            slug: "eye-cosmetics",
            href: "/beauty-skincare/cosmetics/eye-cosmetics",
          },
          {
            name: "Lip Cosmetics",
            slug: "lip-cosmetics",
            href: "/beauty-skincare/cosmetics/lip-cosmetics",
          },
          {
            name: "Make-Up Remover",
            slug: "make-up-remover",
            href: "/beauty-skincare/cosmetics/make-up-remover",
          },
          {
            name: "Cosmetic Tools & Accessories",
            slug: "cosmetic-tools-accessories",
            href: "/beauty-skincare/cosmetics/cosmetic-tools-accessories",
          },
          {
            name: "Cosmetic Gift Sets",
            slug: "cosmetic-gift-sets",
            href: "/beauty-skincare/cosmetics/cosmetic-gift-sets",
          },
          {
            name: "Cosmetic Palettes",
            slug: "cosmetic-palettes",
            href: "/beauty-skincare/cosmetics/cosmetic-palettes",
          },
        ],
      },
      {
        name: "Nails",
        slug: "nails",
        href: "/beauty/nails",
        children: [
          {
            name: "Nail Polish",
            slug: "nail-polish",
            href: "/beauty/nails/nail-polish",
          },
          {
            name: "False Nails",
            slug: "false-nails",
            href: "/beauty/nails/false-nails",
          },
          {
            name: "Nail Polish Remover",
            slug: "nail-polish-remover",
            href: "/beauty/nails/nail-polish-remover",
          },
          {
            name: "Nail Treatment",
            slug: "nail-treatment",
            href: "/beauty/nails/nail-treatment",
          },
          {
            name: "Nail Tools & Accessories",
            slug: "nail-tools-accessories",
            href: "/beauty/nails/nail-tools-accessories",
          },
          {
            name: "Nail Gift Sets",
            slug: "nail-gift-sets",
            href: "/beauty/nails/nail-gift-sets",
          },
        ],
      },
      {
        name: "Skin Care",
        slug: "skin-care",
        href: "/beauty-skincare/skin-care",
        children: [
          {
            name: "Face Moisturisers & Serums",
            slug: "face-moisturisers-serums",
            href: "/beauty-skincare/skin-care/face-moisturisers-serums",
          },
          {
            name: "Body Moisturiser & Lotion",
            slug: "body-moisturiser-lotion",
            href: "/beauty-skincare/skin-care/body-moisturiser-lotion",
          },
          {
            name: "Cleanser & Toner",
            slug: "cleanser-toner",
            href: "/beauty-skincare/skin-care/cleanser-toner",
          },
          {
            name: "Eye Cream",
            slug: "eye-cream",
            href: "/beauty-skincare/skin-care/eye-cream",
          },
          {
            name: "Hand & Foot Cream",
            slug: "hand-foot-cream",
            href: "/beauty-skincare/skin-care/hand-foot-cream",
          },
          {
            name: "Treatments & Face Masks",
            slug: "treatments-face-masks",
            href: "/beauty-skincare/skin-care/treatments-face-masks",
          },
        ],
      },
    ],
  },
  {
    name: "Fragrance",
    slug: "fragrance",
    href: "/fragrance",
  },
  {
    name: "Gift Sets",
    slug: "gift-sets",
    href: "/gift-sets",
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    href: "/health-wellness",
  },
  {
    name: "Suncare & Travel",
    slug: "suncare-travel",
    href: "/suncare-travel",
  },
  {
    name: "Electrical",
    slug: "electrical",
    href: "/electrical",
  },
  {
    name: "Toiletries",
    slug: "toiletries",
    href: "/toiletries",
  },
];

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeCategoryPath(path: string) {
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

function flattenCategoryTree(nodes: Category[]): Category[] {
  const flattened: Category[] = [];

  for (const node of nodes) {
    flattened.push(node);

    if (node.children?.length) {
      flattened.push(...flattenCategoryTree(node.children));
    }
  }

  return flattened;
}

const flattenedCategories = flattenCategoryTree(categories);
const categoryHrefEntries = flattenedCategories.map((category) => [
  normalizeCategoryPath(category.href),
  category.name,
] as const);

const categoryHrefSet = new Set(categoryHrefEntries.map(([href]) => href));
const categoryNameByHref = new Map(categoryHrefEntries);

export function getAllCategoryPaths() {
  return [...categoryHrefSet];
}

export function isKnownCategoryPath(path: string) {
  return categoryHrefSet.has(normalizeCategoryPath(path));
}

export function getCategoryNameForPath(path: string) {
  return categoryNameByHref.get(normalizeCategoryPath(path));
}
