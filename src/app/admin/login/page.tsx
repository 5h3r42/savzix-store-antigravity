"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full"></div>
        </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_var(--color-primary)]">
                <span className="font-bold text-3xl text-primary-foreground">S</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Secure access for Savzix staff only.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="admin@savzix.com"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
             <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                ← Return to Store
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
