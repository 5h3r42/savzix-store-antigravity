import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/formatPrice"; // CHANGED: use shared GBP formatter.
import { getProductBySlug } from "@/lib/products-store";
import { cleanDescription, cleanTitle } from "@/lib/productText"; // ADDED: retail-safe product copy helpers.

export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const productTitle = cleanTitle(product.name); // CHANGED: remove trailing pack/quantity title noise.
  const productDescription = cleanDescription(product.description, {
    title: product.name,
    brand: product.brand,
    category: product.category,
  }); // CHANGED: hide ASIN/Amazon/FBA artifacts in PDP copy.
  const isAvailable = product.status === "Active" && product.stock > 0;

  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-[1280px]">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:text-primary hover:underline">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span className="max-w-[20rem] truncate text-foreground">{productTitle}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)] lg:gap-16">
          <div className="grid gap-4 sm:grid-cols-[88px_minmax(0,1fr)]">
            <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
              <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 border-primary bg-muted sm:w-full">
                <Image
                  src={product.image || "/product_bottle.png"}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-contain p-2 mix-blend-multiply"
                />
              </div>
            </div>

            <div className="relative order-1 aspect-square overflow-hidden rounded-2xl border border-border bg-muted sm:order-2">
              <Image
                src={product.image || "/product_bottle.png"}
                alt={productTitle}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-contain p-8 mix-blend-multiply sm:p-12"
              />
            </div>
          </div>

          <div className="self-start lg:pt-2">
            <Link
              href="/shop"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
            >
              {product.brand}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {productTitle}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-5">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              {productDescription}
            </p>

            <div className="mt-7 border-y border-border py-5">
              <p className={`text-sm font-semibold ${isAvailable ? "text-emerald-700" : "text-destructive"}`}>
                {isAvailable ? "In stock" : "Currently unavailable"}
              </p>
              <div className="mt-4">
                <AddToCartButton product={product} />
              </div>
            </div>

            <div className="grid gap-4 py-6 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex gap-3">
                <Truck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  Free UK delivery on orders over {formatPrice(siteConfig.shippingThreshold)}.
                </p>
              </div>
              <div className="flex gap-3">
                <RotateCcw aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <Link href="/returns" className="hover:text-primary hover:underline">
                  View returns information
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Product information</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Everything you need to know before adding this item to your basket.
            </p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            <details open className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                Product details
                <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-4 text-sm leading-7 text-muted-foreground">{productDescription}</p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                Delivery & returns
                <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 pt-4 text-sm leading-7 text-muted-foreground">
                <p>
                  UK delivery is available at checkout. Orders at or above {formatPrice(siteConfig.shippingThreshold)} qualify for free delivery.
                </p>
                <Link href="/shipping" className="font-semibold text-primary hover:underline">
                  Delivery information
                </Link>
                <Link href="/returns" className="ml-5 font-semibold text-primary hover:underline">
                  Returns information
                </Link>
              </div>
            </details>
            <div className="flex gap-3 py-5 text-sm text-muted-foreground">
              <PackageCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
              <p>Product availability and pricing are checked at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
