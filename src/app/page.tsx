import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { InnerCircle } from "@/components/home/InnerCircle";
import { LandingCollections, TrustedBrands } from "@/components/home/LandingCollections";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <LandingCollections />
      <CategoryGrid />
      <TrustedBrands />
      <InnerCircle />
    </>
  );
}
