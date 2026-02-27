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
      className="rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {canBuy ? "Add to Cart" : "Unavailable"}
    </button>
  );
}
