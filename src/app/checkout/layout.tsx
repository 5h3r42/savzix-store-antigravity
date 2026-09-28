import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Checkout | SAVZIX",
  description: "Complete your SAVZIX order securely.",
  path: "/checkout",
  index: false,
});

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
