import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getSessionContext } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutRequestItem = {
  id: string;
  quantity: number;
};

type CheckoutRequestPayload = {
  items?: CheckoutRequestItem[];
};

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-8);
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${timestamp}-${randomSuffix}`;
}

function sanitizeItems(items: CheckoutRequestItem[] | undefined) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      id: typeof item.id === "string" ? item.id.trim() : "",
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.id.length > 0 && Number.isInteger(item.quantity) && item.quantity > 0);
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const session = await getSessionContext(supabase);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const payload = (await request.json()) as CheckoutRequestPayload;
    const items = sanitizeItems(payload.items);
    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const adminSupabase = createAdminSupabaseClient();
    const itemIds = [...new Set(items.map((item) => item.id))];

    const [{ data: bySlugRows, error: bySlugError }, { data: byIdRows, error: byIdError }] =
      await Promise.all([
        adminSupabase
          .from("products")
          .select("id, slug, price, stock, status")
          .in("slug", itemIds),
        adminSupabase
          .from("products")
          .select("id, slug, price, stock, status")
          .in("id", itemIds),
      ]);

    if (bySlugError || byIdError) {
      return NextResponse.json(
        { error: "Failed to load product information for checkout." },
        { status: 500 },
      );
    }

    const productBySlug = new Map((bySlugRows ?? []).map((row) => [row.slug, row]));
    const productById = new Map((byIdRows ?? []).map((row) => [row.id, row]));

    const resolvedItems = items.map((item) => {
      const product = productBySlug.get(item.id) ?? productById.get(item.id);
      return { item, product };
    });

    const missingProduct = resolvedItems.find(({ product }) => !product);
    if (missingProduct) {
      return NextResponse.json(
        { error: `Product not found: ${missingProduct.item.id}` },
        { status: 400 },
      );
    }

    const invalidProduct = resolvedItems.find(
      ({ item, product }) =>
        !product ||
        product.status !== "Active" ||
        product.stock < item.quantity ||
        Number(product.price) < 0,
    );

    if (invalidProduct) {
      return NextResponse.json(
        {
          error: `Product unavailable or insufficient stock: ${invalidProduct.item.id}`,
        },
        { status: 400 },
      );
    }

    const subtotal = resolvedItems.reduce(
      (sum, { item, product }) => sum + Number(product!.price) * item.quantity,
      0,
    );
    const shipping =
      subtotal >= siteConfig.shippingThreshold || subtotal === 0
        ? 0
        : siteConfig.shippingFlatRate;
    const total = subtotal + shipping;
    const orderId = generateOrderId();

    const { error: orderError } = await adminSupabase.from("orders").insert({
      id: orderId,
      user_id: session.user.id,
      subtotal: toMoney(subtotal),
      shipping: toMoney(shipping),
      total: toMoney(total),
      status: "Pending",
    });

    if (orderError) {
      return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
    }

    const orderItemPayload = resolvedItems.map(({ item, product }) => ({
      order_id: orderId,
      product_id: product!.id,
      quantity: item.quantity,
      unit_price: toMoney(Number(product!.price)),
    }));

    const { error: orderItemsError } = await adminSupabase
      .from("order_items")
      .insert(orderItemPayload);

    if (orderItemsError) {
      await adminSupabase.from("orders").delete().eq("id", orderId);

      return NextResponse.json(
        { error: "Failed to create order items." },
        { status: 500 },
      );
    }

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    console.error("Checkout route failed.", error);
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
