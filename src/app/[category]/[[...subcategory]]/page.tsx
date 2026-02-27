import { notFound, redirect } from "next/navigation";
import { isKnownCategoryPath, normalizeCategoryPath } from "@/config/categories";

type CategoryLandingRouteProps = {
  params: Promise<{
    category: string;
    subcategory?: string[];
  }>;
};

export default async function CategoryLandingRoute({
  params,
}: CategoryLandingRouteProps) {
  const { category, subcategory } = await params;
  const pathSegments = [category, ...(subcategory ?? [])].filter(Boolean);
  const requestedPath = normalizeCategoryPath(`/${pathSegments.join("/")}`);

  if (!isKnownCategoryPath(requestedPath)) {
    notFound();
  }

  // ADDED: category landing paths resolve into filtered /shop to prevent route 404s.
  redirect(`/shop?categoryPath=${encodeURIComponent(requestedPath)}`);
}
