import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.siteName}`,
  description:
    "Learn about SAVZIX, a UK retailer trading since 2023 for beauty, skincare, fragrance, toiletries and everyday essentials.",
};

export default function AboutPage() {
  return (
    <StaticContentPage
      eyebrow="About SAVZIX"
      title="Everyday essentials, chosen with care."
      intro="SAVZIX has been trading since 2023, bringing together beauty, skincare, fragrance, toiletries, gift sets, health and wellness essentials, and practical electrical products for UK shoppers."
      sections={[
        {
          title: "What we offer",
          paragraphs: [
            "Our catalogue is built around the products people use, enjoy, and give every day. From skincare and personal care to fragrances, suncare, travel essentials, and selected electrical items, we aim to make trusted brands and useful products simple to discover in one place.",
          ],
        },
        {
          title: "Shopping with SAVZIX",
          paragraphs: [
            "We focus on a clear, straightforward shopping experience, with product information, prices in GBP, secure checkout, and support when you need it. Our range continues to grow as we add products that are suitable for everyday routines, gifting, and seasonal needs.",
          ],
        },
        {
          title: "Our commitment",
          paragraphs: [
            "SAVZIX is operated by AITECH INNOVATIONS LTD, a UK-registered business. We are committed to helping customers shop confidently for beauty and everyday essentials, with helpful service and a carefully maintained catalogue.",
          ],
        },
      ]}
    />
  );
}
