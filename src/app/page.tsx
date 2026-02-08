import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCollection } from "@/components/home/ProductCollection";
import { InnerCircle } from "@/components/home/InnerCircle";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductCollection />
      <InnerCircle />
    </>
  );
}
