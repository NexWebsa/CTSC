import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "ctscbooking@ctsctravel.com";
const DEFAULT_SITE_URL = "https://ctsctravel.com";

type EmailRecipient = string | string[];

interface RequestBody {
  bookingId?: string;
  driverId?: string;
}

interface BookingRow {
  id: string;
  user_id: string | null;
  is_guest: boolean | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  service_type: string | null;
  booking_type: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  hours: number | null;
  pickup_date: string | null;
  pickup_time: string | null;
  return_pickup_date: string | null;
  return_pickup_time: string | null;
  trip_direction: string | null;
  passengers: number | null;
  baby_seats: number | null;
  luggage_checkin: number | null;
  luggage_carry: number | null;
  trailer: boolean | null;
  oversize_luggage: boolean | null;
  flight_number: string | null;
  extra_stop: boolean | null;
  extra_stop_location: string | null;
  extras: unknown;
  extras_total: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  status: string | null;
  payment_status: string | null;
  price_estimate: number | null;
  notes: string | null;
  created_at: string | null;
  vehicles?: { name: string | null; capacity: number | null } | null;
}

interface DriverRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean | null;
}

const jsonResponse = (body: Record<string, unknown>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const escapeHtml = (value: string | number | null | undefined): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const orderNumber = (id: string): string => id.slice(0, 8).toUpperCase();

const titleCase = (value: string | null | undefined): string => {
  if (!value) return "-";
  return value
    .split(/[_\s-]+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
};

const formatRand = (value: number | null | undefined): string =>
  typeof value === "number" && !Number.isNaN(value) ? `R${value.toFixed(2)}` : "-";

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatTime = (value: string | null | undefined): string => {
  if (!value) return "-";
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const formatDuration = (minutes: number | null | undefined): string | null => {
  if (typeof minutes !== "number" || Number.isNaN(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

const formatKm = (km: number | null | undefined): string | null =>
  typeof km === "number" && !Number.isNaN(km) && km > 0 ? `${km.toFixed(1)} km` : null;

const extractFromNotes = (notes: string | null, label: string): string | null => {
  if (!notes) return null;
  const re = new RegExp(`${label}:\\s*([^|]+?)(?:\\s*\\||$)`, "i");
  const match = notes.match(re);
  return match ? match[1].trim() : null;
};

const parseReturnTrip = (notes: string | null) => {
  const value = extractFromNotes(notes, "Return trip");
  if (!value) return null;

  const match = value.match(/^(.+?)\s*(?:\u2192|->)\s*(.+?)\s+on\s+(.+?)\s+at\s+(.+)$/i);
  if (!match) return null;

  return {
    pickup: match[1].trim(),
    dropoff: match[2].trim(),
    date: match[3].trim(),
    time: match[4].trim(),
  };
};

const summarizeExtras = (extras: unknown): string | null => {
  if (!Array.isArray(extras)) return null;

  const labels = extras
    .map((item) => {
      if (!isRecord(item)) return null;
      const label = readString(item.label);
      if (!label) return null;
      const qty = typeof item.qty === "number" ? item.qty : 1;
      return qty > 1 ? `${label} x${qty}` : label;
    })
    .filter((value): value is string => Boolean(value));

  return labels.length ? labels.join(", ") : null;
};

const cleanAdditionalNotes = (notes: string | null): string | null => {
  if (!notes) return null;

  const structuredLabels = /^(Service|Airport transfer|Airport|Flight|Passengers|Large bags|Check-in bags|Carry-on|End time|Points of interest|Extras|Extra stop|Return trip):/i;
  const cleaned = notes
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !structuredLabels.test(part))
    .join(" | ");

  return cleaned || null;
};

const emailIdFromResponse = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;
  return typeof value.id === "string" ? value.id : undefined;
};

const resolveSiteUrl = (req: Request): string => {
  const origin = req.headers.get("origin");
  if (origin?.startsWith("https://")) return origin;
  return Deno.env.get("PUBLIC_SITE_URL") ?? Deno.env.get("SITE_URL") ?? DEFAULT_SITE_URL;
};

const getAdminAuthError = async (req: Request): Promise<Response | null> => {
  if (!SUPABASE_URL || !ANON_KEY) {
    return jsonResponse({ error: "Supabase auth environment not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerData, error: userError } = await caller.auth.getUser();
  if (userError || !callerData.user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { data: adminRole, error: roleError } = await caller
    .from("user_roles")
    .select("role")
    .eq("user_id", callerData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("Admin role check failed:", roleError);
    return jsonResponse({ error: "Could not verify admin access" }, 500);
  }

  return adminRole ? null : jsonResponse({ error: "Admin access required" }, 403);
};

const renderRows = (rows: Array<[string, string | null | undefined]>): string =>
  rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#5f6678;border-bottom:1px solid #ece7da;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#11192e;border-bottom:1px solid #ece7da;text-align:right;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

const renderEmailShell = (
  title: string,
  intro: string,
  rows: string,
  dashboardUrl: string
): string => `
<!DOCTYPE html>
<html>
  <body style="margin:0;background:#fbf9f4;color:#11192e;font-family:Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:28px 18px;">
      <div style="background:#11192e;color:#ffffff;border-radius:18px 18px 0 0;padding:28px;">
        <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#f5a623;font-weight:700;">CTSC Travel</div>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #ece7da;border-top:0;border-radius:0 0 18px 18px;padding:28px;">
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2a3146;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 24px;">
          ${rows}
        </table>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#5f6678;">Please review the trip in your driver dashboard and prepare for the scheduled pickup.</p>
        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#f5a623;color:#11192e;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700;">Open Driver Dashboard</a>
      </div>
    </div>
  </body>
</html>`;

const renderText = (
  title: string,
  intro: string,
  rows: Array<[string, string | null | undefined]>,
  dashboardUrl: string
): string => {
  const detailLines = rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return `${title}\n\n${intro}\n\n${detailLines}\n\nDriver dashboard: ${dashboardUrl}`;
};

const sendEmail = async (
  apiKey: string,
  to: EmailRecipient,
  subject: string,
  html: string,
  text: string
): Promise<unknown> => {
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  const resendBody = await resendRes.text();
  let parsed: unknown = resendBody;
  try {
    parsed = JSON.parse(resendBody);
  } catch {
    // Keep non-JSON Resend responses as text for logging.
  }

  if (!resendRes.ok) {
    throw new Error(`Resend API error ${resendRes.status}: ${JSON.stringify(parsed)}`);
  }

  return parsed;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Supabase environment not configured" }, 500);
    }

    const authError = await getAdminAuthError(req);
    if (authError) return authError;

    const apiKey = Deno.env.get("CTSC_RESEND_KEY") ?? Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "CTSC_RESEND_KEY or RESEND_API_KEY is not set in Supabase secrets" }, 500);
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const bookingId = readString(body.bookingId);
    const driverId = readString(body.driverId);

    if (!bookingId) return jsonResponse({ error: "bookingId is required" }, 400);
    if (!driverId) return jsonResponse({ error: "driverId is required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: driver, error: driverError } = await admin
      .from("drivers")
      .select("id, full_name, email, phone, is_active")
      .eq("id", driverId)
      .maybeSingle<DriverRow>();

    if (driverError) {
      return jsonResponse({ error: "Failed to fetch driver", detail: driverError.message }, 500);
    }
    if (!driver) return jsonResponse({ error: "Driver not found" }, 404);
    if (driver.is_active === false) return jsonResponse({ error: "Assigned driver is inactive" }, 400);
    const driverEmail = driver.email?.trim();
    if (!driverEmail) return jsonResponse({ error: "Assigned driver does not have an email address" }, 400);

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, user_id, is_guest, guest_name, guest_email, guest_phone, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, return_pickup_date, return_pickup_time, trip_direction, passengers, baby_seats, luggage_checkin, luggage_carry, trailer, oversize_luggage, flight_number, extra_stop, extra_stop_location, extras, extras_total, distance_km, duration_minutes, status, payment_status, price_estimate, notes, created_at, vehicles(name, capacity)"
      )
      .eq("id", bookingId)
      .maybeSingle<BookingRow>();

    if (bookingError) {
      return jsonResponse({ error: "Failed to fetch booking", detail: bookingError.message }, 500);
    }
    if (!booking) return jsonResponse({ error: "Booking not found" }, 404);
    if (booking.driver_id !== driverId) {
      return jsonResponse({ error: "Booking is not currently assigned to this driver" }, 409);
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

    const reference = orderNumber(booking.id);
    const customerName = profileName ?? booking.guest_name ?? "Customer";
    const customerEmail = booking.guest_email ?? userEmail;
    const customerPhone = profilePhone ?? booking.guest_phone;
    const vehicleName = booking.vehicles?.name ?? extractFromNotes(booking.notes, "Vehicle") ?? "Vehicle";
    const flightNumber = booking.flight_number ?? extractFromNotes(booking.notes, "Flight");
    const passengerCount = booking.passengers?.toString() ?? extractFromNotes(booking.notes, "Passengers") ?? "1";
    const extrasSummary = summarizeExtras(booking.extras) ?? extractFromNotes(booking.notes, "Extras");
    const additionalNotes = cleanAdditionalNotes(booking.notes);
    const returnFromNotes = parseReturnTrip(booking.notes);
    const hasReturn = booking.trip_direction === "return" || Boolean(returnFromNotes);
    const returnPickup = returnFromNotes?.pickup ?? booking.dropoff_location;
    const returnDropoff = returnFromNotes?.dropoff ?? booking.pickup_location;
    const returnDate = returnFromNotes?.date ?? booking.return_pickup_date;
    const returnTime = returnFromNotes?.time ?? booking.return_pickup_time;
    const dashboardUrl = `${resolveSiteUrl(req).replace(/\/$/, "")}/driver`;

    const luggageSummary = [
      booking.luggage_checkin ? `Check-in bags: ${booking.luggage_checkin}` : null,
      booking.luggage_carry ? `Carry-on: ${booking.luggage_carry}` : null,
      booking.oversize_luggage ? "Oversize luggage" : null,
      booking.trailer ? "Trailer required" : null,
    ]
      .filter(Boolean)
      .join(", ");

    const equipmentSummary = [
      booking.baby_seats ? `Baby seats: ${booking.baby_seats}` : null,
      booking.extra_stop
        ? `Extra stop: ${booking.extra_stop_location || "location not specified"}`
        : null,
    ]
      .filter(Boolean)
      .join(", ");

    const routeSummary = [formatKm(booking.distance_km), formatDuration(booking.duration_minutes)]
      .filter(Boolean)
      .join(" / ");

    const rows: Array<[string, string | null | undefined]> = [
      ["Booking reference", reference],
      ["Customer", customerName],
      ["Customer phone", customerPhone],
      ["Customer email", customerEmail],
      ["Service", titleCase(booking.service_type)],
      ["Trip type", titleCase(booking.booking_type)],
      ["Pickup", booking.pickup_location ?? "-"],
      ["Drop-off", booking.dropoff_location ?? "-"],
      ["Pickup date", formatDate(booking.pickup_date)],
      ["Pickup time", formatTime(booking.pickup_time)],
      ["Return route", hasReturn ? `${returnPickup ?? "-"} to ${returnDropoff ?? "-"}` : null],
      ["Return date", hasReturn ? formatDate(returnDate) : null],
      ["Return time", hasReturn ? formatTime(returnTime) : null],
      ["Vehicle", vehicleName],
      ["Passengers", passengerCount],
      ["Flight number", flightNumber],
      ["Luggage", luggageSummary],
      ["Equipment and stops", equipmentSummary],
      ["Extras", extrasSummary],
      ["Route estimate", routeSummary],
      ["Estimated price", formatRand(booking.price_estimate)],
      ["Payment status", titleCase(booking.payment_status ?? "unpaid")],
      ["Booking status", titleCase(booking.status)],
      ["Additional notes", additionalNotes],
    ];

    const title = "New Trip Assignment";
    const intro = `Hi ${driver.full_name}, you have been assigned to booking #${reference}.`;
    const html = renderEmailShell(title, intro, renderRows(rows), dashboardUrl);
    const text = renderText(title, intro, rows, dashboardUrl);

    const resend = await sendEmail(
      apiKey,
      driverEmail,
      `New Trip Assignment - Booking #${reference}`,
      html,
      text
    );

    return jsonResponse({
      success: true,
      status: "sent",
      bookingId,
      driverId,
      to: driverEmail,
      emailId: emailIdFromResponse(resend),
    });
  } catch (err) {
    console.error("send-driver-trip-assignment failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
