import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground py-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Collections */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-6 text-primary">Collections</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li><Link href="/collections/face" className="hover:text-primary transition-colors">Face Rituals</Link></li>
            <li><Link href="/collections/body" className="hover:text-primary transition-colors">Body Care</Link></li>
            <li><Link href="/collections/hair" className="hover:text-primary transition-colors">Hair Restoration</Link></li>
            <li><Link href="/collections/gifts" className="hover:text-primary transition-colors">Gifts & Sets</Link></li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-6 text-primary">Discover</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li><Link href="/story" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link href="/journal" className="hover:text-primary transition-colors">The Journal</Link></li>
            <li><Link href="/stockists" className="hover:text-primary transition-colors">Stockists</Link></li>
            <li><Link href="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-6 text-primary">Support</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping</Link></li>
            <li><Link href="/returns" className="hover:text-primary transition-colors">Returns</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-6 text-primary">Legal</h3>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Radiance Redefined. All rights reserved.</p>
        <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
            <p>Made with Stitch</p>
        </div>
      </div>
    </footer>
  );
}
