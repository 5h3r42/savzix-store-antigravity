"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/types";

type ProductGridProps = {
  products: ShopProduct[];
  pageSize?: number;
};

export function ProductGrid({ products, pageSize = 24 }: ProductGridProps) {
  const [page, setPage] = useState(1); // ADDED: load-more pagination state.
  const visibleCount = page * pageSize;

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No products match your current filters.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visibleCount < products.length ? (
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Load more products"
            onClick={() => setPage((current) => current + 1)}
            className="h-10 rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
