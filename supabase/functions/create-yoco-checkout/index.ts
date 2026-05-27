import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("create-yoco-checkout: Function called");
    
    const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY");
    if (!YOCO_SECRET_KEY) {
      console.error("YOCO_SECRET_KEY not configured");
      throw new Error("YOCO_SECRET_KEY not configured");
    }
    console.log("YOCO_SECRET_KEY configured ✓");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("JWT verification failed:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("User authenticated:", user.id);

    let bodyData;
    try {
      bodyData = await req.json();
      console.log("Request body parsed:", { bookingId: bodyData.bookingId });
    } catch (e) {
      console.error("Failed to parse request body:", e);
      throw new Error("Invalid request body");
    }

    const { bookingId } = bodyData;
    if (!bookingId) {
      console.error("bookingId missing from request");
      return new Response(JSON.stringify({ error: "bookingId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking (simplified query without vehicle relationship)
    console.log("Fetching booking:", bookingId);
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, price_estimate, pickup_location, dropoff_location, pickup_date, pickup_time, user_id")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Booking fetch error:", bookingError);
      throw new Error(`Failed to fetch booking: ${bookingError.message}`);
    }

    if (!booking) {
      console.error("Booking not found:", bookingId);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Booking found:", { id: booking.id, priceEstimate: booking.price_estimate });

    if (booking.user_id !== user.id) {
      console.error("Unauthorized: booking user mismatch", { bookingUserId: booking.user_id, authUserId: user.id });
      return new Response(JSON.stringify({ error: "Not your booking" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!booking.price_estimate || booking.price_estimate <= 0) {
      console.error("Invalid price estimate:", booking.price_estimate);
      return new Response(JSON.stringify({ error: "No price estimate on booking" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Amount in cents for Yoco
    const amountInCents = Math.round(booking.price_estimate * 100);
    console.log("Amount calculated:", { priceEstimate: booking.price_estimate, amountInCents });

    // Determine base URL: For Yoco live keys, must be HTTPS
    // If origin is HTTP (localhost dev), fall back to production domain
    let origin = req.headers.get("origin") || "https://ctsctravel.com";
    if (origin.startsWith("http://")) {
      // Dev environment: localhost won't work with live Yoco keys
      origin = "https://ctsctravel.com";
      console.log("Switched from local origin to production domain for Yoco live keys");
    }
    console.log("Using origin for Yoco URLs:", origin);

    // Create Yoco checkout session
    const yocoPayload = {
      amount: amountInCents,
      currency: "ZAR",
      successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
      cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
      failureUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
      metadata: {
        bookingId: bookingId,
        userId: user.id,
      },
    };
    console.log("Calling Yoco API with payload:", yocoPayload);

    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify(yocoPayload),
    });

    console.log("Yoco response status:", yocoResponse.status);

    if (!yocoResponse.ok) {
      const errorBody = await yocoResponse.text();
      console.error("Yoco API error response:", { status: yocoResponse.status, body: errorBody });
      throw new Error(`Yoco API error: ${yocoResponse.status} - ${errorBody}`);
    }

    const yocoData = await yocoResponse.json();
    console.log("Yoco checkout created:", { checkoutId: yocoData.id });

    // Store checkout ID on booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ yoco_checkout_id: yocoData.id })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking with checkout ID:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }
    console.log("Booking updated with checkout ID ✓");

    const response = {
      checkoutId: yocoData.id,
      redirectUrl: yocoData.redirectUrl,
    };
    console.log("Returning success response:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Uncaught error in create-yoco-checkout:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
