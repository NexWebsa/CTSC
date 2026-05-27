// One-time (or re-runnable) function to generate embeddings for kb_documents using OpenAI.
// Call: POST /functions/v1/embed-knowledge-base  (no body needed)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMBED_MODEL = "text-embedding-3-small"; // 1536 dims

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: docs, error } = await supabase
      .from("kb_documents")
      .select("id, title, content")
      .is("embedding", null);
    if (error) throw error;

    let updated = 0;
    for (const doc of docs ?? []) {
      const input = `${doc.title}\n\n${doc.content}`;
      const r = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: EMBED_MODEL, input }),
      });
      if (!r.ok) {
        console.error("embed failed", doc.id, r.status, await r.text());
        continue;
      }
      const json = await r.json();
      const embedding = json.data?.[0]?.embedding;
      if (!embedding) continue;

      const { error: upErr } = await supabase
        .from("kb_documents")
        .update({ embedding })
        .eq("id", doc.id);
      if (upErr) console.error("update failed", doc.id, upErr);
      else updated++;
    }

    return new Response(JSON.stringify({ ok: true, updated, total: docs?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
