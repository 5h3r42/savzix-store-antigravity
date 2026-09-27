"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { cleanTitle } from "@/lib/productText"; // ADDED: clean cart item titles before storing.
import type { Product } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const productTitle = cleanTitle(product.name); // CHANGED: remove pack suffix from PDP add-to-cart name.

  const canBuy = product.status === "Active" && product.stock > 0;
  const maxQuantity = Math.max(1, product.stock);

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(Math.min(maxQuantity, Math.max(1, nextQuantity)));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {canBuy ? (
        <div className="shrink-0">
          <label htmlFor={`quantity-${product.id}`} className="mb-1.5 block text-sm font-semibold text-foreground">
            Quantity
          </label>
          <div className="flex h-[52px] items-center rounded-lg border border-border bg-background">
            <button
              type="button"
              aria-label={`Decrease quantity of ${productTitle}`}
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity === 1}
              className="grid h-full w-11 place-items-center text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus aria-hidden="true" className="h-4 w-4" />
            </button>
            <output
              id={`quantity-${product.id}`}
              aria-live="polite"
              className="grid h-full min-w-10 place-items-center border-x border-border px-2 text-sm font-semibold text-foreground"
            >
              {quantity}
            </output>
            <button
              type="button"
              aria-label={`Increase quantity of ${productTitle}`}
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity === maxQuantity}
              className="grid h-full w-11 place-items-center text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() =>
          addItem(
            {
              id: product.slug,
              name: productTitle,
              price: product.price,
              image: product.image || "/product_bottle.png",
            },
            quantity,
          )
        }
        disabled={!canBuy}
        className="w-full rounded-lg bg-foreground px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-[#0b1f33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {canBuy ? `Add ${quantity} to basket` : "Unavailable"}
      </button>
    </div>
  );
}
