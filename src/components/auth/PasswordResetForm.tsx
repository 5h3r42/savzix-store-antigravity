"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PasswordResetFormProps = {
  isRecoverySession: boolean;
};

export function PasswordResetForm({ isRecoverySession }: PasswordResetFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase is not configured. Please try again later.");
      }

      if (isRecoverySession) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
          throw new Error(updateError.message);
        }

        setSuccess("Your password has been updated. You can now sign in.");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password?mode=update")}`,
        },
      );

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess("If an account exists for that email address, we have sent password reset instructions.");
      setEmail("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset your password right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account support</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {isRecoverySession ? "Choose a new password" : "Reset your password"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {isRecoverySession
          ? "Use a new password with at least eight characters."
          : "Enter your email address and we will send a secure password reset link if an account exists."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isRecoverySession ? (
          <>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-new-password" className="text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {isRecoverySession ? "Save new password" : "Send reset link"}
          {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
        Return to sign in
      </Link>
    </div>
  );
}
