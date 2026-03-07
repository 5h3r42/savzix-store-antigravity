import Link from "next/link";
import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.siteName}`,
  description: `Privacy information for ${siteConfig.siteName}.`,
};

export default function PrivacyPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This page describes the personal data used by the current SAVZIX storefront implementation."
      sections={[
        {
          title: "What we collect",
          bullets: [
            "Account details you provide when signing up or signing in.",
            "Order details such as name, email, phone number, shipping address, and notes entered at checkout.",
            "Product, order, and support records required to operate the store.",
          ],
        },
        {
          title: "How the site works",
          paragraphs: [
            "Authentication, session handling, database records, and product image storage are powered by Supabase.",
            "Payments are handled through Stripe Checkout. SAVZIX stores order and payment reference data, but card payment collection is performed by Stripe.",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "SAVZIX uses essential auth/session cookies through Supabase and stores cart contents in browser local storage so the cart persists on your device.",
            "See the Cookie Policy for a plain-language summary of the current cookie and storage usage.",
          ],
        },
      ]}
      footer={
        <p className="text-sm leading-7 text-muted-foreground md:text-base">
          Privacy questions can be sent to{" "}
          <Link
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-semibold text-primary hover:underline"
          >
            {siteConfig.supportEmail}
          </Link>
          .
        </p>
      }
    />
  );
}
