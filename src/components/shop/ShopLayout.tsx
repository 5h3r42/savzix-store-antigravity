"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  flatTaxonomy,
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
const HERO_PRODUCT_LIMIT = 4;
const MAIN_SHOP_HERO = {
  src: "/shop/main-shop-hero.png",
  alt: "Curated SAVZIX product selection arranged on a warm neutral surface",
};
const HERO_PRODUCT_LAYOUTS = [
  {
    wrapperClass:
      "absolute left-[18%] top-[8%] h-[28%] w-[30%] sm:left-[20%] sm:w-[28%] lg:left-[18%]",
    imageClass: "object-contain drop-shadow-[0_20px_28px_rgba(73,54,31,0.16)]",
  },
  {
    wrapperClass:
      "absolute right-[3%] top-[10%] h-[48%] w-[28%] rotate-[8deg] sm:right-[5%] sm:w-[26%]",
    imageClass: "object-contain drop-shadow-[0_24px_32px_rgba(73,54,31,0.18)]",
  },
  {
    wrapperClass:
      "absolute left-[27%] bottom-[6%] h-[42%] w-[22%] -rotate-[10deg] sm:left-[28%] sm:w-[20%]",
    imageClass: "object-contain drop-shadow-[0_24px_34px_rgba(73,54,31,0.18)]",
  },
  {
    wrapperClass:
      "absolute right-[16%] bottom-[2%] h-[48%] w-[23%] rotate-[10deg] sm:right-[17%] sm:w-[21%]",
    imageClass: "object-contain drop-shadow-[0_28px_36px_rgba(73,54,31,0.18)]",
  },
] as const;

const CATEGORY_HERO_THEMES: Record<
  string,
  {
    surface: string;
    glowA: string;
    glowB: string;
    mesh: string;
    badge: string;
  }
> = {
  "beauty-skincare": {
    surface: "bg-[linear-gradient(135deg,#fbf0ea_0%,#f7ece4_45%,#f1e1d3_100%)]",
    glowA: "bg-[#f4d5cd]/80",
    glowB: "bg-[#cbeef1]/75",
    mesh:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(181,138,18,0.18),transparent_26%),radial-gradient(circle_at_78%_24%,rgba(89,190,202,0.18),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(232,181,165,0.2),transparent_24%)]",
    badge: "bg-white/82 text-foreground/70",
  },
  fragrance: {
    surface: "bg-[linear-gradient(135deg,#f6efe8_0%,#efe1d6_50%,#e6d0c2_100%)]",
    glowA: "bg-[#e8c8b8]/70",
    glowB: "bg-[#d7b38a]/60",
    mesh:
      "bg-[radial-gradient(circle_at_18%_18%,rgba(181,138,18,0.18),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(141,99,56,0.16),transparent_22%),radial-gradient(circle_at_72%_76%,rgba(244,220,198,0.28),transparent_24%)]",
    badge: "bg-white/82 text-foreground/70",
  },
  "gift-sets": {
    surface: "bg-[linear-gradient(135deg,#f3efe7_0%,#efe5d3_48%,#e2d3bb_100%)]",
    glowA: "bg-[#ead7aa]/72",
    glowB: "bg-[#d8c2ef]/58",
    mesh:
      "bg-[radial-gradient(circle_at_18%_18%,rgba(181,138,18,0.18),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(181,138,18,0.12),transparent_22%),radial-gradient(circle_at_70%_74%,rgba(167,133,211,0.16),transparent_22%)]",
    badge: "bg-white/84 text-foreground/70",
  },
  "health-wellness": {
    surface: "bg-[linear-gradient(135deg,#edf5ee_0%,#e7f1e8_42%,#d8e9dc_100%)]",
    glowA: "bg-[#cbe6d1]/80",
    glowB: "bg-[#bde0de]/72",
    mesh:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(102,153,118,0.16),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(77,170,161,0.16),transparent_24%),radial-gradient(circle_at_70%_76%,rgba(181,138,18,0.12),transparent_24%)]",
    badge: "bg-white/84 text-foreground/70",
  },
  "suncare-travel": {
    surface: "bg-[linear-gradient(135deg,#fff2de_0%,#f9e7c8_46%,#efd3a8_100%)]",
    glowA: "bg-[#ffd793]/74",
    glowB: "bg-[#b9dff5]/68",
    mesh:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(255,182,72,0.18),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(89,177,220,0.18),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(181,138,18,0.14),transparent_24%)]",
    badge: "bg-white/82 text-foreground/70",
  },
  electrical: {
    surface: "bg-[linear-gradient(135deg,#f3f1ee_0%,#ece9e5_48%,#ddd9d5_100%)]",
    glowA: "bg-[#dad3cb]/76",
    glowB: "bg-[#c9d6e8]/60",
    mesh:
      "bg-[radial-gradient(circle_at_18%_18%,rgba(140,122,98,0.18),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(119,146,184,0.16),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(181,138,18,0.12),transparent_22%)]",
    badge: "bg-white/84 text-foreground/70",
  },
  toiletries: {
    surface: "bg-[linear-gradient(135deg,#eef6f5_0%,#e6f0ef_46%,#d7e7e5_100%)]",
    glowA: "bg-[#c7e1de]/76",
    glowB: "bg-[#f0ddd0]/62",
    mesh:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(82,155,148,0.16),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(181,138,18,0.12),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(232,195,170,0.18),transparent_24%)]",
    badge: "bg-white/84 text-foreground/70",
  },
  default: {
    surface: "bg-[linear-gradient(135deg,#f8f4ee_0%,#f0ebe3_46%,#e6ddd1_100%)]",
    glowA: "bg-primary/12",
    glowB: "bg-[#cfe3ea]/60",
    mesh:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(181,138,18,0.14),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(111,163,180,0.14),transparent_22%),radial-gradient(circle_at_70%_76%,rgba(220,197,166,0.18),transparent_24%)]",
    badge: "bg-white/82 text-foreground/70",
  },
};

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

function getCategoryHeroTheme(categoryPath: string | null) {
  const topLevelPath = categoryPath?.split("/")[0] ?? "default";
  return CATEGORY_HERO_THEMES[topLevelPath] ?? CATEGORY_HERO_THEMES.default;
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
  const heroProducts = useMemo(() => {
    const seenImages = new Set<string>();

    return routeScopedProducts.filter((product) => {
      const image = product.imageUrl?.trim();

      if (!image || seenImages.has(image)) {
        return false;
      }

      seenImages.add(image);
      return true;
    }).slice(0, HERO_PRODUCT_LIMIT);
  }, [routeScopedProducts]);
  const heroTheme = useMemo(
    () => getCategoryHeroTheme(activeCategoryNode?.path ?? routeCategoryPath ?? null),
    [activeCategoryNode?.path, routeCategoryPath]
  );
  const childCategoryLinks = useMemo(() => {
    if (!activeCategoryNode) {
      return [];
    }

    return flatTaxonomy.filter((node) => node.parentPath === activeCategoryNode.path).slice(0, 4);
  }, [activeCategoryNode]);
  const shouldShowRouteBrowse =
    !browseLabel &&
    Boolean((activeCategoryPath && activeRouteFilterRule) || (routeCategoryPath && routeFilterRule));
  const fallbackBrowseLabel = activeCategoryName ?? routeCategoryName ?? routeCategoryPath;

  return (
    <section className="px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {activeCategoryNode ? (
          <header
            className={`relative isolate overflow-hidden rounded-[2rem] border border-border/70 ${heroTheme.surface}`}
          >
            <div className="absolute inset-0">
              <div className={`absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl ${heroTheme.glowA}`} />
              <div className={`absolute right-0 top-16 h-80 w-80 rounded-full blur-3xl ${heroTheme.glowB}`} />
              <div className={`absolute inset-0 ${heroTheme.mesh}`} />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/55 via-background/20 to-transparent" />
            </div>
            <div className="relative z-10 grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,560px)] lg:items-center lg:gap-12 lg:px-10 lg:py-12">
              <div className="max-w-xl space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${heroTheme.badge}`}>
                    {activeCategoryNode.parentPath ? "Subcategory" : "Main Category"}
                  </span>
                  <span className="text-xs uppercase tracking-[0.28em] text-foreground/55">
                    {routeScopedProducts.length} products
                  </span>
                </div>
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
                {childCategoryLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {childCategoryLinks.map((category) => (
                      <Link
                        key={category.path}
                        href={category.href}
                        className="rounded-full border border-foreground/12 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative min-h-[320px] lg:min-h-[420px]">
                {heroProducts.length > 0 ? (
                  <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,253,249,0.7)_0%,rgba(255,249,239,0.46)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] lg:min-h-[420px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_6%_20%,rgba(255,255,255,0.92),rgba(255,255,255,0.58)_28%,transparent_62%)]" />
                    <div className="absolute left-[-2%] top-[8%] h-[72%] w-[58%] rounded-full bg-white/62 blur-2xl" />
                    <div className="absolute bottom-[-22%] right-[6%] h-[74%] w-[64%] rounded-full border border-white/45 bg-[linear-gradient(135deg,rgba(239,226,206,0.66),rgba(224,204,178,0.34))]" />
                    <div className="absolute right-[-2%] top-0 h-[24%] w-[36%] rounded-bl-[2rem] bg-[repeating-linear-gradient(-14deg,rgba(233,214,191,0.7)_0px,rgba(233,214,191,0.7)_10px,rgba(245,233,217,0.82)_10px,rgba(245,233,217,0.82)_22px)] opacity-90" />
                    <div className="absolute inset-y-[12%] left-[46%] w-px bg-white/35" />

                    {heroProducts.map((product, index) => {
                      const layout = HERO_PRODUCT_LAYOUTS[index];

                      if (!layout) {
                        return null;
                      }

                      return (
                        <div key={`${product.id}-${index}`} className={layout.wrapperClass}>
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            priority={index === 0}
                            sizes="(min-width: 1024px) 240px, 42vw"
                            className={layout.imageClass}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-[320px] items-end rounded-[1.75rem] border border-dashed border-foreground/12 bg-white/54 p-6 lg:min-h-[420px]">
                    <p className="max-w-xs text-sm text-foreground/60">
                      Category hero imagery will populate automatically as products with images are
                      published to this section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </header>
        ) : (
          <header className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,#f8f2e8_0%,#f4ecdf_48%,#efe3d2_100%)]">
            <div className="absolute inset-0">
              <Image
                src={MAIN_SHOP_HERO.src}
                alt={MAIN_SHOP_HERO.alt}
                fill
                priority
                sizes="(min-width: 1536px) 1440px, 100vw"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,246,239,0.95)_0%,rgba(248,246,239,0.9)_30%,rgba(248,246,239,0.56)_54%,rgba(248,246,239,0.16)_74%,rgba(248,246,239,0)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(181,138,18,0.14),_transparent_38%)]" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/45 via-background/15 to-transparent" />
            </div>
            <div className="relative z-10 flex min-h-[340px] items-center px-6 py-8 sm:min-h-[400px] sm:px-8 sm:py-10 lg:min-h-[440px] lg:px-10 lg:py-12">
              <div className="max-w-xl space-y-4">
                <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/70">
                  SAVZIX Shop
                </span>
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
