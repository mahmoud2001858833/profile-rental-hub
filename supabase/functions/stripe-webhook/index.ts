import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // If we have a webhook secret, verify the signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Webhook signature verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    console.log("Received Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log("Checkout completed for user:", userId);

        if (userId && subscriptionId) {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Check if subscription record exists
          const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          const subscriptionData = {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          };

          if (existingSub) {
            // Update existing subscription
            const { error } = await supabase
              .from("subscriptions")
              .update(subscriptionData)
              .eq("user_id", userId);

            if (error) {
              console.error("Error updating subscription:", error);
            }
          } else {
            // Insert new subscription
            const { error } = await supabase
              .from("subscriptions")
              .insert(subscriptionData);

            if (error) {
              console.error("Error inserting subscription:", error);
            }
          }

          // Enable the user's page
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ page_enabled: true })
            .eq("user_id", userId);

          if (profileError) {
            console.error("Error enabling page:", profileError);
          }

          // Create a payment receipt record
          const { error: receiptError } = await supabase
            .from("payment_receipts")
            .insert({
              user_id: userId,
              amount: 15,
              currency: "USD",
              status: "approved",
              receipt_url: session.invoice ? `https://dashboard.stripe.com/invoices/${session.invoice}` : "",
              payment_month: new Date().toISOString().slice(0, 10),
            });

          if (receiptError) {
            console.error("Error creating receipt:", receiptError);
          }

          console.log("Subscription activated for user:", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (subRecord) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";

          // Update subscription
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: isActive ? "active" : "inactive",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("Error updating subscription:", error);
          }

          // Update page status
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ page_enabled: isActive })
            .eq("user_id", subRecord.user_id);

          if (profileError) {
            console.error("Error updating page status:", profileError);
          }

          console.log("Subscription updated for customer:", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (subRecord) {
          // Update subscription to inactive
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "inactive" })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("Error deactivating subscription:", error);
          }

          // Disable user's page
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ page_enabled: false })
            .eq("user_id", subRecord.user_id);

          if (profileError) {
            console.error("Error disabling page:", profileError);
          }

          console.log("Subscription cancelled for customer:", customerId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Find user by customer ID
          const { data: subRecord } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();

          if (subRecord) {
            // Create payment receipt for recurring payment
            const { error } = await supabase
              .from("payment_receipts")
              .insert({
                user_id: subRecord.user_id,
                amount: (invoice.amount_paid || 0) / 100,
                currency: invoice.currency?.toUpperCase() || "USD",
                status: "approved",
                receipt_url: invoice.hosted_invoice_url || "",
                payment_month: new Date().toISOString().slice(0, 10),
              });

            if (error) {
              console.error("Error creating receipt:", error);
            }

            // Ensure page is enabled
            const { error: profileError } = await supabase
              .from("profiles")
              .update({ page_enabled: true })
              .eq("user_id", subRecord.user_id);

            if (profileError) {
              console.error("Error enabling page:", profileError);
            }

            console.log("Invoice payment succeeded for customer:", customerId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (subRecord) {
          console.log("Payment failed for user:", subRecord.user_id);
          // You might want to send a notification here
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
