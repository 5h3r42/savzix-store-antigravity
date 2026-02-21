"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push("/account");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Login Form */}
      <div className="flex flex-col justify-center px-8 lg:px-24 py-12 bg-background relative z-10">
        <div className="max-w-md w-full mx-auto">
            <Link href="/" className="inline-block mb-12">
                <span className="font-bold text-2xl tracking-tighter">SAVZIX</span>
            </Link>

            <div className="mb-10">
                <h1 className="text-4xl font-light mb-4">Welcome Back</h1>
                <p className="text-muted-foreground">Please enter your details to access your account.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-all rounded-none placeholder:text-muted/50"
                />
                </div>
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                    <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-all rounded-none placeholder:text-muted/50"
                />
                </div>
                
                <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background font-bold py-4 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 group mt-8"
                >
                {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
                </button>
            </form>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
            </div>
        </div>
      </div>

      {/* Right: Brand Image */}
      <div className="hidden lg:block relative bg-muted/20">
        <div className="absolute inset-0 bg-[url('/hero_bg.jpg')] bg-cover bg-center opacity-50 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute bottom-24 left-12 right-12 text-white p-8 bg-black/20 backdrop-blur-md rounded-3xl border border-white/10">
            <p className="text-xl font-light italic leading-relaxed mb-4">
            &quot;Savzix has completely transformed my daily ritual. It&apos;s not just skincare, it&apos;s a moment of pure luxury.&quot;
            </p>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20"></div>
                <div>
                    <p className="font-bold">Sofia Martinez</p>
                    <p className="text-xs opacity-70">Verified Customer</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
