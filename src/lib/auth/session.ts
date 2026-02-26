import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, UserRole } from "@/types/supabase";

export type SessionContext = {
  user: User;
  role: UserRole;
};

async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.role ?? null;
}

export async function getSessionContext(
  supabase: SupabaseClient<Database>,
): Promise<SessionContext | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role = await getUserRole(supabase, user.id);

  if (!role) {
    return null;
  }

  return { user, role };
}

export async function isAdmin(
  supabase: SupabaseClient<Database>,
): Promise<boolean> {
  const context = await getSessionContext(supabase);
  return context?.role === "admin";
}
