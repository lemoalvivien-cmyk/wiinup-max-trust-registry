import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16" });
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Idempotency check
  const { data: existing } = await supabase
    .from("stripe_webhook_logs")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan || "starter";
        if (userId) {
          await supabase.from("profiles").update({
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
            subscription_plan: plan,
          }).eq("id", userId);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await supabase.from("profiles").update({
          subscription_status: "active",
        }).eq("stripe_customer_id", customerId);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await supabase.from("profiles").update({
          subscription_status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
        }).eq("stripe_customer_id", customerId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await supabase.from("profiles").update({
          subscription_status: "canceled",
        }).eq("stripe_customer_id", customerId);
        break;
      }
    }

    await supabase.from("stripe_webhook_logs").insert({
      event_type: event.type,
      event_id: event.id,
      status: "processed",
    });

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    await supabase.from("stripe_webhook_logs").insert({
      event_type: event.type,
      event_id: event.id,
      status: "error",
      error_message: error.message,
    });
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
