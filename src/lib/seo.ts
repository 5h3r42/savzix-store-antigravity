import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

function normalisePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function absoluteUrl(path: string) {
  return new URL(normalisePath(path), `${siteConfig.siteUrl}/`).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.siteName,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}
