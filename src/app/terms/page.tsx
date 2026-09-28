import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: `Terms of Service | ${siteConfig.siteName}`,
  description: `Terms of service for ${siteConfig.siteName}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms explain how SAVZIX sells products online. They should be read with the Shipping, Returns, Privacy, and Cookie policies. Nothing in these terms limits your mandatory consumer rights."
      sections={[
        {
          title: "Who we are",
          paragraphs: [
            "SAVZIX is operated by AITECH INNOVATIONS LTD, 483 Green Lanes, London N13 4BS, England. Company number: 15076403. VAT registration: GB498138444.",
          ],
        },
        {
          title: "Using the site",
          paragraphs: [
            "You are responsible for providing accurate account and checkout information.",
            "Access to customer account features and checkout requires a valid SAVZIX login.",
          ],
        },
        {
          title: "Products, pricing, and availability",
          paragraphs: [
            "Product availability depends on live stock data in the SAVZIX catalog.",
            "Prices and shipping charges are shown in GBP and include VAT where applicable. Orders cannot be completed unless stock is available and payment is successfully collected.",
            "We take reasonable care to keep product descriptions, images, pricing, and availability accurate. If there is an obvious error, we will contact you before dispatch or cancel and refund the affected order where appropriate.",
          ],
        },
        {
          title: "Payments and orders",
          paragraphs: [
            "Payments are processed through Stripe Checkout.",
            "An order may be created before payment is confirmed. SAVZIX treats the order as accepted only after payment is successfully reported and recorded. You can review the order status from your SAVZIX account after purchase.",
          ],
        },
        {
          title: "Delivery and cancellation",
          paragraphs: [
            "Delivery availability and charges are shown at checkout. The live checkout currently supports United Kingdom delivery addresses only.",
            "For eligible online purchases, you generally have a 14-day right to cancel after receiving the goods. See the Returns page for the cancellation and product-condition information that applies to your order.",
          ],
        },
        {
          title: "Support and returns",
          paragraphs: [
            "Questions about orders, shipping, and returns should be sent to SAVZIX support using the contact details published on this site.",
          ],
        },
      ]}
    />
  );
}
