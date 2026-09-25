import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { InnerCircle } from "@/components/home/InnerCircle";
import { LandingCollections, TrustedBrands } from "@/components/home/LandingCollections";
import { getBestsellerProducts, getPublicProducts } from "@/lib/products-store";
import { mapProductsToShopProducts } from "@/lib/shop-products";

export const dynamic = "force-dynamic";

const LANDING_COLLECTION_SIZE = 4;

export default async function Home() {
  const [publicProducts, rankedBestsellers] = await Promise.all([
    getPublicProducts(),
    getBestsellerProducts({ limit: LANDING_COLLECTION_SIZE }),
  ]);
  const newArrivals = publicProducts.slice(0, LANDING_COLLECTION_SIZE);
  const offers = [...publicProducts]
    .sort((first, second) => first.price - second.price)
    .slice(0, LANDING_COLLECTION_SIZE);
  const selectedProducts = [
    ...new Map(
      [...newArrivals, ...offers, ...rankedBestsellers].map((product) => [product.id, product]),
    ).values(),
  ];
  const shopProducts = await mapProductsToShopProducts(selectedProducts);
  const shopProductById = new Map(shopProducts.map((product) => [product.id, product]));
  const resolveCollection = (products: typeof selectedProducts) =>
    products.flatMap((product) => {
      const shopProduct = shopProductById.get(product.id);
      return shopProduct ? [shopProduct] : [];
    });

  return (
    <>
      <Hero />
      <LandingCollections
        newArrivals={resolveCollection(newArrivals)}
        offers={resolveCollection(offers)}
        bestsellers={resolveCollection(rankedBestsellers)}
      />
      <CategoryGrid />
      <TrustedBrands />
      <InnerCircle />
    </>
  );
}
