export type ProductStatus = "Active" | "Draft" | "Archived";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  createdAt: string;
};

export type NewProductInput = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  image?: string;
};
