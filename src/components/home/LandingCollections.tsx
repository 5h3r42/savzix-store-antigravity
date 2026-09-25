import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/types";

type ProductSectionProps = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  products: ShopProduct[];
  tone?: "default" | "muted";
};

type LandingCollectionsProps = {
  newArrivals: ShopProduct[];
  offers: ShopProduct[];
  bestsellers: ShopProduct[];
};

const brands = [
  { name: "Aveeno", src: "/brand/logos/aveeno.svg", width: 204, height: 48 },
  { name: "CeraVe", src: "/brand/logos/cerave.png", width: 1230, height: 466 },
  { name: "Dove", src: "/brand/logos/dove.png", width: 266, height: 202 },
  { name: "Lynx", src: "/brand/logos/lynx.png", width: 806, height: 225 },
  { name: "NIVEA", src: "/brand/logos/nivea.svg", width: 500, height: 500 },
] as const;

function ProductSection({
  title,
  description,
  href,
  linkLabel,
  products,
  tone = "default",
}: ProductSectionProps) {
  return (
    <section className={tone === "muted" ? "border-y border-border bg-[#edf4fa] py-14" : "bg-white py-14"}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
          <Link
            href={href}
            className="hidden shrink-0 items-center gap-2 text-sm font-bold text-primary hover:text-foreground md:inline-flex"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Products will appear here when the catalogue is available.
          </div>
        )}

        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-foreground md:hidden"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function LandingCollections({
  newArrivals,
  offers,
  bestsellers,
}: LandingCollectionsProps) {
  return (
    <>
      <ProductSection
        title="New arrivals"
        description="Discover the latest beauty, fragrance, toiletries, and wellness essentials added to SAVZIX."
        href="/shop"
        linkLabel="View all new arrivals"
        products={newArrivals}
      />
      <ProductSection
        title="Offers"
        description="Shop great-value everyday essentials from across the SAVZIX catalogue."
        href="/shop"
        linkLabel="View all offers"
        products={offers}
        tone="muted"
      />
      <ProductSection
        title="Bestsellers"
        description="Popular products selected from recent customer demand and the active SAVZIX range."
        href="/shop"
        linkLabel="View all bestsellers"
        products={bestsellers}
      />
    </>
  );
}

export function TrustedBrands() {
  return (
    <section className="border-y border-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {brands.map((brand) => (
            <div key={brand.name} className="flex h-14 w-full items-center justify-center">
              <Image
                src={brand.src}
                alt={`${brand.name} logo`}
                width={brand.width}
                height={brand.height}
                className="max-h-12 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
