import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("Starting deletion of all users...");

    // Step 1: Delete all related data first (in order of dependencies)
    
    // Delete order_items
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (orderItemsError) console.error("Error deleting order_items:", orderItemsError);
    else console.log("Deleted order_items");

    // Delete orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (ordersError) console.error("Error deleting orders:", ordersError);
    else console.log("Deleted orders");

    // Delete item_images
    const { error: itemImagesError } = await supabase
      .from("item_images")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (itemImagesError) console.error("Error deleting item_images:", itemImagesError);
    else console.log("Deleted item_images");

    // Delete items
    const { error: itemsError } = await supabase
      .from("items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (itemsError) console.error("Error deleting items:", itemsError);
    else console.log("Deleted items");

    // Delete gallery_images
    const { error: galleryError } = await supabase
      .from("gallery_images")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (galleryError) console.error("Error deleting gallery_images:", galleryError);
    else console.log("Deleted gallery_images");

    // Delete payment_receipts
    const { error: receiptsError } = await supabase
      .from("payment_receipts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (receiptsError) console.error("Error deleting payment_receipts:", receiptsError);
    else console.log("Deleted payment_receipts");

    // Delete terms_agreements
    const { error: termsError } = await supabase
      .from("terms_agreements")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (termsError) console.error("Error deleting terms_agreements:", termsError);
    else console.log("Deleted terms_agreements");

    // Delete subscriptions
    const { error: subsError } = await supabase
      .from("subscriptions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (subsError) console.error("Error deleting subscriptions:", subsError);
    else console.log("Deleted subscriptions");

    // Delete user_roles
    const { error: rolesError } = await supabase
      .from("user_roles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (rolesError) console.error("Error deleting user_roles:", rolesError);
    else console.log("Deleted user_roles");

    // Delete customer_profiles
    const { error: customerProfilesError } = await supabase
      .from("customer_profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (customerProfilesError) console.error("Error deleting customer_profiles:", customerProfilesError);
    else console.log("Deleted customer_profiles");

    // Delete profiles
    const { error: profilesError } = await supabase
      .from("profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (profilesError) console.error("Error deleting profiles:", profilesError);
    else console.log("Deleted profiles");

    // Step 2: Get all users and delete them
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    console.log(`Found ${users.users.length} users to delete`);

    let deletedCount = 0;
    for (const user of users.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Error deleting user ${user.id}:`, deleteError);
      } else {
        deletedCount++;
        console.log(`Deleted user ${user.id}`);
      }
    }

    console.log(`Successfully deleted ${deletedCount} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `تم حذف ${deletedCount} مستخدم بنجاح`,
        deletedCount 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Delete all users error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
