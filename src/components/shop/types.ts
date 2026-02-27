export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  inStock: boolean;
  imageUrl: string;
  createdAt: string;
};

export type ShopSortKey = "newest" | "price-asc" | "price-desc";
