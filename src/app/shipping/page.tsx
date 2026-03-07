import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: siteConfig.currency,
  }).format(value);
}

export const metadata: Metadata = {
  title: `Shipping | ${siteConfig.siteName}`,
  description: `Shipping information for ${siteConfig.siteName}.`,
};

export default function ShippingPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="Shipping"
      intro="SAVZIX currently accepts checkout for United Kingdom delivery addresses only. Shipping pricing is applied automatically at checkout."
      sections={[
        {
          title: "Shipping rates",
          bullets: [
            `Orders below ${formatPrice(siteConfig.shippingThreshold)} are charged a flat shipping rate of ${formatPrice(siteConfig.shippingFlatRate)}.`,
            `Orders at or above ${formatPrice(siteConfig.shippingThreshold)} qualify for free shipping.`,
            "All order totals are charged in GBP.",
          ],
        },
        {
          title: "Delivery region",
          paragraphs: [
            "The live checkout flow currently supports United Kingdom shipping addresses only.",
            "If you enter a non-UK shipping country, checkout will not proceed.",
          ],
        },
        {
          title: "Order processing",
          paragraphs: [
            "Orders are created when you submit checkout and are confirmed after successful Stripe payment and webhook processing.",
            "You can review your order state from your account after purchase.",
          ],
        },
      ]}
    />
  );
}
