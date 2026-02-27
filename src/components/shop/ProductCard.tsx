"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { cleanTitle } from "@/lib/productText"; // ADDED: normalize product titles before rendering.
import type { ShopProduct } from "@/components/shop/types";

type ProductCardProps = {
  product: ShopProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const canBuy = product.inStock; // CHANGED: stock-aware purchase state.
  const displayTitle = cleanTitle(product.title); // CHANGED: remove pack suffixes from PLP card title.

  const productHref = product.slug ? `/products/${product.slug}` : "/shop";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <Link href={productHref} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.imageUrl || "/product_bottle.png"}
            alt={displayTitle}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {product.brand}
        </p>

        <Link href={productHref} className="focus-visible:outline-none">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {displayTitle}
          </h3>
        </Link>

        <p className="text-base font-semibold text-foreground">{formatPrice(product.price)}</p>

        <button
          type="button"
          aria-label={
            canBuy ? `Add ${displayTitle} to cart` : `${displayTitle} is out of stock`
          }
          onClick={() =>
            addItem({
              id: product.slug || product.id,
              name: displayTitle,
              price: product.price,
              image: product.imageUrl || "/product_bottle.png",
            })
          }
          disabled={!canBuy}
          className="mt-auto h-10 w-full rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canBuy ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}
