import type { MetadataRoute } from "next";
import { flatTaxonomy } from "@/config/category-taxonomy";
import { getPublicProducts } from "@/lib/products-store";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const publicPages = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms",
  "/cookies",
];

function buildShopPath(categoryPath: string) {
  return `/shop?${new URLSearchParams({ categoryPath }).toString()}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublicProducts();
  const generatedAt = new Date();

  return [
    ...publicPages.map((path) => ({
      url: absoluteUrl(path),
      lastModified: generatedAt,
      changeFrequency: path === "/shop" ? ("daily" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.5,
    })),
    ...flatTaxonomy.map((category) => ({
      url: absoluteUrl(buildShopPath(category.href)),
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: category.parentPath ? 0.7 : 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${encodeURIComponent(product.slug)}`),
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
