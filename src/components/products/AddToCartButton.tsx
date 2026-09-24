"use client";

import { useCart } from "@/context/CartContext";
import { cleanTitle } from "@/lib/productText"; // ADDED: clean cart item titles before storing.
import type { Product } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const productTitle = cleanTitle(product.name); // CHANGED: remove pack suffix from PDP add-to-cart name.

  const canBuy = product.status === "Active" && product.stock > 0;

  return (
    <button
      onClick={() =>
        addItem({
          id: product.slug,
          name: productTitle,
          price: product.price,
          image: product.image || "/product_bottle.png",
        })
      }
      disabled={!canBuy}
      className="w-full rounded-lg bg-foreground px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-[#0b1f33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {canBuy ? "Add to basket" : "Unavailable"}
    </button>
  );
}
