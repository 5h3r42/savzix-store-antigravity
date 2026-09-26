import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { InnerCircle } from "@/components/home/InnerCircle";
import { LandingCollections, TrustedBrands } from "@/components/home/LandingCollections";
import { selectDailyCollection } from "@/lib/daily-collection-rotation";
import { getBestsellerProducts, getPublicProducts } from "@/lib/products-store";
import { mapProductsToShopProducts } from "@/lib/shop-products";

export const dynamic = "force-dynamic";

const LANDING_COLLECTION_SIZE = 4;
const LANDING_COLLECTION_CANDIDATE_LIMIT = 12;

export default async function Home() {
  const [publicProducts, rankedBestsellers] = await Promise.all([
    getPublicProducts(),
    getBestsellerProducts({ limit: LANDING_COLLECTION_CANDIDATE_LIMIT }),
  ]);
  const newArrivals = selectDailyCollection(
    publicProducts,
    "new-arrivals",
    LANDING_COLLECTION_SIZE,
    LANDING_COLLECTION_CANDIDATE_LIMIT,
  );
  const offers = selectDailyCollection(
    [...publicProducts].sort((first, second) => first.price - second.price),
    "offers",
    LANDING_COLLECTION_SIZE,
    LANDING_COLLECTION_CANDIDATE_LIMIT,
  );
  const bestsellers = selectDailyCollection(
    rankedBestsellers,
    "bestsellers",
    LANDING_COLLECTION_SIZE,
    LANDING_COLLECTION_CANDIDATE_LIMIT,
  );
  const selectedProducts = [
    ...new Map(
      [...newArrivals, ...offers, ...bestsellers].map((product) => [product.id, product]),
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
        bestsellers={resolveCollection(bestsellers)}
      />
      <CategoryGrid />
      <TrustedBrands />
      <InnerCircle />
    </>
  );
}
