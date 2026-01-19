import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ADMIN_PASSWORD = "12345678";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin password
    const adminPassword = req.headers.get("x-admin-password");
    if (adminPassword !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "fetch") {
      // Fetch all merchants
      const { data: merchants, error: merchantsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "merchant")
        .order("created_at", { ascending: false });

      if (merchantsError) throw merchantsError;

      // Fetch all payment receipts
      const { data: receipts, error: receiptsError } = await supabase
        .from("payment_receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (receiptsError) throw receiptsError;

      // Enrich receipts with merchant info
      const enrichedReceipts = await Promise.all(
        (receipts || []).map(async (receipt: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, phone")
            .eq("user_id", receipt.user_id)
            .single();

          return {
            ...receipt,
            merchant_name: profile?.display_name || "بدون اسم",
            merchant_phone: profile?.phone || "",
          };
        })
      );

      // Fetch all products
      const { data: products, error: productsError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Enrich products with merchant info
      const enrichedProducts = await Promise.all(
        (products || []).map(async (product: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, phone")
            .eq("user_id", product.user_id)
            .single();

          return {
            ...product,
            merchant_name: profile?.display_name || "بدون اسم",
            merchant_phone: profile?.phone || "",
          };
        })
      );

      return new Response(
        JSON.stringify({
          merchants: merchants || [],
          receipts: enrichedReceipts,
          products: enrichedProducts,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { type, data } = body;

      if (type === "toggle_store") {
        const { id, page_enabled } = data;
        const { error } = await supabase
          .from("profiles")
          .update({ page_enabled: !page_enabled })
          .eq("id", id);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (type === "review_receipt") {
        const { id, approved, user_id } = data;
        const { error } = await supabase
          .from("payment_receipts")
          .update({
            status: approved ? "approved" : "rejected",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        // If approved, enable the merchant's store
        if (approved && user_id) {
          await supabase
            .from("profiles")
            .update({ page_enabled: true })
            .eq("user_id", user_id);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (type === "delete_product") {
        const { id } = data;
        const { error } = await supabase
          .from("items")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Admin data error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
