import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Customer sign in | SAVZIX",
  description: "Sign in to your SAVZIX customer account.",
  path: "/login",
  index: false,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
