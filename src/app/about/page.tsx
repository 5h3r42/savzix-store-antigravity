import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About Us | SAVZIX",
  description:
    "Learn about SAVZIX, a UK retailer trading since 2023 for beauty, skincare, fragrance, toiletries and everyday essentials.",
  path: "/about",
});

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
      footer={
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Company details
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
            <p className="font-semibold text-foreground">{siteConfig.legalCompanyName}</p>
            <address className="not-italic">{siteConfig.registeredAddress}</address>
            <dl className="space-y-2">
              <div>
                <dt className="inline font-medium text-foreground">Company number:</dt>{" "}
                <dd className="inline">{siteConfig.companyNumber}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">VAT registration:</dt>{" "}
                <dd className="inline">{siteConfig.vatNumber}</dd>
              </div>
            </dl>
          </div>
        </div>
      }
    />
  );
}
