import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

const readString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const sendPaymentConfirmation = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  bookingId: string
) => {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error("send-payment-confirmation failed:", res.status, body);
      return;
    }

    console.log("send-payment-confirmation response:", body);
  } catch (error) {
    console.error("send-payment-confirmation request failed:", error);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const YOCO_WEBHOOK_SECRET = Deno.env.get("YOCO_WEBHOOK_SECRET");
    const rawBody = await req.text();

    // Verify webhook signature if secret is configured
    if (YOCO_WEBHOOK_SECRET) {
      const webhookId = req.headers.get("webhook-id");
      const webhookTimestamp = req.headers.get("webhook-timestamp");
      const webhookSignature = req.headers.get("webhook-signature");

      if (!webhookId || !webhookTimestamp || !webhookSignature) {
        console.error("Missing webhook headers");
        return new Response("Missing webhook headers", { status: 400 });
      }

      // Check timestamp freshness (5 min tolerance)
      const now = Math.floor(Date.now() / 1000);
      const ts = parseInt(webhookTimestamp, 10);
      if (Math.abs(now - ts) > 300) {
        console.error("Webhook timestamp too old");
        return new Response("Timestamp too old", { status: 400 });
      }

      // Verify HMAC signature
      const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
      const secretBytes = Uint8Array.from(
        atob(YOCO_WEBHOOK_SECRET.replace("whsec_", "")),
        (c) => c.charCodeAt(0)
      );
      const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(signedContent)
      );
      const expectedSignature = encode(new Uint8Array(signatureBytes));

      // Compare with provided signatures
      const signatures = webhookSignature.split(" ");
      const isValid = signatures.some((sig) => {
        const sigValue = sig.split(",")[1];
        return sigValue === expectedSignature;
      });

      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
    } else {
      console.warn("YOCO_WEBHOOK_SECRET not set - skipping signature verification (OK for testing)");
    }

    if (!rawBody) {
      console.warn("Empty webhook body received");
      return new Response("No content", { status: 200 });
    }

    let event;

    try {
      event = JSON.parse(rawBody);
    } catch (err) {
      console.error("Invalid JSON received:", rawBody);
      return new Response("Invalid JSON", { status: 400 });
    }
    console.log("Yoco webhook event:", event.type);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event.type === "payment.succeeded") {
      const metadata = event.payload?.metadata ?? {};
      const checkout = event.payload?.checkout ?? {};
      const payment = event.payload?.payment ?? {};
      const checkoutId =
        readString(metadata.checkoutId) ??
        readString(metadata.checkout_id) ??
        readString(event.payload?.checkoutId) ??
        readString(event.payload?.checkout_id) ??
        readString(checkout.id) ??
        readString(checkout.checkoutId) ??
        readString(payment.checkoutId) ??
        readString(payment.checkout_id);
      const bookingId =
        readString(metadata.bookingId) ??
        readString(metadata.booking_id) ??
        readString(event.payload?.bookingId) ??
        readString(event.payload?.booking_id);

      if (bookingId) {
        // Update by bookingId from metadata
        const { data, error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid", updated_at: new Date().toISOString() })
          .eq("id", bookingId)
          .select("id");

        if (error) {
          console.error("Error updating booking by ID:", error);
        } else {
          console.log(`Booking ${bookingId} marked as paid`);
          const paidBookingId = data?.[0]?.id ?? bookingId;
          await sendPaymentConfirmation(supabaseUrl, supabaseKey, paidBookingId);
        }
      } else if (checkoutId) {
        // Fallback: update by checkout ID
        const { data, error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid", updated_at: new Date().toISOString() })
          .eq("yoco_checkout_id", checkoutId)
          .select("id");

        if (error) {
          console.error("Error updating booking by checkout ID:", error);
        } else {
          console.log(`Booking with checkout ${checkoutId} marked as paid`);
          const paidBookingId = data?.[0]?.id;
          if (paidBookingId) {
            await sendPaymentConfirmation(supabaseUrl, supabaseKey, paidBookingId);
          }
        }
      } else {
        console.warn("No bookingId or checkoutId in webhook payload metadata");
      }
    } else if (event.type === "payment.failed") {
      const bookingId = event.payload?.metadata?.bookingId;
      const checkoutId = event.payload?.metadata?.checkoutId;

      const id = bookingId || null;
      const field = bookingId ? "id" : "yoco_checkout_id";
      const value = bookingId || checkoutId;

      if (value) {
        await supabase
          .from("bookings")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq(field, value);
        console.log(`Booking marked as failed: ${value}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
