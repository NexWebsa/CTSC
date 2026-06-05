import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY");
    if (!YOCO_SECRET_KEY) throw new Error("YOCO_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Optional auth: signed-in users get verified; guests are allowed too.
    let authUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await admin.auth.getUser(token);
      if (data?.user) authUserId = data.user.id;
    }

    const { bookingId } = await req.json().catch(() => ({}));
    if (!bookingId) {
      return new Response(JSON.stringify({ error: "bookingId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, price_estimate, user_id, is_guest, guest_email")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) throw new Error(`Failed to fetch booking: ${bookingError.message}`);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: either matching user OR a guest booking
    const isOwner = authUserId && booking.user_id === authUserId;
    const isGuestBooking = booking.is_guest === true && booking.user_id === null;
    if (!isOwner && !isGuestBooking) {
      return new Response(JSON.stringify({ error: "Not authorized for this booking" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!booking.price_estimate || booking.price_estimate <= 0) {
      return new Response(JSON.stringify({ error: "No price estimate on booking" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountInCents = Math.round(Number(booking.price_estimate) * 100);

    let origin = req.headers.get("origin") || "https://ctsctravel.com";
    if (origin.startsWith("http://")) origin = "https://ctsctravel.com";

    const yocoPayload = {
      amount: amountInCents,
      currency: "ZAR",
      successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
      cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
      failureUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
      metadata: { bookingId, userId: authUserId ?? "guest" },
    };

    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${YOCO_SECRET_KEY}` },
      body: JSON.stringify(yocoPayload),
    });

    if (!yocoResponse.ok) {
      const errorBody = await yocoResponse.text();
      console.error("Yoco API error:", yocoResponse.status, errorBody);
      throw new Error(`Yoco API error: ${yocoResponse.status} - ${errorBody}`);
    }

    const yocoData = await yocoResponse.json();

    await admin.from("bookings").update({ yoco_checkout_id: yocoData.id }).eq("id", bookingId);

    return new Response(
      JSON.stringify({ checkoutId: yocoData.id, redirectUrl: yocoData.redirectUrl, checkoutUrl: yocoData.redirectUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-yoco-checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
