import Link from "next/link";
import { StaticContentPage } from "@/components/content/StaticContentPage";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: `Privacy Policy | ${siteConfig.siteName}`,
  description: `Privacy information for ${siteConfig.siteName}.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This policy explains how AITECH INNOVATIONS LTD uses personal data when you browse, create an account, place an order, or contact SAVZIX."
      sections={[
        {
          title: "Who is responsible for your data",
          paragraphs: [
            "AITECH INNOVATIONS LTD, 483 Green Lanes, London N13 4BS, England, is responsible for the personal data collected through SAVZIX. For privacy questions or to exercise your rights, contact us using the email address below.",
          ],
        },
        {
          title: "What we collect",
          bullets: [
            "Account details, including the email address and password credentials used to create or access your account.",
            "Order details, including your name, email address, phone number, delivery address, purchased items, and checkout notes.",
            "Support correspondence and the order information needed to help with an enquiry, return, or refund.",
            "Essential technical information used to keep your signed-in session and basket working on your device.",
          ],
        },
        {
          title: "Why we use it",
          paragraphs: [
            "We use account, checkout, and order information to perform our contract with you: to provide your account, take payment, fulfil an order, and provide customer support.",
            "We also use limited information where necessary to prevent fraud, protect the security of the service, resolve problems, and comply with legal, accounting, and tax obligations.",
            "SAVZIX does not currently use the storefront to send marketing emails or run non-essential analytics cookies. If that changes, this policy and the cookie controls will be updated before those tools are enabled.",
          ],
        },
        {
          title: "Service providers",
          paragraphs: [
            "Authentication, session handling, database records, and product image storage are powered by Supabase.",
            "Payments are handled through Stripe Checkout. SAVZIX stores order and payment reference data, but card payment collection is performed by Stripe.",
            "We only share personal data with service providers where it is necessary to operate the store, process a payment, or meet a legal obligation.",
          ],
        },
        {
          title: "Retention and your rights",
          paragraphs: [
            "We keep personal data only for as long as it is needed for the purposes above, including the time needed to maintain your account, deal with a query, and meet legal, accounting, or tax record-keeping requirements.",
            "Subject to applicable law, you can ask us to access, correct, erase, restrict, or provide a copy of your personal data, or object to certain processing. You may also complain to the UK Information Commissioner's Office if you are unhappy with how we handle your data.",
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
