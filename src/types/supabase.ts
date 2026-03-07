export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type ProductStatus = "Active" | "Draft" | "Archived";
export type OrderStatus = "Pending" | "Confirmed" | "Cancelled";
export type OrderPaymentStatus = "unpaid" | "paid" | "failed" | "expired" | "refunded";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          path: string | null;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          path?: string | null;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          path?: string | null;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          brand: string;
          category: string;
          price: number;
          stock: number;
          status: ProductStatus;
          image: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          description: string;
          brand?: string;
          category: string;
          price: number;
          stock: number;
          status?: ProductStatus;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          brand?: string;
          category?: string;
          price?: number;
          stock?: number;
          status?: ProductStatus;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_email: string | null;
          customer_first_name: string | null;
          customer_last_name: string | null;
          customer_phone: string | null;
          shipping_address_line1: string | null;
          shipping_city: string | null;
          shipping_postal_code: string | null;
          shipping_country: string | null;
          notes: string | null;
          currency: string;
          payment_provider: string;
          payment_status: OrderPaymentStatus;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          paid_at: string | null;
          subtotal: number;
          shipping: number;
          total: number;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          customer_email?: string | null;
          customer_first_name?: string | null;
          customer_last_name?: string | null;
          customer_phone?: string | null;
          shipping_address_line1?: string | null;
          shipping_city?: string | null;
          shipping_postal_code?: string | null;
          shipping_country?: string | null;
          notes?: string | null;
          currency?: string;
          payment_provider?: string;
          payment_status?: OrderPaymentStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          subtotal: number;
          shipping: number;
          total: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_email?: string | null;
          customer_first_name?: string | null;
          customer_last_name?: string | null;
          customer_phone?: string | null;
          shipping_address_line1?: string | null;
          shipping_city?: string | null;
          shipping_postal_code?: string | null;
          shipping_country?: string | null;
          notes?: string | null;
          currency?: string;
          payment_provider?: string;
          payment_status?: OrderPaymentStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          subtotal?: number;
          shipping?: number;
          total?: number;
          status?: OrderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: number;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: number;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      confirm_paid_order: {
        Args: {
          p_order_id: string;
          p_payment_intent_id?: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
