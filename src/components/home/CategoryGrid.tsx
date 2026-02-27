import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/config/categories"; // CHANGED: use shared category taxonomy as single source of truth.

const topCategories = categories.slice(0, 8); // ADDED: limit to 6–8 categories for concise homepage navigation.

export function CategoryGrid() {
  return (
    <section className="border-b border-border bg-muted/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-primary">Explore</p>
            <h2 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Top <span className="font-serif italic text-primary">Categories</span>
            </h2>
          </div>
          <span className="hidden text-sm text-muted-foreground md:inline">
            {topCategories.length} categories
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {topCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
}: {
  category: { name: string; href: string; children?: { slug: string }[] };
}) {
  const subcategoryCount = category.children?.length ?? 0;

  return (
    <Link
      href={category.href}
      className="group flex min-h-[140px] flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Category
          </p>
          <h3 className="text-lg font-semibold text-foreground md:text-xl">{category.name}</h3>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          {subcategoryCount > 0 ? `${subcategoryCount}+ subcategories` : "Browse collection"}
        </p>
      </div>
    </Link>
  );
}
