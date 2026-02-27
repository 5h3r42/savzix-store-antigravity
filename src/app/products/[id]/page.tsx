import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/AddToCartButton";
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

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card">
          <Image
            src={product.image || "/product_bottle.png"}
            alt={productTitle}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">
            {product.category}
          </p>
          <h1 className="mb-4 text-4xl font-light text-foreground md:text-5xl">
            {productTitle}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            {productDescription}
          </p>

          <p className="mb-8 font-mono text-3xl font-bold text-foreground">
            {formatPrice(product.price)}
          </p>

          <div className="mb-4">
            <AddToCartButton product={product} />
          </div>

          <p className="text-sm text-muted-foreground">In stock: {product.stock}</p>
        </div>
      </div>
    </section>
  );
}
