"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  emptyMessage?: string;
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function ProductGrid({
  products,
  emptyMessage = "No products available yet.",
}: ProductGridProps) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => {
        const canBuy = product.status === "Active" && product.stock > 0;

        return (
          <div
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-left transition-all duration-500 hover:border-primary/50"
          >
            <Link
              href={`/products/${product.slug}`}
              className="relative aspect-[3/4] w-full overflow-hidden bg-muted/20"
            >
              <Image
                src={product.image || "/product_bottle.png"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="absolute right-4 top-4 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              {formatPrice(product.price)}
            </div>

            <div className="w-full p-8">
              <p className="mb-2 text-xs uppercase tracking-widest text-primary">
                {product.category}
              </p>
              <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-primary">
                {product.name}
              </h3>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>

              <button
                onClick={() =>
                  addItem({
                    id: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image || "/product_bottle.png",
                  })
                }
                disabled={!canBuy}
                className="w-full rounded-full border border-border py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {canBuy ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
