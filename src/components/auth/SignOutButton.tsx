"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  children?: ReactNode;
  className?: string;
  redirectTo?: string;
  onSignedOut?: () => void;
};

export function SignOutButton({
  children = "Sign Out",
  className,
  redirectTo = "/login",
  onSignedOut,
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      onSignedOut?.();
      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Signing out..." : children}
    </button>
  );
}
