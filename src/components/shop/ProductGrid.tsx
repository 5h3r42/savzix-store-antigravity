"use client";

import { useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/types";

type ProductGridProps = {
  products: ShopProduct[];
  pageSize?: number;
};

type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

function getPaginationItems(currentPage: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => ({
      type: "page" as const,
      page: index + 1,
    }));
  }

  const pages = new Set<number>([1, pageCount]);

  if (currentPage <= 4) {
    for (let page = 1; page <= 5; page += 1) pages.add(page);
  } else if (currentPage >= pageCount - 3) {
    for (let page = pageCount - 4; page <= pageCount; page += 1) pages.add(page);
  } else {
    pages.add(currentPage - 1);
    pages.add(currentPage);
    pages.add(currentPage + 1);
  }

  const sortedPages = [...pages].sort((first, second) => first - second);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push({ type: "ellipsis", key: `ellipsis-${previousPage}-${page}` });
    }

    items.push({ type: "page", page });
  });

  return items;
}

export function ProductGrid({ products, pageSize = 24 }: ProductGridProps) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const firstProductIndex = (currentPage - 1) * pageSize;
  const lastProductIndex = Math.min(firstProductIndex + pageSize, products.length);

  const visibleProducts = useMemo(
    () => products.slice(firstProductIndex, lastProductIndex),
    [firstProductIndex, lastProductIndex, products]
  );
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, pageCount),
    [currentPage, pageCount]
  );

  const goToPage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), pageCount);

    if (boundedPage === currentPage) return;

    setPage(boundedPage);
    window.requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No products match your current filters.
      </div>
    );
  }

  return (
    <div ref={gridRef} className="scroll-mt-40 space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {pageCount > 1 ? (
        <nav
          aria-label="Product pagination"
          className="flex flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            Showing {firstProductIndex + 1}–{lastProductIndex} of {products.length} products
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
            >
              Previous
            </button>

            {paginationItems.map((item) =>
              item.type === "ellipsis" ? (
                <span
                  key={item.key}
                  aria-hidden="true"
                  className="inline-flex h-10 w-6 items-center justify-center text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={item.page}
                  type="button"
                  aria-label={`Go to product page ${item.page}`}
                  aria-current={item.page === currentPage ? "page" : undefined}
                  onClick={() => goToPage(item.page)}
                  className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    item.page === currentPage
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {item.page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="h-10 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
            >
              Next
            </button>
          </div>
        </nav>
      ) : (
        <div className="border-t border-border pt-5 text-center text-sm text-muted-foreground sm:text-left">
          Showing all {products.length} {products.length === 1 ? "product" : "products"}
        </div>
      )}
    </div>
  );
}
