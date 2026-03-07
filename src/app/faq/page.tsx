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
  title: `FAQ | ${siteConfig.siteName}`,
  description: `Frequently asked questions for ${siteConfig.siteName}.`,
};

export default function FaqPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="Frequently Asked Questions"
      intro="These answers reflect the current SAVZIX site behavior in this launch version."
      sections={[
        {
          title: "Do I need an account to check out?",
          paragraphs: [
            "Yes. Checkout is currently available to signed-in customers so orders can be tied to an account history.",
          ],
        },
        {
          title: "How do payments work?",
          paragraphs: [
            "Payments are completed through Stripe Checkout. SAVZIX creates the order first, then confirms it after Stripe reports successful payment.",
          ],
        },
        {
          title: "Where do you ship?",
          paragraphs: [
            "The live checkout flow currently supports United Kingdom delivery addresses only.",
          ],
        },
        {
          title: "When is shipping free?",
          paragraphs: [
            `Orders at or above ${formatPrice(siteConfig.shippingThreshold)} receive free shipping. Orders below that threshold are charged ${formatPrice(siteConfig.shippingFlatRate)}.`,
          ],
        },
        {
          title: "How is my cart saved?",
          paragraphs: [
            "The SAVZIX cart is stored in your browser so you can return to it during the same device session.",
          ],
        },
      ]}
    />
  );
}
