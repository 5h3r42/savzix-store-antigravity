import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function updateOrderPaymentState(
  orderId: string,
  paymentStatus: "failed" | "expired",
  paymentIntentId?: string | null,
) {
  const supabase = createAdminSupabaseClient();
  const update: Record<string, string | null> = {
    payment_status: paymentStatus,
    status: "Cancelled",
  };

  if (paymentIntentId) {
    update.stripe_payment_intent_id = paymentIntentId;
  }

  const query = supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .neq("payment_status", "paid");

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to update order ${orderId}: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      required("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id ?? session.client_reference_id;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        if (!orderId) {
          throw new Error("Stripe checkout session missing order metadata.");
        }

        if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
          const supabase = createAdminSupabaseClient();
          const { error } = await supabase.rpc("confirm_paid_order", {
            p_order_id: orderId,
            p_payment_intent_id: paymentIntentId,
          });

          if (error) {
            throw new Error(`Failed to confirm paid order ${orderId}: ${error.message}`);
          }
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id ?? session.client_reference_id;

        if (orderId) {
          await updateOrderPaymentState(orderId, "expired");
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await updateOrderPaymentState(orderId, "failed", paymentIntent.id);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed.", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
