import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { getProductBySlug } from "@/lib/products-store";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

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

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card">
          <Image
            src={product.image || "/product_bottle.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-primary">
            {product.category}
          </p>
          <h1 className="mb-4 text-4xl font-light text-foreground md:text-5xl">
            {product.name}
          </h1>
          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            {product.description}
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
