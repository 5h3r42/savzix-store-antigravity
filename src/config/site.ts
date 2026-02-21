export type SiteConfig = {
  siteName: string;
  currency: "GBP";
  supportEmail: string;
  shippingThreshold: number;
  shippingFlatRate: number;
};

export const siteConfig: SiteConfig = {
  siteName: "SAVZIX",
  currency: "GBP",
  supportEmail: "support@savzix.com",
  shippingThreshold: 50,
  shippingFlatRate: 4.99,
};
