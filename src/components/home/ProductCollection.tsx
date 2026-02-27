import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard"; // CHANGED: reuse retail card style for consistent bestseller cards.
import type { ShopProduct } from "@/components/shop/types";
import type { Product } from "@/types/product";

type ProductCollectionProps = {
  products: Product[];
};

export function ProductCollection({ products }: ProductCollectionProps) {
  const bestsellers = products
    .slice(0, 12)
    .map<ShopProduct>((product) => ({
      // ADDED: normalize home products into shared PLP card shape.
      id: product.id,
      slug: product.slug,
      title: product.name,
      brand: product.brand || "Brand", // CHANGED: use real product brand data.
      category: product.category || "Other",
      price: Number(product.price) || 0,
      inStock: typeof product.stock === "number" ? product.stock !== 0 : true,
      imageUrl: product.image || "/product_bottle.png",
      createdAt: product.createdAt,
    }));

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20">
      <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-primary/5 blur-[150px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-2 text-3xl font-light tracking-tight text-foreground md:text-4xl">
          <span className="font-serif italic text-primary">Bestsellers</span>
        </h2>
        <p className="mb-10 max-w-2xl text-sm text-muted-foreground md:text-base">
          Customer favorites selected for quality, value, and everyday performance.
        </p>

        {bestsellers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No products are published yet. Add one from the admin dashboard.
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/shop"
            className="inline-block rounded-full border border-border bg-card px-12 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:border-primary hover:text-primary"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
