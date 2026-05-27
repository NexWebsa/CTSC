import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles ,ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

const WHATSAPP_NUMBER = "27726178577";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I'd like to enquire about Cape Town Shuttle Service.",
)}`;

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I book a shuttle?",
  "How do payments work?",
  "What is a Custom Trip?",
  "How are drivers assigned?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"choice" | "chat">("choice");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Cape Town Shuttle assistant. Ask me about bookings, payments, drivers, or anything about the platform.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? SUPABASE_ANON_KEY;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) throw new Error("Too many requests — please wait a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted — please contact support.");
      if (!resp.ok) throw new Error("Sorry, something went wrong.");

      const contentType = resp.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = await resp.json();
        const reply =
          json?.content ??
          json?.reply ??
          json?.message ??
          json?.error ??
          "Sorry, something went wrong.";

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        return;
      }

      if (!resp.body) throw new Error("Sorry, something went wrong.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const flush = (chunk: string) => {
        assistantText += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      };

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) flush(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      const remaining = buffer.trim();
      if (!assistantText && remaining) {
        try {
          const json = JSON.parse(remaining.replace(/^data:\s*/, ""));
          const reply = json?.content ?? json?.reply ?? json?.message;
          if (reply) {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: reply };
              return copy;
            });
            assistantText = reply;
          }
        } catch {
          // ignore trailing non-JSON buffers from streaming responses
        }
      }

      if (!assistantText) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Sorry, I couldn’t read the assistant response.",
          };
          return copy;
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-2xl shadow-accent/30 flex items-center justify-center border border-accent/30 backdrop-blur-md"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-accent/10 to-transparent flex items-center gap-3">
              {view === "chat" ? (
                <button
                  onClick={() => setView("choice")}
                  className="h-9 w-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-foreground" />
                </button>
              ) : (
                <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {view === "chat" ? "Shuttle Assistant" : "How can we help?"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  {view === "chat" ? "Online" : "Choose how to chat with us"}
                </p>
              </div>
            </div>

            {view === "choice" ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Pick the option that suits you best, our team replies fast on WhatsApp, and our AI assistant is available 24/7.
                </p>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-[#25D366]/60 hover:bg-[#25D366]/5 transition"
                >
                  <div className="h-11 w-11 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 32 32" className="h-6 w-6 fill-[#25D366]" aria-hidden="true">
                      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.802 2.722.802.345 0 2.15-.46 2.478-1.51.115-.36.115-.688.06-.86-.082-.245-2.422-1.376-2.642-1.376zm-2.91 7.214h-.014c-1.747 0-3.48-.473-4.985-1.367l-.357-.214-3.703.973.99-3.61-.235-.373a9.86 9.86 0 0 1-1.49-5.234c.002-5.46 4.452-9.906 9.92-9.906a9.85 9.85 0 0 1 7.01 2.906c1.876 1.873 2.902 4.36 2.9 7.004 0 5.466-4.448 9.91-9.04 9.91zm0-21.835c-6.595 0-11.91 5.336-11.91 11.913 0 2.084.546 4.115 1.585 5.91L4 28l4.715-1.236a11.835 11.835 0 0 0 5.694 1.45h.005c6.59 0 11.96-5.336 11.96-11.913 0-3.18-1.24-6.166-3.484-8.413a11.88 11.88 0 0 0-8.475-3.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Chat live with our team, typically replies in minutes</p>
                  </div>
                </a>

                <button
                  onClick={() => setView("chat")}
                  className="group w-full flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-accent/60 hover:bg-accent/5 transition text-left"
                >
                  <div className="h-11 w-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Instant answers about bookings, pricing & services</p>
                  </div>
                </button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-accent text-accent-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        {m.content || (loading && i === messages.length - 1 ? (
                          <Loader2 className="h-4 w-4 animate-spin opacity-60" />
                        ) : null)}
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && !loading && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs text-muted-foreground">Try asking:</p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-accent/60 hover:bg-accent/10 transition text-muted-foreground hover:text-foreground"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); send(input); }}
                  className="p-3 border-t border-border/50 flex gap-2 bg-background/60"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about bookings, payments…"
                    disabled={loading}
                    className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-accent"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !input.trim()}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
