import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Basket | SAVZIX",
  description: "Review your SAVZIX basket.",
  path: "/cart",
  index: false,
});

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
