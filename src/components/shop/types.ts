export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string | null;
  primaryCategoryPath?: string | null;
  primaryCategoryName?: string | null;
  topLevelCategoryPath?: string | null;
  topLevelCategoryName?: string | null;
  price: number;
  inStock: boolean;
  imageUrl: string;
  createdAt: string;
};

export type ShopSortKey = "newest" | "price-asc" | "price-desc";
