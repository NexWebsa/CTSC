// ============================================================
// RAG CHAT EDGE FUNCTION
// OpenAI + Supabase pgvector
// FINAL PRODUCTION VERSION
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
You are the support assistant for Cape Town Shuttle Services, a premium shuttle booking platform.

Strict rules:
- Answer ONLY using the Knowledge Base context provided below.
- If the answer is not in the context, say:
  "I don't have that info — please reach out via the Contact page."
- Do not invent details.
- Be concise, friendly, and helpful.
- Use short paragraphs or bullet points.
- Refer to features using their real names:
  Booking form, Dashboard, Driver Dashboard, Yoco, etc.
- Never expose technical/internal system details.
`;

const CHAT_MODEL = "gpt-4o-mini";
const EMBED_MODEL = "text-embedding-3-small";

function parseEmbedding(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === "string") {
    return value
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((num) => Number.isFinite(num));
  }
  return [];
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return -1;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

Deno.serve(async (req) => {
  // ==========================================================
  // CORS
  // ==========================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const startedAt = Date.now();
  let logQuery = "";
  let logReply = "";
  let logTopSim: number | null = null;
  let logMatchCount = 0;
  let logUsedFallback = false;
  let logError: string | null = null;

  const supabaseForLog = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const writeLog = async () => {
    try {
      await supabaseForLog.from("chat_logs").insert({
        query: logQuery,
        reply: logReply,
        top_similarity: logTopSim,
        match_count: logMatchCount,
        used_fallback: logUsedFallback,
        latency_ms: Date.now() - startedAt,
        error: logError,
      });
    } catch (e) {
      console.error("chat_logs insert failed", e);
    }
  };

  try {
    // ==========================================================
    // ENV
    // ==========================================================

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // ==========================================================
    // REQUEST BODY
    // ==========================================================

    const body = await req.json();

    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "messages array required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ==========================================================
    // GET USER QUERY
    // ==========================================================

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");

    const query = lastUserMessage?.content ?? "";
    logQuery = query;

    console.log("USER QUERY:", query);

    // ==========================================================
    // GENERATE QUERY EMBEDDING
    // ==========================================================

    const embeddingResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: EMBED_MODEL,
          input: query,
        }),
      }
    );

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();

      console.error("EMBEDDING ERROR:", errorText);

      throw new Error(
        `Embedding failed: ${embeddingResponse.status}`
      );
    }

    const embeddingJson = await embeddingResponse.json();

    const queryEmbedding =
      embeddingJson.data?.[0]?.embedding;

    if (!queryEmbedding) {
      throw new Error("No embedding returned");
    }

    // ==========================================================
    // SUPABASE
    // ==========================================================

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ==========================================================
    // MATCH KNOWLEDGE LOCALLY
    // ==========================================================

    const { data: docs, error: docsError } = await supabase
      .from("kb_documents")
      .select("id, title, content, category, embedding")
      .not("embedding", "is", null);

    if (docsError) {
      throw new Error(`Knowledge lookup failed: ${docsError.message}`);
    }

    const matches = (docs ?? [])
      .map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        similarity: cosineSimilarity(queryEmbedding, parseEmbedding(doc.embedding)),
      }))
      .filter((doc) => Number.isFinite(doc.similarity))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    console.log("MATCHES RAW:", JSON.stringify(matches));
    console.log("MATCHES LENGTH:", matches.length);

    logTopSim = matches[0]?.similarity ?? null;

    // ==========================================================
    // FILTER LOW QUALITY MATCHES
    // ==========================================================

    const filteredMatches = matches.filter((m) => m.similarity > 0.25);
    logMatchCount = filteredMatches.length;

    // Low-confidence fallback: if best match is weak, short-circuit
    // with the Contact suggestion instead of guessing.
    const LOW_CONFIDENCE_THRESHOLD = 0.4;
    if ((logTopSim ?? 0) < LOW_CONFIDENCE_THRESHOLD) {
      logUsedFallback = true;
      const fallback =
        "I don't have that info — please reach out via the Contact page.";
      logReply = fallback;
      await writeLog();
      return new Response(
        JSON.stringify({ role: "assistant", content: fallback }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      "FILTERED MATCHES:",
      JSON.stringify(filteredMatches)
    );

    // ==========================================================
    // BUILD CONTEXT
    // ==========================================================

    const context =
      filteredMatches.length > 0
        ? filteredMatches
            .map(
              (m: any, i: number) =>
                `[${i + 1}] ${m.title}\n${m.content}`
            )
            .join("\n\n---\n\n")
        : "(no relevant knowledge found)";

    console.log("FINAL CONTEXT:", context);

    // ==========================================================
    // CHAT COMPLETION
    // ==========================================================

    const chatResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "system",
              content: `Knowledge Base:\n\n${context}`,
            },
            ...messages,
          ],
        }),
      }
    );

    // ==========================================================
    // OPENAI ERRORS
    // ==========================================================

    if (chatResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            "Rate limited, please try again shortly.",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (chatResponse.status === 401) {
      return new Response(
        JSON.stringify({
          error: "Invalid OpenAI API key.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();

      console.error(
        "CHAT COMPLETION ERROR:",
        chatResponse.status,
        errorText
      );

      throw new Error("Chat completion failed");
    }

    // ==========================================================
    // PARSE RESPONSE
    // ==========================================================

    const chatJson = await chatResponse.json();

    console.log("OPENAI RESPONSE:", chatJson);

    const reply =
      chatJson.choices?.[0]?.message?.content?.trim() ||
      "I don't have that info — please reach out via the Contact page.";

    console.log("FINAL REPLY:", reply);
    logReply = reply;
    await writeLog();

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return new Response(
      JSON.stringify({ role: "assistant", content: reply }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("EDGE FUNCTION ERROR:", error);
    logError = error instanceof Error ? error.message : String(error);
    await writeLog();

    return new Response(
      JSON.stringify({ error: logError }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});