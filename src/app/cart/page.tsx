"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: siteConfig.currency,
  }).format(value);
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const shipping =
    items.length === 0 || subtotal >= siteConfig.shippingThreshold
      ? 0
      : siteConfig.shippingFlatRate;
  const total = subtotal + shipping;

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-10">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">Cart</p>
          <h1 className="text-4xl font-light text-foreground md:text-5xl">Your Shopping Bag</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="mb-6 text-muted-foreground">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-5 p-6 sm:flex-row">
                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 items-start justify-between gap-6">
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="text-lg font-medium transition-colors hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Unit price: {formatPrice(item.price)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-base font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <div className="mt-4 inline-flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 transition-colors hover:text-primary"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 transition-colors hover:text-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-medium">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono">{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-mono text-lg font-bold">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/shop"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
