import { ProductGrid } from "@/components/products/ProductGrid";
import { getPublicProducts } from "@/lib/products-store";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getPublicProducts();

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-light text-foreground">
            Shop All <span className="font-serif italic text-primary">Products</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse the complete Savzix product catalog. Products added from the
            admin panel appear here automatically.
          </p>
        </div>

        <ProductGrid products={products} emptyMessage="No active products found." />
      </div>
    </section>
  );
}
