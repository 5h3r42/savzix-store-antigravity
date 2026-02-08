import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Menu className="w-6 h-6" />
        </div>

        {/* Links (Left) */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </div>

        {/* Logo (Center) */}
        <Link href="/" className="text-2xl font-bold tracking-tighter uppercase">
          Radiance
        </Link>

        {/* Links (Right) */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
          <Link href="/journal" className="hover:text-primary transition-colors">
            Journal
          </Link>
          <Link href="/wellness" className="hover:text-primary transition-colors">
            Wellness
          </Link>
        </div>

        {/* Cart (Right Mobile/Desktop) */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
