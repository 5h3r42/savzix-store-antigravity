import Link from "next/link";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: `Returns | ${siteConfig.siteName}`,
  description: `Returns support information for ${siteConfig.siteName}.`,
  path: "/returns",
});

export default function ReturnsPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="Returns"
      intro="If there is a problem with your order, contact SAVZIX support before sending anything back. This policy does not limit your statutory consumer rights."
      sections={[
        {
          title: "Changing your mind",
          paragraphs: [
            "For most online purchases, you can tell us within 14 days of receiving your order that you wish to cancel. Once you have told us, you normally have a further 14 days to return the item.",
            "We will process eligible refunds in line with applicable consumer law. If an item is faulty, damaged, incorrect, or not as described, contact us promptly so that we can put this right.",
          ],
        },
        {
          title: "Before returning an item",
          bullets: [
            "Email support with your order number and the item details.",
            "Explain whether the item is incorrect, damaged, faulty, or otherwise not as expected.",
            "Contact us before sending a parcel so we can provide any relevant instructions. This does not affect your statutory cancellation rights.",
          ],
        },
        {
          title: "Return address",
          paragraphs: [
            `Unless we give you different instructions for a faulty, damaged, or incorrect item, send eligible returns to: ${siteConfig.legalCompanyName}, ${siteConfig.registeredAddress}.`,
          ],
        },
        {
          title: "Product condition and hygiene",
          paragraphs: [
            "Please keep items and packaging in resaleable condition while you decide whether to keep them. You are responsible for any handling beyond what is needed to inspect the item.",
            "The right to cancel may not apply to sealed goods that are not suitable for return for health protection or hygiene reasons once they have been unsealed. This can include certain cosmetics, toiletries, and personal-care products.",
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
