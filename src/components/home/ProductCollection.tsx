import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

const products = [
  {
    name: "Aurum Elixir Serum",
    description: "24k Gold & Peptides",
    price: "$120",
    href: "/products/aurum-elixir",
    reviews: 4.9,
  },
  {
    name: "Nocturnal Radiance",
    description: "Overnight Repair Complex",
    price: "$95",
    href: "/products/nocturnal-radiance",
    reviews: 4.8,
  },
  {
    name: "Solar Glow Oil",
    description: "Sun-Kissed Nourishment",
    price: "$65",
    href: "/products/solar-glow-oil",
    reviews: 4.7,
  },
  {
    name: "Pure Essence Balm",
    description: "Botanical Silk Cleanser",
    price: "$55",
    href: "/products/pure-essence-balm",
    reviews: 4.9,
  },
];

export function ProductCollection() {
  return (
    <section className="bg-background py-32 border-b border-border text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[150px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight text-foreground">
          The <span className="text-primary italic font-serif">Radiance</span> Collection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
             <ProductCard key={i} product={product} />
          ))}
        </div>
        <div className="mt-16">
          <Link href="/shop" className="inline-block px-12 py-4 border border-border bg-card hover:border-primary hover:text-primary transition-all duration-300 rounded-full font-bold uppercase tracking-widest text-sm">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 flex flex-col items-center text-left">
      <div className="relative w-full aspect-[3/4] bg-muted/20 overflow-hidden">
        {/* Placeholder for generated image */}
         <Image 
           src="/product_bottle.png" 
           alt={product.name} 
           fill 
           className="object-cover group-hover:scale-105 transition-transform duration-700"
         />
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-border">
          {product.price}
        </div>
      </div>
      
      <div className="p-8 w-full">
        <div className="flex items-center gap-1 mb-2 text-primary">
          <Star className="w-3 h-3 fill-primary" />
          <span className="text-xs text-muted-foreground font-mono">{product.reviews}</span>
        </div>
        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
        
        <button className="w-full py-3 border border-border rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-bold text-xs uppercase tracking-widest">
            Add to Cart
        </button>
      </div>
    </div>
  );
}
