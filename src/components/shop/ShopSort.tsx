"use client";

import { useId } from "react";
import type { ShopSortKey } from "@/components/shop/types";

type ShopSortProps = {
  value: ShopSortKey;
  onChange: (value: ShopSortKey) => void;
  className?: string;
};

export function ShopSort({ value, onChange, className }: ShopSortProps) {
  const sortId = useId(); // ADDED: unique input id so labels remain valid on desktop/mobile instances.

  return (
    <div className={className}>
      <label htmlFor={sortId} className="sr-only">
        Sort products
      </label>
      <select
        id={sortId}
        aria-label="Sort products"
        value={value}
        onChange={(event) => onChange(event.target.value as ShopSortKey)}
        className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price (low to high)</option>
        <option value="price-desc">Price (high to low)</option>
      </select>
    </div>
  );
}
