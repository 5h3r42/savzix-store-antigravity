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

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      const destination = getSafeRedirect(
        new URLSearchParams(window.location.search).get("next"),
        "/admin",
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-[0_0_30px_-5px_var(--color-primary)]">
            <span className="text-3xl font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground">Secure access for Savzix staff only.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@savzix.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
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
                className="w-full rounded-xl border border-border bg-background px-4 py-3 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              ← Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
