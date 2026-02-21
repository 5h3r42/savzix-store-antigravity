"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export function Navbar() {
  const { openCart, cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Logo (Left) */}
        <Link
          href="/"
          className="justify-self-start text-2xl font-bold tracking-tighter uppercase"
        >
          SAVZIX
        </Link>

        {/* Links (Center) */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground justify-self-center">
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </div>

        {/* Cart (Right Mobile/Desktop) */}
        <div className="flex items-center gap-4 justify-self-end">
          <Link
            href="/login"
            className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            Login
          </Link>
          <button 
            onClick={openCart}
            className="relative p-2 hover:text-primary transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-[10px] text-primary-foreground flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
