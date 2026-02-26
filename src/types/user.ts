import type { UserRole } from "@/types/supabase";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};
