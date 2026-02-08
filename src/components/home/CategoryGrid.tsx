import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "Men's Care", href: "/mens", items: 5 },
  { name: "Women's Care", href: "/womens", items: 12 },
  { name: "Hair Care", href: "/hair", items: 8 },
  { name: "Body Rituals", href: "/body", items: 6 },
  { name: "Wellness", href: "/wellness", items: 4 },
];

export function CategoryGrid() {
  return (
    <section className="bg-muted/10 py-32 border-b border-border text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight text-foreground">
          Browse by <span className="text-primary italic font-serif">Category</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 3).map((category, i) => (
             <CategoryCard key={i} category={category} large />
          ))}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
             {categories.slice(3).map((category, i) => (
               <CategoryCard key={i} category={category} />
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, large }: { category: { name: string; href: string, items: number }; large?: boolean }) {
  return (
    <Link href={category.href} className={`group relative block overflow-hidden rounded-3xl border border-border bg-card hover:border-primary transition-all duration-300 ${large ? 'aspect-[4/5]' : 'aspect-video'}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 p-8 flex flex-col justify-end">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
            <p className="text-sm text-white/70">{category.items} Products</p>
          </div>
          <div className="bg-primary text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
             <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
