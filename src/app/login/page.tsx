"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function getSafeRedirect(nextPath: string | null, fallback: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return fallback;
  }

  return nextPath;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const destination = getSafeRedirect(
        new URLSearchParams(window.location.search).get("next"),
        "/account",
      );
      router.push(destination);
      router.refresh();
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-center bg-background px-8 py-12 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-12 inline-block">
            <span className="text-2xl font-bold tracking-tighter">SAVZIX</span>
          </Link>

          <div className="mb-10">
            <h1 className="mb-4 text-4xl font-light">Welcome Back</h1>
            <p className="text-muted-foreground">
              Please enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-none border-b border-border bg-transparent py-3 placeholder:text-muted/50 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-none border-b border-border bg-transparent py-3 placeholder:text-muted/50 focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 font-bold text-background transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            New here? Ask an admin to create your account in Supabase Auth.
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted/20 lg:block">
        <div className="absolute inset-0 bg-[url('/hero_bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute bottom-24 left-12 right-12 rounded-3xl border border-white/10 bg-black/20 p-8 text-white backdrop-blur-md">
          <p className="mb-4 text-xl font-light italic leading-relaxed">
            &quot;Savzix has completely transformed my daily ritual. It&apos;s not just skincare, it&apos;s a moment of pure luxury.&quot;
          </p>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/20"></div>
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
