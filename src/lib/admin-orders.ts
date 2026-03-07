import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/formatPrice";
import type {
  Database,
  OrderPaymentStatus,
  OrderStatus,
} from "@/types/supabase";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type OrderSummaryRow = Pick<
  OrderRow,
  | "id"
  | "user_id"
  | "total"
  | "subtotal"
  | "shipping"
  | "status"
  | "payment_status"
  | "created_at"
  | "customer_email"
  | "customer_first_name"
  | "customer_last_name"
  | "currency"
>;

export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  itemCount: number;
  createdAt: string;
  currency: string;
};

export type AdminOrderDetail = AdminOrderListItem & {
  customerPhone: string;
  shippingAddressLine1: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string;
  paidAt: string | null;
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type AdminOrdersQuery = {
  query?: string;
  status?: OrderStatus | "all";
  paymentStatus?: OrderPaymentStatus | "all";
};

function getDisplayName(order: OrderSummaryRow, profile: Pick<ProfileRow, "name" | "email"> | null) {
  const customerName = `${order.customer_first_name ?? ""} ${order.customer_last_name ?? ""}`
    .trim();

  if (customerName) {
    return customerName;
  }

  if (profile?.name?.trim()) {
    return profile.name.trim();
  }

  const email = order.customer_email ?? profile?.email ?? "";
  return email.split("@")[0] || "Customer";
}

function getDisplayEmail(order: OrderSummaryRow, profile: Pick<ProfileRow, "email"> | null) {
  return order.customer_email ?? profile?.email ?? "";
}

function buildItemCountMap(items: Pick<OrderItemRow, "order_id" | "quantity">[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item.order_id, (counts.get(item.order_id) ?? 0) + item.quantity);
  }

  return counts;
}

async function loadProfilesByUserId(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, Pick<ProfileRow, "name" | "email">>();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", userIds);

  if (error) {
    throw new Error("Failed to load customer profiles.");
  }

  return new Map(
    (data ?? []).map((profile) => [profile.id, { name: profile.name, email: profile.email }]),
  );
}

export async function getAdminOrders(query: AdminOrdersQuery = {}) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, total, subtotal, shipping, status, payment_status, created_at, customer_email, customer_first_name, customer_last_name, currency",
    )
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    throw new Error("Failed to load admin orders.");
  }

  const orders = (data ?? []) as OrderSummaryRow[];
  const orderIds = orders.map((order) => order.id);
  const userIds = [...new Set(orders.map((order) => order.user_id))];

  const [profilesByUserId, orderItemsResult] = await Promise.all([
    loadProfilesByUserId(userIds),
    orderIds.length > 0
      ? supabase.from("order_items").select("order_id, quantity").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (orderItemsResult.error) {
    throw new Error("Failed to load order item counts.");
  }

  const itemCountByOrderId = buildItemCountMap(orderItemsResult.data ?? []);
  const normalizedQuery = query.query?.trim().toLowerCase() ?? "";

  return orders
    .map((order) => {
      const profile = profilesByUserId.get(order.user_id) ?? null;
      const customerName = getDisplayName(order, profile);
      const customerEmail = getDisplayEmail(order, profile);

      return {
        id: order.id,
        customerName,
        customerEmail,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        status: order.status,
        paymentStatus: order.payment_status,
        itemCount: itemCountByOrderId.get(order.id) ?? 0,
        createdAt: order.created_at,
        currency: order.currency,
      } satisfies AdminOrderListItem;
    })
    .filter((order) => {
      if (query.status && query.status !== "all" && order.status !== query.status) {
        return false;
      }

      if (
        query.paymentStatus &&
        query.paymentStatus !== "all" &&
        order.paymentStatus !== query.paymentStatus
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${order.id} ${order.customerName} ${order.customerEmail}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
}

export async function getAdminOrderDetail(orderId: string) {
  const supabase = createAdminSupabaseClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `id, user_id, total, subtotal, shipping, status, payment_status, created_at, customer_email, customer_first_name, customer_last_name, customer_phone, shipping_address_line1, shipping_city, shipping_postal_code, shipping_country, notes, stripe_checkout_session_id, stripe_payment_intent_id, paid_at, currency`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error("Failed to load order detail.");
  }

  if (!order) {
    return null;
  }

  const [{ data: itemRows, error: itemsError }, profilesByUserId] = await Promise.all([
    supabase
      .from("order_items")
      .select("order_id, product_id, quantity, unit_price")
      .eq("order_id", orderId),
    loadProfilesByUserId([order.user_id]),
  ]);

  if (itemsError) {
    throw new Error("Failed to load order items.");
  }

  const productIds = [...new Set((itemRows ?? []).map((item) => item.product_id))];
  const { data: productRows, error: productsError } = productIds.length
    ? await supabase.from("products").select("id, slug, name, image").in("id", productIds)
    : { data: [], error: null };

  if (productsError) {
    throw new Error("Failed to load order products.");
  }

  const productById = new Map(
    ((productRows ?? []) as Pick<ProductRow, "id" | "slug" | "name" | "image">[]).map(
      (product) => [product.id, product],
    ),
  );
  const profile = profilesByUserId.get(order.user_id) ?? null;
  const customerName = getDisplayName(order, profile);
  const customerEmail = getDisplayEmail(order, profile);

  return {
    id: order.id,
    customerName,
    customerEmail,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    status: order.status,
    paymentStatus: order.payment_status,
    itemCount: (itemRows ?? []).reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.created_at,
    currency: order.currency,
    customerPhone: order.customer_phone ?? "",
    shippingAddressLine1: order.shipping_address_line1 ?? "",
    shippingCity: order.shipping_city ?? "",
    shippingPostalCode: order.shipping_postal_code ?? "",
    shippingCountry: order.shipping_country ?? "",
    notes: order.notes ?? "",
    stripeCheckoutSessionId: order.stripe_checkout_session_id ?? "",
    stripePaymentIntentId: order.stripe_payment_intent_id ?? "",
    paidAt: order.paid_at,
    items: (itemRows ?? []).map((item) => {
      const product = productById.get(item.product_id);
      return {
        productId: item.product_id,
        slug: product?.slug ?? item.product_id,
        name: product?.name ?? item.product_id,
        image: product?.image ?? "/product_bottle.png",
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.unit_price) * item.quantity,
      };
    }),
  } satisfies AdminOrderDetail;
}

export async function getAdminDashboardSnapshot() {
  const [orders, productsResult, customersResult] = await Promise.all([
    getAdminOrders(),
    createAdminSupabaseClient()
      .from("products")
      .select("id, stock", { count: "exact" }),
    createAdminSupabaseClient()
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  if (productsResult.error) {
    throw new Error("Failed to load admin product snapshot.");
  }

  if (customersResult.error) {
    throw new Error("Failed to load admin customer snapshot.");
  }

  const lowStockCount = (productsResult.data ?? []).filter((product) => product.stock < 15).length;
  const confirmedRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  return {
    totalRevenue: formatPrice(confirmedRevenue),
    totalOrders: orders.length,
    paidOrders: orders.filter((order) => order.paymentStatus === "paid").length,
    pendingOrders: orders.filter((order) => order.paymentStatus === "unpaid").length,
    lowStockCount,
    customerCount: customersResult.count ?? 0,
    recentOrders: orders.slice(0, 5),
  };
}
