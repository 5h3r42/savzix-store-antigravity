import Link from "next/link";
import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { ContactForm } from "@/components/content/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.siteName}`,
  description: `Contact ${siteConfig.siteName} support.`,
};

export default function ContactPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="Contact Us"
      intro="For order support, product questions, or account issues, contact the SAVZIX team by email. Include your order number where relevant so we can help faster."
      sections={[
        {
          title: "Customer support",
          paragraphs: [
            `Email: ${siteConfig.supportEmail}`,
            "Support requests are handled through the SAVZIX support inbox. This is the best channel for delivery, checkout, account, and returns questions.",
          ],
        },
        {
          title: "What to include",
          bullets: [
            "Your order number for any order-specific request.",
            "The email address used for your SAVZIX account or checkout.",
            "A short description of the issue and any relevant product names.",
          ],
        },
      ]}
      footer={
        <div className="space-y-7">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Send us a message
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
              Complete the form below or email{" "}
              <Link
                href={`mailto:${siteConfig.supportEmail}`}
                className="font-semibold text-primary hover:underline"
              >
                {siteConfig.supportEmail}
              </Link>
              .
            </p>
          </div>
          <ContactForm supportEmail={siteConfig.supportEmail} />
        </div>
      }
    />
  );
}
