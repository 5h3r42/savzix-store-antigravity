"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  getTaxonomyNodeByPath,
  normalizeTaxonomyPath,
} from "@/config/category-taxonomy";
import {
  matchesCategoryRouteFilter,
  resolveCategoryRouteFilter,
} from "@/config/category-route-filters";
import { getCategoryNameForPath } from "@/config/categories";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopSort } from "@/components/shop/ShopSort";
import type { ShopProduct, ShopSortKey } from "@/components/shop/types";

type ShopLayoutProps = {
  products: ShopProduct[];
  activeCategoryPath?: string | null;
  routeCategoryPath?: string | null;
  title?: string;
  description?: string;
  browseLabel?: string | null;
  viewAllHref?: string | null;
};

const DEFAULT_PAGE_SIZE = 24;

type ShopHeaderContentProps = {
  title: string;
  description: string;
  browseLabel?: string | null;
  fallbackBrowseLabel?: string | null;
  showFallbackBrowse?: boolean;
  viewAllHref?: string | null;
  filteredCount: number;
  headingClassName: string;
  bodyClassName: string;
  browseTextClassName: string;
  browseValueClassName: string;
  linkClassName: string;
};

function ShopHeaderContent({
  title,
  description,
  browseLabel = null,
  fallbackBrowseLabel = null,
  showFallbackBrowse = false,
  viewAllHref = null,
  filteredCount,
  headingClassName,
  bodyClassName,
  browseTextClassName,
  browseValueClassName,
  linkClassName,
}: ShopHeaderContentProps) {
  const visibleBrowseLabel =
    browseLabel ?? (showFallbackBrowse ? fallbackBrowseLabel : null);

  return (
    <>
      <h1 className={headingClassName}>{title}</h1>
      <p className={bodyClassName}>{description}</p>
      {visibleBrowseLabel ? (
        <p className={browseTextClassName}>
          Browsing:{" "}
          <span className={browseValueClassName}>{visibleBrowseLabel}</span>{" "}
          {viewAllHref ? (
            <Link href={viewAllHref} className={linkClassName}>
              View all
            </Link>
          ) : null}
        </p>
      ) : null}
      <p className={browseTextClassName}>{filteredCount} results</p>
    </>
  );
}

function parsePriceInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function timestamp(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ShopLayout({
  products,
  activeCategoryPath = null,
  routeCategoryPath = null,
  title = "Shop",
  description = "Discover premium beauty, fragrance, wellness, and daily essentials.",
  browseLabel = null,
  viewAllHref = "/shop",
}: ShopLayoutProps) {
  const [sortKey, setSortKey] = useState<ShopSortKey>("newest"); // ADDED: in-memory PLP sorting.
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const routeFilterRule = useMemo(
    () => resolveCategoryRouteFilter(routeCategoryPath),
    [routeCategoryPath]
  );
  const activeCategoryNode = useMemo(() => {
    const categoryPath = activeCategoryPath ?? routeCategoryPath;
    return categoryPath ? getTaxonomyNodeByPath(categoryPath) : null;
  }, [activeCategoryPath, routeCategoryPath]);
  const activeRouteFilterRule = useMemo(
    () => resolveCategoryRouteFilter(activeCategoryPath),
    [activeCategoryPath]
  );
  const normalizedTaxonomyPath = useMemo(
    () => (routeCategoryPath ? normalizeTaxonomyPath(routeCategoryPath) : null),
    [routeCategoryPath]
  );
  const activeCategoryName = useMemo(
    () => (activeCategoryPath ? getCategoryNameForPath(activeCategoryPath) : null),
    [activeCategoryPath]
  );
  const routeCategoryName = useMemo(
    () => (routeCategoryPath ? getCategoryNameForPath(routeCategoryPath) : null),
    [routeCategoryPath]
  );

  const routeScopedProducts = useMemo(() => {
    if (!routeCategoryPath) {
      return products;
    }

    if (normalizedTaxonomyPath) {
      const taxonomyMatchedProducts = products.filter((product) => {
        const primaryPath = product.primaryCategoryPath?.trim() ?? "";
        const topLevelPath = product.topLevelCategoryPath?.trim() ?? "";

        return (
          primaryPath === normalizedTaxonomyPath ||
          primaryPath.startsWith(`${normalizedTaxonomyPath}/`) ||
          topLevelPath === normalizedTaxonomyPath
        );
      });

      if (taxonomyMatchedProducts.length > 0) {
        return taxonomyMatchedProducts;
      }
    }

    if (!routeFilterRule) {
      return products;
    }

    // CHANGED: only fall back to keyword heuristics when relational or classified taxonomy data is absent.
    return products.filter((product) =>
      matchesCategoryRouteFilter(
        {
          title: product.title,
          category: product.category,
          brand: product.brand,
        },
        routeFilterRule
      )
    );
  }, [normalizedTaxonomyPath, products, routeCategoryPath, routeFilterRule]);

  const categories = useMemo(
    () =>
      Array.from(new Set(routeScopedProducts.map((product) => product.category)))
        .filter((value) => value.trim().length > 0)
        .sort((left, right) => left.localeCompare(right)),
    [routeScopedProducts]
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(routeScopedProducts.map((product) => product.brand)))
        .filter((value) => value.trim().length > 0)
        .sort((left, right) => left.localeCompare(right)),
    [routeScopedProducts]
  );

  const minPriceValue = parsePriceInput(minPrice);
  const maxPriceValue = parsePriceInput(maxPrice);

  const filteredProducts = useMemo(() => {
    const results = routeScopedProducts.filter((product) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      if (minPriceValue !== null && product.price < minPriceValue) {
        return false;
      }

      if (maxPriceValue !== null && product.price > maxPriceValue) {
        return false;
      }

      if (inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    });

    return results.sort((left, right) => {
      if (sortKey === "price-asc") {
        return left.price - right.price;
      }

      if (sortKey === "price-desc") {
        return right.price - left.price;
      }

      return timestamp(right.createdAt) - timestamp(left.createdAt);
    });
  }, [
    inStockOnly,
    maxPriceValue,
    minPriceValue,
    routeScopedProducts,
    selectedBrands,
    selectedCategories,
    sortKey,
  ]);

  const toggleCategory = useCallback((value: string) => {
    setSelectedCategories((current) =>
      current.includes(value)
        ? current.filter((category) => category !== value)
        : [...current, value]
    );
  }, []);

  const toggleBrand = useCallback((value: string) => {
    setSelectedBrands((current) =>
      current.includes(value) ? current.filter((brand) => brand !== value) : [...current, value]
    );
  }, []);

  const clearFilters = useCallback(() => {
    // ADDED: shared reset action for sidebar and active-chip row.
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  }, []);

  const activeFilterChips = [
    ...selectedCategories.map((category) => ({
      key: `category-${category}`,
      label: `Category: ${category}`,
      onRemove: () => toggleCategory(category),
    })),
    ...selectedBrands.map((brand) => ({
      key: `brand-${brand}`,
      label: `Brand: ${brand}`,
      onRemove: () => toggleBrand(brand),
    })),
    ...(minPriceValue !== null
      ? [
          {
            key: "min-price",
            label: `Min: £${minPriceValue.toFixed(2)}`,
            onRemove: () => setMinPrice(""),
          },
        ]
      : []),
    ...(maxPriceValue !== null
      ? [
          {
            key: "max-price",
            label: `Max: £${maxPriceValue.toFixed(2)}`,
            onRemove: () => setMaxPrice(""),
          },
        ]
      : []),
    ...(inStockOnly
      ? [
          {
            key: "in-stock",
            label: "In stock",
            onRemove: () => setInStockOnly(false),
          },
        ]
      : []),
  ];

  const paginationResetKey = useMemo(
    // ADDED: remount grid when filter/sort state changes to reset load-more page size.
    () =>
      JSON.stringify({
        sortKey,
        routeCategoryPath,
        selectedCategories: [...selectedCategories].sort(),
        selectedBrands: [...selectedBrands].sort(),
        minPrice,
        maxPrice,
        inStockOnly,
      }),
    [
      inStockOnly,
      maxPrice,
      minPrice,
      routeCategoryPath,
      selectedBrands,
      selectedCategories,
      sortKey,
    ]
  );
  const heroImage = activeCategoryNode?.heroImage ?? null;
  const shouldShowRouteBrowse =
    !browseLabel &&
    Boolean((activeCategoryPath && activeRouteFilterRule) || (routeCategoryPath && routeFilterRule));
  const fallbackBrowseLabel = activeCategoryName ?? routeCategoryName ?? routeCategoryPath;

  return (
    <section className="px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {heroImage ? (
          <header className="relative isolate min-h-[360px] w-full overflow-hidden rounded-[2rem] border border-border bg-[#f7eded] lg:aspect-[3/1] lg:min-h-0">
            <div className="absolute inset-0">
              <div className="absolute inset-3 sm:inset-4 lg:inset-6">
                <div className="relative h-full w-full">
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt}
                    fill
                    priority
                    sizes="(min-width: 1536px) 1440px, 100vw"
                    className="object-contain object-right"
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,244,244,0.95)_0%,rgba(251,244,244,0.86)_28%,rgba(251,244,244,0.5)_50%,rgba(251,244,244,0.12)_72%,rgba(251,244,244,0)_100%)]" />
            </div>
            <div className="relative z-10 flex min-h-[360px] items-center px-6 py-8 sm:min-h-[420px] sm:px-8 sm:py-10 lg:h-full lg:min-h-0 lg:px-10 lg:py-12">
              <div className="max-w-xl space-y-2">
                <ShopHeaderContent
                  title={title}
                  description={description}
                  browseLabel={browseLabel}
                  fallbackBrowseLabel={fallbackBrowseLabel}
                  showFallbackBrowse={shouldShowRouteBrowse}
                  viewAllHref={viewAllHref}
                  filteredCount={filteredProducts.length}
                  headingClassName="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
                  bodyClassName="max-w-lg text-sm text-foreground/72 md:text-base"
                  browseTextClassName="text-sm text-foreground/72"
                  browseValueClassName="font-medium text-foreground"
                  linkClassName="ml-2 text-primary underline underline-offset-4"
                />
              </div>
            </div>
          </header>
        ) : (
          <div className="mx-auto w-full max-w-7xl">
            <header className="space-y-2">
              <ShopHeaderContent
                title={title}
                description={description}
                browseLabel={browseLabel}
                fallbackBrowseLabel={fallbackBrowseLabel}
                showFallbackBrowse={shouldShowRouteBrowse}
                viewAllHref={viewAllHref}
                filteredCount={filteredProducts.length}
                headingClassName="text-3xl font-semibold text-foreground md:text-4xl"
                bodyClassName="max-w-2xl text-sm text-muted-foreground md:text-base"
                browseTextClassName="text-sm text-muted-foreground"
                browseValueClassName="font-medium text-foreground"
                linkClassName="ml-2 text-primary underline underline-offset-4"
              />
            </header>
          </div>
        )}

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <ShopFilters
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStockOnly={inStockOnly}
            isMobileOpen={mobileFiltersOpen}
            onToggleCategory={toggleCategory}
            onToggleBrand={toggleBrand}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onInStockChange={setInStockOnly}
            onClearFilters={clearFilters}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />

          <div className="space-y-4">
            <div className="sticky top-20 z-20 flex items-center gap-3 rounded-xl border border-border bg-background/95 p-3 backdrop-blur md:hidden">
              <button
                type="button"
                aria-label="Open product filters"
                onClick={() => setMobileFiltersOpen(true)}
                className="h-10 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Filters
              </button>
              <ShopSort value={sortKey} onChange={setSortKey} className="min-w-0 flex-1" />
            </div>

            <div className="hidden items-center justify-between md:flex">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {routeScopedProducts.length}
              </p>
              <ShopSort value={sortKey} onChange={setSortKey} className="w-64" />
            </div>

            {activeFilterChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    aria-label={`Remove filter ${chip.label}`}
                    onClick={chip.onRemove}
                    className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {chip.label}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Clear all active filters"
                  onClick={clearFilters}
                  className="inline-flex h-8 items-center rounded-full border border-transparent px-3 text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Clear filters
                </button>
              </div>
            ) : null}

            <ProductGrid
              key={paginationResetKey}
              products={filteredProducts}
              pageSize={DEFAULT_PAGE_SIZE}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
