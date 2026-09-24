import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getSessionContext } from "@/lib/auth/session";
import { cleanTitle } from "@/lib/productText";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl, getStripeClient } from "@/lib/stripe";

type CheckoutRequestItem = {
  id: string;
  quantity: number;
};

type CheckoutCustomerPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
};

type CheckoutRequestPayload = {
  items?: CheckoutRequestItem[];
  customer?: CheckoutCustomerPayload;
};

const RESERVATION_WINDOW_MINUTES = 30;

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function toMinorUnits(value: number) {
  return Math.round(toMoney(value) * 100);
}

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-8);
  const randomSuffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

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
    .filter(
      (item) => item.id.length > 0 && Number.isInteger(item.quantity) && item.quantity > 0,
    );
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeCustomer(customer: CheckoutCustomerPayload | undefined) {
  return {
    firstName: sanitizeText(customer?.firstName),
    lastName: sanitizeText(customer?.lastName),
    email: sanitizeText(customer?.email).toLowerCase(),
    phone: sanitizeText(customer?.phone),
    address: sanitizeText(customer?.address),
    city: sanitizeText(customer?.city),
    postalCode: sanitizeText(customer?.postalCode),
    country: sanitizeText(customer?.country) || "United Kingdom",
    notes: sanitizeText(customer?.notes),
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateCustomer(customer: ReturnType<typeof sanitizeCustomer>) {
  if (!customer.firstName || !customer.lastName) {
    return "First name and last name are required.";
  }

  if (!isValidEmail(customer.email)) {
    return "A valid email address is required.";
  }

  if (!customer.phone) {
    return "A phone number is required.";
  }

  if (!customer.address || !customer.city || !customer.postalCode) {
    return "Complete shipping address is required.";
  }

  if (customer.country.toLowerCase() !== "united kingdom") {
    return "Launch checkout is currently available for United Kingdom orders only.";
  }

  return null;
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
    const customer = sanitizeCustomer(payload.customer);

    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const customerValidationError = validateCustomer(customer);
    if (customerValidationError) {
      return NextResponse.json({ error: customerValidationError }, { status: 400 });
    }

    const adminSupabase = createAdminSupabaseClient();
    const itemIds = [...new Set(items.map((item) => item.id))];

    const [{ data: bySlugRows, error: bySlugError }, { data: byIdRows, error: byIdError }] =
      await Promise.all([
        adminSupabase
          .from("products")
          .select("id, slug, name, image, price, stock, reserved_quantity, status")
          .in("slug", itemIds),
        adminSupabase
          .from("products")
          .select("id, slug, name, image, price, stock, reserved_quantity, status")
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
        Number(product.price) < 0 ||
        product.stock - product.reserved_quantity < item.quantity,
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
    const reservationExpiresAt = new Date(
      Date.now() + RESERVATION_WINDOW_MINUTES * 60 * 1000,
    );

    const reservationItems = resolvedItems.map(({ item, product }) => ({
      product_id: product!.id,
      quantity: item.quantity,
      unit_price: toMoney(Number(product!.price)),
    }));

    // Reserve stock and persist the unpaid order in one database transaction.
    const { error: reserveOrderError } = await adminSupabase.rpc(
      "create_order_with_stock_reservation",
      {
        p_order_id: orderId,
        p_user_id: session.user.id,
        p_customer_email: customer.email,
        p_customer_first_name: customer.firstName,
        p_customer_last_name: customer.lastName,
        p_customer_phone: customer.phone,
        p_shipping_address_line1: customer.address,
        p_shipping_city: customer.city,
        p_shipping_postal_code: customer.postalCode,
        p_shipping_country: customer.country,
        p_notes: customer.notes,
        p_currency: siteConfig.currency,
        p_payment_provider: "stripe",
        p_subtotal: toMoney(subtotal),
        p_shipping: toMoney(shipping),
        p_total: toMoney(total),
        p_reservation_expires_at: reservationExpiresAt.toISOString(),
        p_items: reservationItems,
      },
    );

    if (reserveOrderError) {
      const message =
        reserveOrderError.message || "Failed to reserve stock for checkout.";
      const isInventoryError =
        message.includes("Insufficient stock") ||
        message.includes("Product unavailable") ||
        message.includes("could not be reserved");

      return NextResponse.json(
        { error: message },
        { status: isInventoryError ? 400 : 500 },
      );
    }

    try {
      const stripe = getStripeClient();
      const siteUrl = getSiteUrl();
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customer.email,
        client_reference_id: orderId,
        success_url: `${siteUrl}/order-confirmation?order=${encodeURIComponent(orderId)}`,
        cancel_url: `${siteUrl}/checkout?cancelled=1`,
        expires_at: Math.floor(reservationExpiresAt.getTime() / 1000),
        metadata: {
          order_id: orderId,
          user_id: session.user.id,
        },
        payment_intent_data: {
          metadata: {
            order_id: orderId,
            user_id: session.user.id,
          },
        },
        line_items: [
          ...resolvedItems.map(({ item, product }) => ({
            quantity: item.quantity,
            price_data: {
              currency: siteConfig.currency.toLowerCase(),
              unit_amount: toMinorUnits(Number(product!.price)),
              product_data: {
                name: cleanTitle(product!.name),
                images:
                  typeof product!.image === "string" && product!.image.startsWith("https://")
                    ? [product!.image]
                    : undefined,
              },
            },
          })),
          ...(shipping > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: siteConfig.currency.toLowerCase(),
                    unit_amount: toMinorUnits(shipping),
                    product_data: {
                      name: "Shipping",
                    },
                  },
                },
              ]
            : []),
        ],
      });

      const { error: sessionSaveError } = await adminSupabase
        .from("orders")
        .update({ stripe_checkout_session_id: checkoutSession.id })
        .eq("id", orderId);

      if (sessionSaveError || !checkoutSession.url) {
        await adminSupabase.rpc("release_order_stock_reservation", {
          p_order_id: orderId,
          p_payment_status: "failed",
          p_status: "Cancelled",
        });
        throw new Error("Failed to prepare secure payment session.");
      }

      return NextResponse.json(
        { orderId, checkoutUrl: checkoutSession.url },
        { status: 201 },
      );
    } catch (stripeError) {
      await adminSupabase.rpc("release_order_stock_reservation", {
        p_order_id: orderId,
        p_payment_status: "failed",
        p_status: "Cancelled",
      });

      const message =
        stripeError instanceof Error
          ? stripeError.message
          : "Failed to create payment session.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    console.error("Checkout route failed.", error);
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
