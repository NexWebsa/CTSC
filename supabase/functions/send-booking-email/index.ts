import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM = "ctscbooking@ctsctravel.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TEMPLATE_URL =
  Deno.env.get("TEMPLATE_URL") ??
  `${SUPABASE_URL}/storage/v1/object/public/email-templates/payment-link.html`;

interface BookingRow {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  service_type: string | null;
  booking_type: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  status: string | null;
  price_estimate: number | null;
  notes: string | null;
  created_at: string | null;
  vehicles?: { name: string | null; capacity: number | null } | null;
  profiles?: { full_name: string | null; phone: string | null } | null;
}

interface RequestBody {
  bookingId?: string;
  checkoutUrl?: string;
  to?: string;
  /** ISO timestamp when the Yoco checkout expires. */
  expiresAt?: string;
}

const FALLBACK_TEMPLATE = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#11192e;background:#fbf9f4;padding:24px;">
  <h2>Booking #{{ORDER_NUMBER}}</h2>
  <p>Hi {{CLIENT_FIRST_NAME}}, your booking is awaiting payment.</p>
  <p><a href="{{CHECKOUT_URL}}" style="background:#f5a623;color:#11192e;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">Pay {{TOTAL}} Now</a></p>
  <p>Pickup: {{PICKUP_ADDRESS}}<br/>Drop-off: {{DROPOFF_ADDRESS}}<br/>Date: {{TRIP_DATE}} {{TRIP_TIME}}</p>
</body></html>`;

async function fetchTemplate(): Promise<string> {
  try {
    const res = await fetch(TEMPLATE_URL, { headers: { "Cache-Control": "no-cache" } });
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 100) return text;
    }
    console.warn(`Template fetch failed (${res.status}), using fallback`);
  } catch (e) {
    console.warn(`Template fetch threw, using fallback:`, e);
  }
  return FALLBACK_TEMPLATE;
}

const renderTemplate = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");

const formatRand = (n: number | null | undefined): string =>
  typeof n === "number" && !Number.isNaN(n) ? `R${n.toFixed(2)}` : "—";

const orderNumber = (id: string): string => id.slice(0, 8).toUpperCase();

const firstName = (full: string | null | undefined): string =>
  (full ?? "").trim().split(/\s+/)[0] || "Customer";

const titleCase = (s: string | null | undefined): string => {
  if (!s) return "—";
  return s
    .split(/[_\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
};

const formatExpiresIn = (expiresAt: string | undefined): { in: string; at: string } => {
  if (!expiresAt) return { in: "in 24 hours", at: "—" };
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return { in: "in 24 hours", at: "—" };

  const diffMs = expiry.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60_000);

  let phrase: string;
  if (minutes <= 0) phrase = "shortly";
  else if (minutes < 60) phrase = `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  else if (minutes < 60 * 24) {
    const hours = Math.round(minutes / 60);
    phrase = `in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else {
    const days = Math.round(minutes / (60 * 24));
    phrase = `in ${days} day${days === 1 ? "" : "s"}`;
  }

  const at = expiry.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return { in: phrase, at };
};

const extractFromNotes = (notes: string | null, label: string): string | null => {
  if (!notes) return null;
  const re = new RegExp(`${label}:\\s*([^|]+?)(?:\\s*\\||$)`, "i");
  const match = notes.match(re);
  return match ? match[1].trim() : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CTSC_RESEND_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "CTSC_RESEND_KEY is not set in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Supabase environment not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const { bookingId, checkoutUrl, expiresAt } = body;
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "bookingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!checkoutUrl) {
      return new Response(
        JSON.stringify({ error: "checkoutUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, user_id, is_guest, guest_name, guest_email, guest_phone, vehicle_id, service_type, booking_type, pickup_location, dropoff_location, pickup_date, pickup_time, status, price_estimate, notes, created_at, vehicles(name, capacity)"
      )
      .eq("id", bookingId)
      .single<BookingRow & { is_guest?: boolean; guest_name?: string | null; guest_email?: string | null; guest_phone?: string | null }>();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found", detail: bookingError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let profileName: string | null = null;
    let profilePhone: string | null = null;
    let userEmail: string | null = null;

    if (booking.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, phone")
        .eq("id", booking.user_id)
        .maybeSingle();
      profileName = profile?.full_name ?? null;
      profilePhone = profile?.phone ?? null;
      const { data: authUser } = await admin.auth.admin.getUserById(booking.user_id);
      userEmail = authUser?.user?.email ?? null;
    }

    const to = body.to ?? booking.guest_email ?? userEmail;
    if (!to) {
      return new Response(
        JSON.stringify({ error: "Could not resolve recipient email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullName = profileName ?? booking.guest_name ?? "Customer";
    const phone = profilePhone ?? booking.guest_phone ?? "";
    const vehicleName = booking.vehicles?.name ?? "Vehicle";
    const price = formatRand(booking.price_estimate);

    const flightFromNotes = extractFromNotes(booking.notes, "Flight");
    const passengersFromNotes = extractFromNotes(booking.notes, "Passengers") ?? "1";
    const returnFromNotes = extractFromNotes(booking.notes, "Return trip");
    let extraDetails = booking.notes ?? "";
    if (extraDetails) {
      extraDetails = extraDetails
        .split("|")
        .map((part) => part.trim())
        .filter((part) => !/^(Flight|Passengers|Return trip):/i.test(part))
        .join(" — ");
    }

    let returnPickup = "—";
    let returnDropoff = "—";
    let returnDate = "—";
    let returnTime = "—";
    if (returnFromNotes) {
      const m = returnFromNotes.match(
        /^(.+?)\s*(?:\u2192|->)\s*(.+?)\s+on\s+(.+?)\s+at\s+(.+)$/i
      );
      if (m) {
        returnPickup = m[1].trim();
        returnDropoff = m[2].trim();
        returnDate = m[3].trim();
        returnTime = m[4].trim();
      }
    }

    const vars: Record<string, string> = {
      ORDER_NUMBER: orderNumber(booking.id),
      CLIENT_FIRST_NAME: firstName(fullName),
      CLIENT_FULL_NAME: fullName,
      CLIENT_PHONE: phone,
      CLIENT_EMAIL: to,
      SERVICE_NAME: titleCase(booking.service_type),
      SERVICE_NOTE: vehicleName,
      SERVICE_QUANTITY: "1",
      SERVICE_PRICE: price,
      SUBTOTAL: price,
      PAYMENT_METHOD: "Yoco (Card)",
      TOTAL: price,
      TRIP_TYPE: titleCase(booking.booking_type) || "One-way",
      SERVICE_TYPE: titleCase(booking.service_type),
      VEHICLE_NAME: vehicleName,
      PICKUP_ADDRESS: booking.pickup_location ?? "—",
      DROPOFF_ADDRESS: booking.dropoff_location ?? "—",
      TRIP_DATE: booking.pickup_date ?? "—",
      TRIP_TIME: booking.pickup_time ?? "—",
      PASSENGERS: passengersFromNotes,
      FLIGHT_NUMBER: flightFromNotes ?? "—",
      POINT_OF_INTEREST: booking.dropoff_location ?? "—",
      RETURN_PICKUP_ADDRESS: returnPickup,
      RETURN_DROPOFF_ADDRESS: returnDropoff,
      RETURN_DATE: returnDate,
      RETURN_TIME: returnTime,
      EXTRA_DETAILS: extraDetails || "No additional notes.",
      CHECKOUT_URL: checkoutUrl,
      LINK_EXPIRES_IN: formatExpiresIn(expiresAt).in,
      LINK_EXPIRES_AT: formatExpiresIn(expiresAt).at,
    };

    const template = await fetchTemplate();
    const html = renderTemplate(template, vars);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `Booking #${vars.ORDER_NUMBER} — Complete your payment`,
        html,
      }),
    });

    const resendBody = await resendRes.text();
    let parsed: unknown = resendBody;
    try { parsed = JSON.parse(resendBody); } catch { /* keep as text */ }

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ error: "Resend API error", status: resendRes.status, body: parsed }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, to, bookingId, resend: parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
