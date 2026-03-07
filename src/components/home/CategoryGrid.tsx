import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/types";
import { categories } from "@/config/categories";
import { normalizeTaxonomyPath } from "@/config/category-taxonomy";
import { getPublicProducts } from "@/lib/products-store";
import { mapProductsToShopProducts } from "@/lib/shop-products";

const topCategories = categories;

function groupProductsByTopLevelCategory(products: ShopProduct[]) {
  const productsByCategory = new Map<string, ShopProduct[]>();

  for (const product of products) {
    const topLevelPath = product.topLevelCategoryPath?.trim();

    if (!topLevelPath) {
      continue;
    }

    const existing = productsByCategory.get(topLevelPath) ?? [];
    existing.push(product);
    productsByCategory.set(topLevelPath, existing);
  }

  return productsByCategory;
}

export async function CategoryGrid() {
  const publicProducts = await getPublicProducts();
  const normalizedProducts = await mapProductsToShopProducts(publicProducts);
  const productsByCategory = groupProductsByTopLevelCategory(normalizedProducts);

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

        <div className="space-y-10">
          {topCategories.map((category) => {
            const categoryPath = normalizeTaxonomyPath(category.href);
            const categoryProducts = (productsByCategory.get(categoryPath) ?? []).slice(0, 4);

            return (
              <section
                key={category.slug}
                className="overflow-hidden rounded-[2rem] border border-border bg-background/95 p-6 md:p-8"
              >
                <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      Category
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                      {category.name}
                    </h3>
                  </div>

                  <Link
                    href={category.href}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:self-auto"
                  >
                    View all
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {categoryProducts.map((product) => (
                      <ProductCard key={`${category.slug}-${product.id}`} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm text-muted-foreground">
                    No products are published in this category yet.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
