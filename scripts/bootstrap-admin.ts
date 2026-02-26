import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type UserRole = "customer" | "admin";

type ProfileUpsert = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function findUserByEmail(
  supabase: SupabaseClient,
  email: string,
) {
  const normalized = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === normalized,
    );

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return null;
}

async function main() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = required("ADMIN_EMAIL").trim().toLowerCase();

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const user = await findUserByEmail(supabase, adminEmail);

  if (!user || !user.email) {
    throw new Error(
      `No auth user found for ${adminEmail}. Ask the admin to sign up first, then run this command again.`,
    );
  }

  const profile: ProfileUpsert = {
    id: user.id,
    email: user.email,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email.split("@")[0],
    role: "admin",
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to upsert admin profile: ${error.message}`);
  }

  console.log(`Admin role granted to ${adminEmail}.`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown bootstrap error";
  console.error(message);
  process.exit(1);
});
