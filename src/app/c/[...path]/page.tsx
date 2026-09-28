import { notFound, redirect } from "next/navigation";
import {
  getTaxonomyNodeByPath,
  normalizeTaxonomyPath,
  toCategoryHref,
} from "@/config/category-taxonomy";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    path: string[];
  }>;
};

function buildCategoryPath(segments: string[]) {
  return normalizeTaxonomyPath(segments.join("/"));
}

function buildShopHref(categoryHref: string) {
  const params = new URLSearchParams({
    categoryPath: categoryHref,
  });

  return `/shop?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: CategoryPageProps) {
  const { path } = await params;
  const categoryPath = buildCategoryPath(path);
  const category = getTaxonomyNodeByPath(categoryPath);

  if (!category) {
    return createPageMetadata({
      title: "Category | SAVZIX",
      description: "Browse product categories at SAVZIX.",
      path: "/shop",
      index: false,
    });
  }

  return createPageMetadata({
    title: `${category.name} | SAVZIX`,
    description:
      category.description ?? `Browse ${category.name.toLowerCase()} at SAVZIX.`,
    path: buildShopHref(toCategoryHref(category.path)),
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { path } = await params;
  const categoryPath = buildCategoryPath(path);
  const category = getTaxonomyNodeByPath(categoryPath); // CHANGED: use config taxonomy instead of DB-backed category records.

  if (!category) {
    notFound();
  }

  redirect(buildShopHref(toCategoryHref(category.path))); // CHANGED: route all live /c/... links into the working filtered shop page.
}
