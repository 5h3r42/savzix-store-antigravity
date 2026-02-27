"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useCart } from "@/context/CartContext";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "United Kingdom",
  notes: "",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: siteConfig.currency,
  }).format(value);
}

function getMockOrderId() {
  const suffix = String(Date.now()).slice(-6);
  return `ORD-${suffix}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping =
    items.length === 0 || subtotal >= siteConfig.shippingThreshold
      ? 0
      : siteConfig.shippingFlatRate;
  const total = subtotal + shipping;

  const handleChange =
    (field: keyof CheckoutForm) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = getMockOrderId();
      await new Promise((resolve) => setTimeout(resolve, 700));
      clearCart();
      router.push(`/order-confirmation?order=${orderId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="min-h-[70vh] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center md:p-12">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">Checkout</p>
          <h1 className="mb-4 text-4xl font-light text-foreground">Your Cart Is Empty</h1>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Add products before continuing to checkout.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue Shopping
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">Checkout</p>
          <h1 className="text-4xl font-light text-foreground md:text-5xl">Complete Your Order</h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-8"
          >
            <div>
              <h2 className="mb-4 text-xl font-medium">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  placeholder="First name"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
                />
                <input
                  required
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  placeholder="Last name"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="Email"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary sm:col-span-2"
                />
                <input
                  required
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="Phone"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary sm:col-span-2"
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.address}
                  onChange={handleChange("address")}
                  placeholder="Street address"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary sm:col-span-2"
                />
                <input
                  required
                  value={form.city}
                  onChange={handleChange("city")}
                  placeholder="City"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
                />
                <input
                  required
                  value={form.postalCode}
                  onChange={handleChange("postalCode")}
                  placeholder="Postal code"
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
                />
                <select
                  value={form.country}
                  onChange={handleChange("country")}
                  className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary sm:col-span-2"
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>United Arab Emirates</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-medium">Order Notes</h2>
              <textarea
                rows={4}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Delivery notes (optional)"
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 outline-none transition-colors focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-medium">Order Summary</h2>
            <ul className="space-y-4 border-b border-border pb-6">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="font-mono">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono">{formatPrice(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <span className="font-mono text-lg font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              This checkout is a demo flow. No live payment is processed yet.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
