import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCollections } from "@/components/home/FeaturedCollections"; // ADDED: homepage featured collection block.
import { ProductCollection } from "@/components/home/ProductCollection";
import { InnerCircle } from "@/components/home/InnerCircle";
import { getBestsellerProducts } from "@/lib/products-store"; // CHANGED: use sales-ranked bestsellers.

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getBestsellerProducts({
    days: 30,
    statuses: ["Pending", "Confirmed"],
    limit: 12,
  }); // CHANGED: bestsellers are now quantity-sold ranked with fallback.

  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedCollections />
      <ProductCollection products={products.slice(0, 12)} /> {/* CHANGED: show 8–12 bestsellers */}
      <InnerCircle />
    </>
  );
}
