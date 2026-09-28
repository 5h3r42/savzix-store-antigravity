import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteConfig.siteName,
  description: `${siteConfig.siteName} premium skincare and wellness products.`,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.siteName,
    title: siteConfig.siteName,
    description: `${siteConfig.siteName} premium skincare and wellness products.`,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteName,
    description: `${siteConfig.siteName} premium skincare and wellness products.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ... existing imports

import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalCompanyName,
    alternateName: siteConfig.siteName,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/icon.png`,
    email: siteConfig.supportEmail,
    vatID: siteConfig.vatNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: "483 Green Lanes",
      addressLocality: "London",
      postalCode: "N13 4BS",
      addressCountry: "GB",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 pt-36 sm:pt-44 md:pt-[9.5rem]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
