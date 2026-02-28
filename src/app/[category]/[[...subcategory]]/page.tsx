import { notFound, redirect } from "next/navigation";
import {
  normalizeRoutePath,
  resolveLegacyCategoryPath,
  toCategoryHref,
} from "@/config/category-taxonomy";

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
  const requestedPath = normalizeRoutePath(`/${pathSegments.join("/")}`);
  const canonicalPath = resolveLegacyCategoryPath(requestedPath);

  if (!canonicalPath) {
    notFound();
  }

  redirect(toCategoryHref(canonicalPath));
}
