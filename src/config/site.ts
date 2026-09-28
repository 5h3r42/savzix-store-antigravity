export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  legalCompanyName: string;
  companyNumber: string;
  registeredAddress: string;
  currency: "GBP";
  vatNumber: string;
  vatRate: number;
  supportEmail: string;
  shippingThreshold: number;
  shippingFlatRate: number;
};

export const siteConfig: SiteConfig = {
  siteName: "SAVZIX",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://savzix.com").replace(/\/$/, ""),
  legalCompanyName: "AITECH INNOVATIONS LTD",
  companyNumber: "15076403",
  registeredAddress: "483 Green Lanes, London N13 4BS, England",
  currency: "GBP",
  vatNumber: "GB498138444",
  vatRate: 0.2,
  supportEmail: "support@savzix.com",
  shippingThreshold: 50,
  shippingFlatRate: 4.99,
};
