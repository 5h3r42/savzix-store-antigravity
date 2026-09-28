import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Order confirmation | SAVZIX",
  description: "Your SAVZIX order confirmation.",
  path: "/order-confirmation",
  index: false,
});

export default function OrderConfirmationLayout({ children }: { children: ReactNode }) {
  return children;
}
