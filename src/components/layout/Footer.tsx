import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground py-20 border-t border-border">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 px-6 md:grid-cols-3">
        <div>
          <h3 className="mb-6 font-bold uppercase tracking-widest text-primary">Shop</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li>
              <Link href="/shop" className="hover:text-primary transition-colors">
                Shop All
              </Link>
            </li>
            <li>
              <Link href="/c/beauty-skincare" className="hover:text-primary transition-colors">
                Beauty &amp; Skincare
              </Link>
            </li>
            <li>
              <Link href="/c/fragrance" className="hover:text-primary transition-colors">
                Fragrance
              </Link>
            </li>
            <li>
              <Link href="/c/gift-sets" className="hover:text-primary transition-colors">
                Gift Sets
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 font-bold uppercase tracking-widest text-primary">Support</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-primary transition-colors">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-primary transition-colors">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 font-bold uppercase tracking-widest text-primary">Legal</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 border-t border-border px-6 pt-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SAVZIX. All rights reserved.</p>
      </div>
    </footer>
  );
}
