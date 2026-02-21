import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";

type ProductCollectionProps = {
  products: Product[];
};

export function ProductCollection({ products }: ProductCollectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-32 text-center">
      <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-primary/5 blur-[150px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-4xl font-light tracking-tight text-foreground md:text-5xl">
          The <span className="font-serif italic text-primary">Radiance</span>{" "}
          Collection
        </h2>

        <ProductGrid
          products={products}
          emptyMessage="No products are published yet. Add one from the admin dashboard."
        />

        <div className="mt-16">
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
