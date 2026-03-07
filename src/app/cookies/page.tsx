import type { Metadata } from "next";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Cookie Policy | ${siteConfig.siteName}`,
  description: `Cookie and storage information for ${siteConfig.siteName}.`,
};

export default function CookiesPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Cookie Policy"
      intro="This policy reflects the current SAVZIX implementation in the repository."
      sections={[
        {
          title: "Essential auth cookies",
          paragraphs: [
            "SAVZIX uses Supabase session cookies to keep customers signed in and to protect authenticated routes such as account, checkout, and admin pages.",
          ],
        },
        {
          title: "Cart storage",
          paragraphs: [
            "SAVZIX stores cart contents in browser local storage under the key used by the storefront cart so products remain in the basket on the same device.",
          ],
        },
        {
          title: "Analytics and marketing cookies",
          paragraphs: [
            "No analytics or marketing cookie integration is implemented in the current repository state.",
            "If that changes in a future release, this page should be updated before those tools are enabled.",
          ],
        },
      ]}
    />
  );
}
