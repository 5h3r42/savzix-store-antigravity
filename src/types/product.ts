export type ProductStatus = "Active" | "Draft" | "Archived";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  eanBarcodes: string[];
  ingredients: string | null;
  createdAt: string;
}

export type NewProductInput = {
  name: string;
  description: string;
  brand?: string;
  category: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  image?: string;
  eanBarcodes?: string[];
  ingredients?: string;
};
