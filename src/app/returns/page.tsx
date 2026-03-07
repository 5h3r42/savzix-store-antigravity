import Link from "next/link";
import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Returns | ${siteConfig.siteName}`,
  description: `Returns support information for ${siteConfig.siteName}.`,
};

export default function ReturnsPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="Returns"
      intro="If there is a problem with your order, contact SAVZIX support before sending anything back. We will confirm the next step based on the product type, order status, and the issue reported."
      sections={[
        {
          title: "Before returning an item",
          bullets: [
            "Email support with your order number and the item details.",
            "Explain whether the item is incorrect, damaged, faulty, or otherwise not as expected.",
            "Wait for return instructions before sending a parcel.",
          ],
        },
        {
          title: "How returns are reviewed",
          paragraphs: [
            "Returns are reviewed against the condition of the item, the order record, and applicable consumer rights.",
            "Some products may require additional information before a return or refund decision can be made.",
          ],
        },
        {
          title: "Need help now?",
          paragraphs: [
            `Contact ${siteConfig.supportEmail} and include your order number so the team can review your case.`,
          ],
        },
      ]}
      footer={
        <p className="text-sm leading-7 text-muted-foreground md:text-base">
          Need return support?{" "}
          <Link
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-semibold text-primary hover:underline"
          >
            Email the support team
          </Link>
          .
        </p>
      }
    />
  );
}
