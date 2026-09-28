import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/reset-password",
        "/order-confirmation",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
