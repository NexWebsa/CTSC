// Calls Google's Routes API directly using the user's own GOOGLE_MAPS_API_KEY secret.
// Inputs: { origin: string, destination: string } (free-text addresses)
// Output: { distanceKm: number, durationMinutes: number }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const GMAPS_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!GMAPS_KEY) {
      return new Response(JSON.stringify({ error: "GOOGLE_MAPS_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    if (!origin || !destination) {
      return new Response(JSON.stringify({ error: "origin and destination required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": GMAPS_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        regionCode: "ZA",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.routes?.length) {
      const detailMsg = data?.error?.message || (typeof data === "string" ? data : JSON.stringify(data));
      console.error("Routes API failed", res.status, detailMsg);
      return new Response(JSON.stringify({ error: `Google Routes API: ${detailMsg}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const r = data.routes[0];
    const distanceKm = (r.distanceMeters || 0) / 1000;
    const durationSeconds = parseInt(String(r.duration || "0").replace("s", ""), 10);
    const durationMinutes = Math.round(durationSeconds / 60);

    return new Response(JSON.stringify({ distanceKm, durationMinutes }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
