import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const featuredCollections = [
  {
    title: "Fragrance",
    href: "/fragrance",
    description:
      "Signature scents for every mood, from fresh daytime picks to bold evening choices.",
  },
  {
    title: "Gift Sets",
    href: "/gift-sets",
    description:
      "Curated bundles designed for thoughtful gifting and effortless self-care routines.",
  },
  {
    title: "Beauty Bestsellers",
    href: "/beauty-skincare",
    description:
      "Top-performing beauty essentials chosen by customers for everyday results.",
  },
];

export function FeaturedCollections() {
  return (
    <section className="border-b border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-primary">Discover</p>
          <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
            Featured <span className="font-serif italic text-primary">Collections</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
            >
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-medium text-foreground">{collection.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                  Shop now
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
