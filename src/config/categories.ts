import {
  navigationCategories,
  normalizeRoutePath,
} from "@/config/category-taxonomy";

export type Category = {
  name: string;
  slug: string;
  href: string;
  children?: Category[];
};

export const categories: Category[] = navigationCategories;

export function normalizeCategoryPath(path: string) {
  return normalizeRoutePath(path);
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
