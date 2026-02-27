"use client";

import { useEffect, useId, useRef } from "react";

type ShopFiltersProps = {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  isMobileOpen: boolean;
  onToggleCategory: (value: string) => void;
  onToggleBrand: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onClearFilters: () => void;
  onCloseMobile: () => void;
};

type FiltersPanelProps = Omit<
  ShopFiltersProps,
  "isMobileOpen" | "onCloseMobile"
> & {
  idPrefix: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function toIdSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function FiltersPanel({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
  inStockOnly,
  onToggleCategory,
  onToggleBrand,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onClearFilters,
  idPrefix,
}: FiltersPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Filters</h3>
        <button
          type="button"
          aria-label="Clear all filters"
          onClick={onClearFilters}
          className="text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Clear filters
        </button>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Category</h4>
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => {
            const checkboxId = `${idPrefix}-category-${toIdSegment(category)}`;

            return (
              <li key={category}>
                <label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => onToggleCategory(category)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{category}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Brand</h4>
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const checkboxId = `${idPrefix}-brand-${toIdSegment(brand)}`;

            return (
              <li key={brand}>
                <label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onToggleBrand(brand)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{brand}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Price range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-min-price`} className="sr-only">
              Minimum price
            </label>
            <input
              id={`${idPrefix}-min-price`}
              aria-label="Minimum price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Min"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-max-price`} className="sr-only">
              Maximum price
            </label>
            <input
              id={`${idPrefix}-max-price`}
              aria-label="Maximum price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Max"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Availability</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            id={`${idPrefix}-in-stock`}
            aria-label="In stock only"
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => onInStockChange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>In stock only</span>
        </label>
      </section>
    </div>
  );
}

export function ShopFilters({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
  inStockOnly,
  isMobileOpen,
  onToggleCategory,
  onToggleBrand,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onClearFilters,
  onCloseMobile,
}: ShopFiltersProps) {
  const panelId = useId();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    // ADDED: focus trap + escape close for accessible mobile filter drawer.
    const drawerElement = drawerRef.current;
    if (!drawerElement) {
      return;
    }

    const previousFocusedElement = document.activeElement as HTMLElement | null;
    const focusableElements = Array.from(
      drawerElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseMobile();
        return;
      }

      if (event.key !== "Tab" || focusableElements.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    firstFocusable?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusedElement?.focus();
    };
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      <aside className="hidden md:block">
        <div className="sticky top-28 rounded-xl border border-border bg-card p-5">
          <FiltersPanel
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStockOnly={inStockOnly}
            onToggleCategory={onToggleCategory}
            onToggleBrand={onToggleBrand}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
            onInStockChange={onInStockChange}
            onClearFilters={onClearFilters}
            idPrefix={`desktop-${panelId}`}
          />
        </div>
      </aside>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`mobile-filters-title-${panelId}`}
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/40"
          />

          <div
            ref={drawerRef}
            className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-card p-5 shadow-2xl transition-transform duration-200"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3
                id={`mobile-filters-title-${panelId}`}
                className="text-base font-semibold text-foreground"
              >
                Filters
              </h3>
              <button
                type="button"
                aria-label="Close filter drawer"
                onClick={onCloseMobile}
                className="rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Close
              </button>
            </div>

            <FiltersPanel
              categories={categories}
              brands={brands}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onToggleCategory={onToggleCategory}
              onToggleBrand={onToggleBrand}
              onMinPriceChange={onMinPriceChange}
              onMaxPriceChange={onMaxPriceChange}
              onInStockChange={onInStockChange}
              onClearFilters={onClearFilters}
              idPrefix={`mobile-${panelId}`}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
