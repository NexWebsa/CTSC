// Sends contact-form messages via Resend to the configured inbox.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TO_EMAIL = "suhairsmithwz3@gmail.com";
const FROM_EMAIL = "ctscbooking@ctsctravel.com";

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("CTSC_RESEND_KEY");
    if (!RESEND_API_KEY) throw new Error("CTSC_RESEND_KEY not configured");

    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 100);
    const email = String(body.email ?? "").trim().slice(0, 255);
    const phone = String(body.phone ?? "").trim().slice(0, 50);
    const subject = String(body.subject ?? "").trim().slice(0, 200);
    const message = String(body.message ?? "").trim().slice(0, 5000);

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:24px;color:#111">
        <h2 style="margin:0 0 16px">New contact form submission</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0"><strong>${esc(name)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${esc(phone)}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#666">Subject</td><td style="padding:8px 0"><strong>${esc(subject)}</strong></td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap">${esc(message)}</div>
      </div>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[Contact] ${subject}`,
        html,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Resend error", r.status, txt);
      return new Response(JSON.stringify({ error: "Email failed", detail: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
