export type SiteConfig = {
  siteName: string;
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
