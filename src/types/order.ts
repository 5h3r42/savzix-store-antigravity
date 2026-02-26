import type { OrderStatus } from "@/types/supabase";

export type OrderSummary = {
  id: string;
  userId: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};
