import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Users, Car, Luggage, Wind, Shield, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  image_url: string | null;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
}

/* ═══════════════════════════════════════════
   VEHICLE ICONS — clean flat vector
   ═══════════════════════════════════════════ */

const SedanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 160 72" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M14 50 L14 43 Q14 40 17 40 L27 40 L38 26 Q42 22 48 22 L108 22 Q114 22 118 26 L129 40 L143 40 Q146 40 146 43 L146 50 Q146 52 143 52 L17 52 Q14 52 14 50Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M40 40 L50 27 Q53 24 57 24 L100 24 Q105 24 108 27 L118 40Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="78" y1="24" x2="78" y2="40" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="40" cy="52" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="40" cy="52" r="4.5" fill="currentColor" />
    <circle cx="120" cy="52" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="120" cy="52" r="4.5" fill="currentColor" />
    <path d="M143 44 L148 44 Q151 44 151 47 L151 49 Q151 51 148 51 L146 51" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 47 L10 47 Q8 47 8 45 L8 43 Q8 41 10 41 L14 41" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SuvIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 160 76" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 54 L12 44 Q12 40 16 40 L28 40 L40 24 Q44 18 52 18 L106 18 Q114 18 118 24 L130 40 L144 40 Q148 40 148 44 L148 54 Q148 57 144 57 L16 57 Q12 57 12 54Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M42 40 L53 26 Q56 22 61 22 L96 22 Q101 22 105 26 L116 40Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="79" y1="22" x2="79" y2="40" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="61" y1="22" x2="42" y2="40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
    <line x1="60" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="18" x2="60" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="100" y1="18" x2="100" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="38" cy="57" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="38" cy="57" r="5" fill="currentColor" />
    <circle cx="122" cy="57" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="122" cy="57" r="5" fill="currentColor" />
    <path d="M145 46 L151 46 Q154 46 154 49 L154 52 Q154 55 151 55 L148 55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const VanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 160 72" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 L10 20 Q10 16 14 16 L110 16 Q116 16 120 20 L148 40 Q150 42 150 45 L150 50 Q150 53 146 53 L14 53 Q10 53 10 50Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="16" y="20" width="20" height="17" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="42" y="20" width="20" height="17" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="68" y="20" width="20" height="17" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="94" y="20" width="16" height="17" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M112 20 L138 40 L150 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="10" y1="37" x2="112" y2="37" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
    <circle cx="36" cy="53" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="36" cy="53" r="4.5" fill="currentColor" />
    <circle cx="122" cy="53" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="122" cy="53" r="4.5" fill="currentColor" />
    <path d="M148 43 L154 43 Q156 43 156 46 L156 49 Q156 52 154 52 L150 52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MinibusIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 180 72" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 L10 18 Q10 14 14 14 L140 14 Q146 14 150 18 L168 40 Q170 43 170 46 L170 50 Q170 53 166 53 L14 53 Q10 53 10 50Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="16" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="37" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="58" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="79" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="100" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="121" y="18" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M139 18 L162 40 L170 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="10" y1="34" x2="139" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
    <circle cx="38" cy="53" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="38" cy="53" r="4.5" fill="currentColor" />
    <circle cx="80" cy="53" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="80" cy="53" r="4.5" fill="currentColor" />
    <circle cx="144" cy="53" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="144" cy="53" r="4.5" fill="currentColor" />
    <path d="M168 44 L174 44 Q176 44 176 47 L176 49 Q176 52 174 52 L170 52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const pickIcon = (capacity: number) => {
  if (capacity <= 4) return SedanIcon;
  if (capacity <= 6) return SuvIcon;
  if (capacity <= 10) return VanIcon;
  return MinibusIcon;
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

const FleetPreview = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("is_active", true)
          .order("capacity", { ascending: true });
        if (error) throw error;
        setVehicles(data || []);
        if (data && data.length) setSelectedId(data[0].id);
      } catch (e) {
        console.error("Error fetching vehicles:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo(
    () => vehicles.find((v) => v.id === selectedId) || vehicles[0] || null,
    [vehicles, selectedId]
  );

  return (
    <section className="section-padding bg-background overflow-hidden relative">

      {/* Subtle ambient glow behind section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--accent)/0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto relative">

        {/* ═══════ HEADER ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full mb-5">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            Our Fleet
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Choose Your{" "}
            <span
              className="relative inline-block"
              style={{ color: "hsl(var(--accent))" }}
            >
              Ride
              {/* Underline accent */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full"
                style={{ background: "hsl(var(--accent)/0.5)" }}
              />
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-5 text-base leading-relaxed">
            Every vehicle is fully licensed, insured, and meticulously
            maintained from sleek sedans to spacious minibuses.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No vehicles available.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-6xl mx-auto"
          >

            {/* ═══════ ICON SELECTOR ═══════ */}
            <div
              className="rounded-2xl border border-border/60 p-5 sm:p-6 mb-6"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--card)/0.6) 0%, hsl(var(--card)/0.3) 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Hint label */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4 px-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse flex-shrink-0" />
                <span className="italic">Select a vehicle to preview</span>
              </div>

              {/*
                KEY FIX: use a CSS grid that wraps naturally.
                - grid-cols-4 on mobile → 3 rows of ~4 cars = all 11 visible
                - grid-cols-6 on sm → 2 rows
                - grid-cols-11 on lg (or auto-fit) → single row when there's room
                This means nothing is ever clipped regardless of count.
              */}
              <div className="flex sm:grid sm:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible pb-2.5 sm:pb-0 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:hsl(var(--accent)/0.35)_transparent]">
                {vehicles.map((v, idx) => {
                  const Icon = pickIcon(v.capacity);
                  const isActive = selected?.id === v.id;
                  return (
                    <motion.button
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                      onClick={() => setSelectedId(v.id)}
                      className="group flex flex-col items-center gap-2 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl flex-shrink-0 w-16 sm:w-auto snap-start"
                    >
                      {/* Icon container */}
                      <div
                        className={`relative w-full rounded-xl transition-all duration-300 flex items-center justify-center px-2 py-2.5 ${isActive
                            ? "text-accent border-2 border-accent shadow-[0_0_20px_-6px_hsl(var(--accent)/0.6)]"
                            : "border border-border/50 text-muted-foreground/50 group-hover:text-foreground/70 group-hover:border-border"
                          }`}
                        style={{
                          background: isActive
                            ? "hsl(var(--accent)/0.08)"
                            : "hsl(var(--secondary)/0.3)",
                          aspectRatio: "2.2 / 1",
                        }}
                      >
                        <Icon className="w-full h-full" />
                        {/* Active dot */}
                        {isActive && (
                          <motion.span
                            layoutId="fleet-active-dot"
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent))]"
                          />
                        )}
                      </div>
                      {/* Name label */}
                      <span
                        className={`text-[10px] leading-tight text-center font-medium transition-colors px-0.5 line-clamp-2 ${isActive
                            ? "text-accent"
                            : "text-muted-foreground/60 group-hover:text-foreground/70"
                          }`}
                      >
                        {v.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ═══════ SHOWCASE CARD ═══════ */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative rounded-2xl overflow-hidden border border-border/60"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.7) 100%)",
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(var(--accent)/0.5), transparent)",
                    }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 w-full">

                    {/* ── Image panel ── */}
                    <div className="lg:col-span-3 relative">
                      <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full min-h-[240px] relative overflow-hidden">
                        {selected.image_url ? (
                          <motion.img
                            key={selected.image_url}
                            initial={{ scale: 1.06, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            src={selected.image_url}
                            alt={selected.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                            <Car className="w-20 h-20 opacity-20 text-muted-foreground" />
                          </div>
                        )}

                        {/* Layered gradients for depth */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/50 pointer-events-none hidden lg:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                        {/* Capacity badge */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3 bg-gradient-to-t from-black/75 via-black/40 to-transparent">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="text-white font-bold text-base sm:text-lg drop-shadow-lg leading-tight lg:hidden min-w-0 break-words"
                          >
                            {selected.name}
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 flex-shrink-0 self-start sm:self-auto sm:ml-auto"
                          >
                            <Users className="w-3.5 h-3.5 text-accent" />
                            Up to {selected.capacity} passengers
                          </motion.span>
                        </div>
                      </div>
                    </div>

                    {/* ── Details panel ── */}
                    <div className="lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 gap-6">

                      {/* Name + description */}
                      <div>
                        <motion.div
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="hidden lg:block"
                        >
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent/70 mb-1.5">
                            Selected Vehicle
                          </p>
                          <h3 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                            {selected.name}
                          </h3>
                          <div
                            className="h-0.5 w-10 mt-3 mb-4 rounded-full"
                            style={{ background: "hsl(var(--accent)/0.6)" }}
                          />
                        </motion.div>

                        {selected.description && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18 }}
                            className="text-sm text-foreground/75 leading-relaxed"
                          >
                            {selected.description}
                          </motion.p>
                        )}
                      </div>

                      {/* Quick spec pills */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.22 }}
                        className="flex flex-wrap gap-2"
                      >
                        {[
                          { icon: Luggage, label: "Ample luggage" },
                          { icon: Wind, label: "Climate control" },
                          { icon: Shield, label: "Fully insured" },
                        ].map(({ icon: Icon, label }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground border border-border/60 rounded-lg px-2.5 py-1.5 bg-secondary/30"
                          >
                            <Icon className="w-3 h-3 text-accent/70" />
                            {label}
                          </span>
                        ))}
                      </motion.div>

                      {/* Feature list */}
                      {selected.features && selected.features.length > 0 && (
                        <ul className="space-y-2">
                          {selected.features.slice(3, 8).map((f, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.06 }}
                              className="flex items-center gap-3 text-sm text-foreground/80"
                            >
                              <ChevronRight
                                className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: "hsl(var(--accent)/0.8)" }}
                              />
                              <span>{f}</span>
                            </motion.li>
                          ))}
                        </ul>
                      )}

                      {/* CTA */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link to="/book">
                          <Button
                            variant="accent"
                            className="w-full sm:w-auto gap-2 rounded-xl font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/35 transition-all hover:-translate-y-0.5"
                          >
                            Book {selected.name.split(" ")[0]}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════ FOOTER CTA ═══════ */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center mt-10"
            >
              <Link to="/fleet">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 font-semibold rounded-xl hover:border-accent/50 hover:text-white transition-all hover:-translate-y-0.5"
                >
                  View Full Fleet
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FleetPreview;