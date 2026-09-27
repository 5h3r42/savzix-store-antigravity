import { ProductCard } from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/types";
import type { Product } from "@/types/product";

type FrequentlyBoughtTogetherProps = {
  products: Product[];
};

function toShopProduct(product: Product): ShopProduct {
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    inStock: product.status === "Active" && product.stock > 0,
    imageUrl: product.image || "/product_bottle.png",
    createdAt: product.createdAt,
  };
}

export function FrequentlyBoughtTogether({
  products,
}: FrequentlyBoughtTogetherProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="frequently-bought-together-heading" className="mt-16 border-t border-border pt-10">
      <div className="flex flex-col gap-2">
        <h2 id="frequently-bought-together-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Frequently Bought Together
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Complete your basket with more popular products from this department.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={toShopProduct(product)} />
        ))}
      </div>
    </section>
  );
}
