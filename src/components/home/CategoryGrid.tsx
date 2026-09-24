import Link from "next/link";
import { ArrowRight, Droplets, HeartPulse, Sparkles, SprayCan } from "lucide-react";
import { categories } from "@/config/categories";

const departments = [
  { slug: "beauty-skincare", copy: "Cleansers, moisturisers and treatments", Icon: Sparkles },
  { slug: "fragrance", copy: "Everyday scents and gifting favourites", Icon: SprayCan },
  { slug: "toiletries", copy: "Daily essentials for home and travel", Icon: Droplets },
  { slug: "health-wellness", copy: "Everyday wellbeing and care", Icon: HeartPulse },
] as const;

export function CategoryGrid() {
  const topCategories = departments.flatMap((department) => {
    const category = categories.find((item) => item.slug === department.slug);
    return category ? [{ ...department, category }] : [];
  });

  return (
    <section className="border-b border-border bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">Shop with confidence</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Popular departments</h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-bold text-primary hover:text-foreground md:inline">View all departments</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topCategories.map((categoryEntry) => {
            const { category, Icon, copy } = categoryEntry;

            return (
              <Link
                key={category.slug}
                href={category.href}
                className="group min-h-40 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="h-5 w-5" /></span>
                <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{copy}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
