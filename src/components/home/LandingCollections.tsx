import Link from "next/link";
import { ArrowRight } from "lucide-react";

type IntroSectionProps = { title: string; description: string; href: string; linkLabel: string; tone?: "default" | "muted" };
const brands = ["Aveeno", "CeraVe", "Dove", "Lynx", "NIVEA", "Simple"];

function IntroSection({ title, description, href, linkLabel, tone = "default" }: IntroSectionProps) {
  return (
    <section className={tone === "muted" ? "border-y border-border bg-[#edf4fa] py-14" : "bg-white py-14"}>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
        </div>
        <Link href={href} className="group flex items-center justify-between rounded-xl border border-border bg-white px-6 py-5 font-bold text-foreground transition-colors hover:border-primary">
          {linkLabel}
          <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

export function LandingCollections() {
  return (
    <>
      <IntroSection title="New arrivals" description="New beauty, fragrance, toiletries, and wellness essentials will be added to the SAVZIX range soon." href="/shop" linkLabel="Explore the SAVZIX shop" />
      <IntroSection title="Offers" description="Explore everyday beauty, fragrance, toiletries, and wellness essentials in one clear, easy-to-shop range." href="/shop" linkLabel="Browse the full SAVZIX shop" tone="muted" />
      <IntroSection title="Bestsellers" description="Customer favourites will appear here as the SAVZIX catalogue and order history grow." href="/shop" linkLabel="Shop all categories" />
    </>
  );
}

export function TrustedBrands() {
  return (
    <section className="border-y border-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Trusted brands</h2>
        <div className="mt-7 flex flex-wrap items-center gap-x-9 gap-y-5 text-lg font-bold tracking-tight text-foreground/80 md:text-xl">
          {brands.map((brand) => <span key={brand}>{brand}</span>)}
        </div>
      </div>
    </section>
  );
}
