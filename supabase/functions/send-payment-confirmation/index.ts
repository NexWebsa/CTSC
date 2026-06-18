import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "ctscbooking@ctsctravel.com";
const DEFAULT_ADMIN_EMAIL = "accounts@shuttlecapetown.co.za";

interface BookingRow {
  id: string;
  user_id: string | null;
  is_guest: boolean | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
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
  passengers: number | null;
  payment_status: string | null;
  yoco_checkout_id: string | null;
  created_at: string | null;
  vehicles?: { name: string | null; capacity: number | null } | null;
}

interface RequestBody {
  bookingId?: string;
}

type EmailRecipient = string | string[];

interface EmailSendRecord {
  to?: EmailRecipient;
  id?: string;
  skipped?: string;
  error?: string;
}

const jsonResponse = (body: Record<string, unknown>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string | number | null | undefined): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatRand = (n: number | null | undefined): string =>
  typeof n === "number" && !Number.isNaN(n) ? `R${n.toFixed(2)}` : "-";

const orderNumber = (id: string): string => id.slice(0, 8).toUpperCase();

const firstName = (full: string | null | undefined): string =>
  (full ?? "").trim().split(/\s+/)[0] || "Customer";

const titleCase = (s: string | null | undefined): string => {
  if (!s) return "-";
  return s
    .split(/[_\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
};

const extractFromNotes = (notes: string | null, label: string): string | null => {
  if (!notes) return null;
  const re = new RegExp(`${label}:\\s*([^|]+?)(?:\\s*\\||$)`, "i");
  const match = notes.match(re);
  return match ? match[1].trim() : null;
};

const parseEmailList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const emailIdFromResponse = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;
  return typeof value.id === "string" ? value.id : undefined;
};

const readString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const normalizeStatus = (value: unknown): string | null =>
  readString(value)?.toLowerCase().replace(/[\s_-]+/g, "_") ?? null;

const isPaidStatus = (value: unknown): boolean => {
  const status = normalizeStatus(value);
  return Boolean(
    status &&
      ["paid", "succeeded", "successful", "success", "complete", "completed", "captured"].includes(status)
  );
};

const getYocoStatus = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;

  const payment = isRecord(payload.payment) ? payload.payment : null;
  const checkout = isRecord(payload.checkout) ? payload.checkout : null;
  const charge = isRecord(payload.charge) ? payload.charge : null;
  const payments = Array.isArray(payload.payments) ? payload.payments : [];

  const candidates = [
    payload.status,
    payload.paymentStatus,
    payload.payment_status,
    payload.checkoutStatus,
    payload.checkout_status,
    payment?.status,
    checkout?.status,
    charge?.status,
    ...payments.map((item) => (isRecord(item) ? item.status : null)),
  ];

  return candidates.map(normalizeStatus).find(Boolean) ?? null;
};

const isYocoPaidPayload = (payload: unknown): boolean => {
  if (!isRecord(payload)) return false;

  const payment = isRecord(payload.payment) ? payload.payment : null;
  const checkout = isRecord(payload.checkout) ? payload.checkout : null;
  const charge = isRecord(payload.charge) ? payload.charge : null;
  const payments = Array.isArray(payload.payments) ? payload.payments : [];

  return [
    payload.status,
    payload.paymentStatus,
    payload.payment_status,
    payload.checkoutStatus,
    payload.checkout_status,
    payment?.status,
    checkout?.status,
    charge?.status,
    ...payments.map((item) => (isRecord(item) ? item.status : null)),
  ].some(isPaidStatus);
};

const verifyYocoCheckoutPaid = async (
  checkoutId: string | null
): Promise<{ paid: boolean; status: string | null; detail?: string }> => {
  if (!checkoutId) {
    return { paid: false, status: null, detail: "missing_checkout_id" };
  }

  const yocoSecretKey = Deno.env.get("YOCO_SECRET_KEY");
  if (!yocoSecretKey) {
    return { paid: false, status: null, detail: "YOCO_SECRET_KEY_not_configured" };
  }

  try {
    const res = await fetch(
      `https://payments.yoco.com/api/checkouts/${encodeURIComponent(checkoutId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${yocoSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Keep non-JSON Yoco responses as text for logging.
    }

    if (!res.ok) {
      console.warn("Yoco checkout verification failed:", res.status, parsed);
      return { paid: false, status: null, detail: `yoco_${res.status}` };
    }

    const status = getYocoStatus(parsed);
    return { paid: isYocoPaidPayload(parsed), status };
  } catch (error) {
    console.error("Yoco checkout verification request failed:", error);
    return {
      paid: false,
      status: null,
      detail: error instanceof Error ? error.message : "unknown_yoco_error",
    };
  }
};

const renderRows = (rows: Array<[string, string | null | undefined]>): string =>
  rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#5f6678;border-bottom:1px solid #ece7da;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#11192e;border-bottom:1px solid #ece7da;text-align:right;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

const renderEmailShell = (title: string, intro: string, rows: string, footer: string): string => `
<!DOCTYPE html>
<html>
  <body style="margin:0;background:#fbf9f4;color:#11192e;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
      <div style="background:#11192e;color:#ffffff;border-radius:18px 18px 0 0;padding:28px;">
        <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#f5a623;font-weight:700;">CTSC Travel</div>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #ece7da;border-top:0;border-radius:0 0 18px 18px;padding:28px;">
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2a3146;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 24px;">
          ${rows}
        </table>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#5f6678;">${escapeHtml(footer)}</p>
      </div>
    </div>
  </body>
</html>`;

const sendEmail = async (
  apiKey: string,
  to: EmailRecipient,
  subject: string,
  html: string,
  replyTo?: string | null
): Promise<unknown> => {
  const body: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (replyTo) body.reply_to = replyTo;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Supabase environment not configured" }, 500);
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const { bookingId } = body;
    if (!bookingId) {
      return jsonResponse({ error: "bookingId is required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, user_id, is_guest, guest_name, guest_email, guest_phone, vehicle_id, service_type, booking_type, pickup_location, dropoff_location, pickup_date, pickup_time, status, price_estimate, notes, passengers, payment_status, yoco_checkout_id, created_at, vehicles(name, capacity)"
      )
      .eq("id", bookingId)
      .maybeSingle<BookingRow>();

    if (bookingError) {
      return jsonResponse({ error: "Failed to fetch booking", detail: bookingError.message }, 500);
    }
    if (!booking) {
      return jsonResponse({ error: "Booking not found", status: "not_found" }, 404);
    }

    let paymentStatus = booking.payment_status;
    let yocoVerificationStatus: string | null = null;
    let yocoVerificationDetail: string | undefined;

    if (paymentStatus !== "paid") {
      const yocoVerification = await verifyYocoCheckoutPaid(booking.yoco_checkout_id);
      yocoVerificationStatus = yocoVerification.status;
      yocoVerificationDetail = yocoVerification.detail;

      if (yocoVerification.paid) {
        const now = new Date().toISOString();
        const { error: updatePaidError } = await admin
          .from("bookings")
          .update({ payment_status: "paid", updated_at: now })
          .eq("id", bookingId);

        if (updatePaidError) {
          return jsonResponse({
            success: false,
            status: "paid_update_failed",
            bookingId,
            paymentConfirmed: true,
            detail: updatePaidError.message,
          }, 500);
        }

        paymentStatus = "paid";
        booking.payment_status = "paid";
      }
    }

    if (paymentStatus !== "paid") {
      return jsonResponse({
        success: false,
        status: "not_paid",
        bookingId,
        paymentStatus: paymentStatus ?? "unpaid",
        yocoStatus: yocoVerificationStatus,
        detail: yocoVerificationDetail,
      });
    }

    const { data: emailState, error: emailStateError } = await admin
      .from("bookings")
      .select("payment_confirmation_sent_at, payment_confirmation_email_ids")
      .eq("id", bookingId)
      .maybeSingle();

    if (emailStateError) {
      console.error("Could not read payment confirmation tracking columns:", emailStateError);
      return jsonResponse({
        success: true,
        status: "paid_tracking_unavailable",
        bookingId,
        paymentConfirmed: true,
        message: "Payment is confirmed, but email tracking columns are not available.",
      });
    }

    if (emailState?.payment_confirmation_sent_at) {
      return jsonResponse({
        success: true,
        status: "already_sent",
        bookingId,
        paymentConfirmed: true,
        sentAt: emailState.payment_confirmation_sent_at,
        emailIds: emailState.payment_confirmation_email_ids,
      });
    }

    const currentEmailState = isRecord(emailState?.payment_confirmation_email_ids)
      ? emailState.payment_confirmation_email_ids
      : null;
    if (currentEmailState?.status === "sending") {
      return jsonResponse({ success: true, status: "sending", bookingId, paymentConfirmed: true }, 202);
    }
    if (currentEmailState) {
      return jsonResponse({
        success: false,
        status: "previous_attempt_exists",
        bookingId,
        paymentConfirmed: true,
        emailState: currentEmailState,
      });
    }

    const apiKey = Deno.env.get("CTSC_RESEND_KEY") ?? Deno.env.get("RESEND_API_KEY");
    const configuredAdminEmails = parseEmailList(
      Deno.env.get("ADMIN_EMAIL") ?? Deno.env.get("OWNER_EMAIL") ?? DEFAULT_ADMIN_EMAIL
    );
    const adminEmails = configuredAdminEmails.filter(
      (email) => email.toLowerCase() !== "nexwebsa@gmail.com"
    );
    if (!adminEmails.length) adminEmails.push(DEFAULT_ADMIN_EMAIL);

    if (!apiKey) {
      console.error("Payment is confirmed but CTSC_RESEND_KEY or RESEND_API_KEY is not set");
      return jsonResponse({
        success: false,
        status: "email_not_configured",
        bookingId,
        paymentConfirmed: true,
        message: "Payment is confirmed, but payment confirmation email is not configured.",
      });
    }

    const startedAt = new Date().toISOString();
    const claim = { status: "sending", started_at: startedAt };
    const { data: claimed, error: claimError } = await admin
      .from("bookings")
      .update({
        payment_confirmation_email_ids: claim,
        updated_at: startedAt,
      })
      .eq("id", bookingId)
      .eq("payment_status", "paid")
      .is("payment_confirmation_sent_at", null)
      .is("payment_confirmation_email_ids", null)
      .select("id")
      .maybeSingle();

    if (claimError) {
      return jsonResponse({ error: "Failed to claim payment confirmation send", detail: claimError.message }, 500);
    }

    if (!claimed) {
      const { data: latest } = await admin
        .from("bookings")
        .select("payment_confirmation_sent_at, payment_confirmation_email_ids")
        .eq("id", bookingId)
        .maybeSingle();

      if (latest?.payment_confirmation_sent_at) {
        return jsonResponse({
          success: true,
          status: "already_sent",
          bookingId,
          sentAt: latest.payment_confirmation_sent_at,
          emailIds: latest.payment_confirmation_email_ids,
        });
      }

      return jsonResponse({
        success: true,
        status: "sending",
        bookingId,
        emailIds: latest?.payment_confirmation_email_ids ?? null,
      }, 202);
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

    const customerEmail = booking.guest_email ?? userEmail;
    const fullName = profileName ?? booking.guest_name ?? "Customer";
    const phone = profilePhone ?? booking.guest_phone ?? "-";
    const vehicleName = booking.vehicles?.name ?? extractFromNotes(booking.notes, "Vehicle") ?? "Vehicle";
    const amountPaid = formatRand(booking.price_estimate);
    const reference = orderNumber(booking.id);
    const passengers =
      booking.passengers?.toString() ?? extractFromNotes(booking.notes, "Passengers") ?? "1";
    const flightNumber = extractFromNotes(booking.notes, "Flight");
    const yocoReference = booking.yoco_checkout_id ?? "-";

    const commonRows: Array<[string, string | null | undefined]> = [
      ["Booking reference", reference],
      ["Customer name", fullName],
      ["Service type", titleCase(booking.service_type)],
      ["Pickup location", booking.pickup_location ?? "-"],
      ["Drop-off location", booking.dropoff_location],
      ["Date", booking.pickup_date ?? "-"],
      ["Time", booking.pickup_time ?? "-"],
      ["Vehicle", vehicleName],
      ["Passenger count", passengers],
      ["Amount paid", amountPaid],
      ["Payment status", "Paid"],
    ];

    const customerHtml = renderEmailShell(
      "Payment Confirmed",
      `Hi ${firstName(fullName)}, thank you. We have received payment for your CTSC Travel booking. The CTSC Travel team has also been notified.`,
      renderRows(commonRows),
      "We will be in touch shortly with any final trip details. Thank you for choosing CTSC Travel."
    );

    const adminRows: Array<[string, string | null | undefined]> = [
      ["Booking reference", reference],
      ["Customer name", fullName],
      ["Customer email", customerEmail ?? "-"],
      ["Customer phone", phone],
      ["Service type", titleCase(booking.service_type)],
      ["Pickup location", booking.pickup_location ?? "-"],
      ["Drop-off location", booking.dropoff_location],
      ["Date/time", `${booking.pickup_date ?? "-"} ${booking.pickup_time ?? ""}`.trim()],
      ["Vehicle", vehicleName],
      ["Passenger count", passengers],
      ["Amount paid", amountPaid],
      ["Yoco/payment reference", yocoReference],
      ["Payment status", "Paid"],
      ["Flight number", flightNumber],
      ["Booking ID", booking.id],
    ];

    const adminHtml = renderEmailShell(
      "Payment Received",
      `A payment has been received for booking #${reference}. The booking is marked as paid in Supabase.`,
      renderRows(adminRows),
      "Please review the admin dashboard for driver assignment and operational follow-up."
    );

    const emailIds: {
      status: string;
      started_at: string;
      sent_at?: string;
      customer: EmailSendRecord;
      admin: EmailSendRecord;
      error?: string;
    } = {
      status: "sending",
      started_at: startedAt,
      customer: {},
      admin: {},
    };

    const emailErrors: string[] = [];

    if (customerEmail) {
      try {
        const customerResend = await sendEmail(
          apiKey,
          customerEmail,
          "Payment Confirmed - CTSC Travel Booking",
          customerHtml
        );
        emailIds.customer = { to: customerEmail, id: emailIdFromResponse(customerResend) };
      } catch (customerError) {
        const message = customerError instanceof Error ? customerError.message : "Unknown customer email error";
        console.error("Customer payment confirmation email failed:", customerError);
        emailErrors.push(`customer: ${message}`);
        emailIds.customer = { to: customerEmail, error: message };
      }
    } else {
      console.warn(`Booking ${bookingId} has no customer email; customer payment confirmation skipped`);
      emailIds.customer = { skipped: "missing_customer_email" };
    }

    try {
      const adminResend = await sendEmail(
        apiKey,
        adminEmails,
        "Payment Received - CTSC Travel Booking",
        adminHtml,
        customerEmail
      );
      emailIds.admin = { to: adminEmails, id: emailIdFromResponse(adminResend) };
    } catch (adminError) {
      const message = adminError instanceof Error ? adminError.message : "Unknown admin email error";
      console.error("Admin payment notification email failed:", adminError);
      emailErrors.push(`admin: ${message}`);
      emailIds.admin = { to: adminEmails, error: message };
    }

    try {
      const sentAt = new Date().toISOString();
      emailIds.status = emailErrors.length ? "partial_failed" : "sent";
      emailIds.sent_at = sentAt;
      if (emailErrors.length) emailIds.error = emailErrors.join(" | ");

      const { error: updateError } = await admin
        .from("bookings")
        .update({
          payment_confirmation_sent_at: sentAt,
          payment_confirmation_email_ids: emailIds,
          updated_at: sentAt,
        })
        .eq("id", bookingId);

      if (updateError) {
        throw new Error(`Payment email sent but booking update failed: ${updateError.message}`);
      }

      return jsonResponse({
        success: true,
        status: emailErrors.length ? "email_partial_failed" : "sent",
        bookingId,
        paymentConfirmed: true,
        customerEmailSent: Boolean(emailIds.customer.id),
        adminEmailSent: Boolean(emailIds.admin.id),
        emailIds,
      });
    } catch (sendError) {
      const failedAt = new Date().toISOString();
      emailIds.status = "failed";
      emailIds.error = sendError instanceof Error ? sendError.message : "Unknown email error";

      await admin
        .from("bookings")
        .update({
          payment_confirmation_email_ids: {
            ...emailIds,
            failed_at: failedAt,
          },
          updated_at: failedAt,
        })
        .eq("id", bookingId);

      console.error("Payment confirmation email failed:", sendError);
      return jsonResponse({
        success: false,
        status: "email_failed",
        bookingId,
        paymentConfirmed: true,
        error: "Payment confirmation email could not be sent automatically",
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
