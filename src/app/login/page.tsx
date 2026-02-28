"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

function getSafeRedirect(nextPath: string | null, fallback: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return fallback;
  }

  return nextPath;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login"); // ADDED: support self-serve customer registration.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }

      const sanitizedEmail = email.trim().toLowerCase();
      const nextPath = getSafeRedirect(
        new URLSearchParams(window.location.search).get("next"),
        "/account",
      );

      if (mode === "signup") {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }

        setSuccess(
          "Account created. Check your email to confirm your address, then sign in.",
        );
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      router.push(nextPath);
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
            <div className="mb-6 inline-flex rounded-full border border-border p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  mode === "login"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccess(null);
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  mode === "signup"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <h1 className="mb-4 text-4xl font-light">
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Please enter your details to access your account."
                : "Create a customer account to manage orders and checkout faster."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === "signup" ? (
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-none border-b border-border bg-transparent py-3 placeholder:text-muted/50 focus:border-primary focus:outline-none transition-all"
                />
              </div>
            ) : null}

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

            {mode === "signup" ? (
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-none border-b border-border bg-transparent py-3 placeholder:text-muted/50 focus:border-primary focus:outline-none transition-all"
                />
              </div>
            ) : null}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
                {success}
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
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  Create an account
                </button>
                .
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  Sign in
                </button>
                .
              </>
            )}
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
