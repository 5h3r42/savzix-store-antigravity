export type SiteConfig = {
  siteName: string;
  currency: "GBP";
  vatNumber: string;
  vatRate: number;
  supportEmail: string;
  shippingThreshold: number;
  shippingFlatRate: number;
};

export const siteConfig: SiteConfig = {
  siteName: "SAVZIX",
  currency: "GBP",
  vatNumber: "GB498138444",
  vatRate: 0.2,
  supportEmail: "support@savzix.com",
  shippingThreshold: 50,
  shippingFlatRate: 4.99,
};
