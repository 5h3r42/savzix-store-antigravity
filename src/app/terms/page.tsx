import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.siteName}`,
  description: `Terms of service for ${siteConfig.siteName}.`,
};

export default function TermsPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms summarise how the current SAVZIX storefront operates. They should be read together with the checkout flow, support pages, and your mandatory consumer rights."
      sections={[
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
            "Prices and shipping are shown in GBP. Orders cannot be completed unless stock is available and payment is successfully collected.",
          ],
        },
        {
          title: "Payments and orders",
          paragraphs: [
            "Payments are processed through Stripe Checkout.",
            "An order may be created before payment is confirmed. SAVZIX treats the order as confirmed only after payment is successfully reported and recorded.",
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
