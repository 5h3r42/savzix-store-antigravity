import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCollection } from "@/components/home/ProductCollection";
import { InnerCircle } from "@/components/home/InnerCircle";
import { getPublicProducts } from "@/lib/products-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getPublicProducts();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductCollection products={products.slice(0, 4)} />
      <InnerCircle />
    </>
  );
}
