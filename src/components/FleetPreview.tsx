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
   VEHICLE SILHOUETTE ICONS
   ═══════════════════════════════════════════ */

const SedanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 52" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38h104a4 4 0 004-4v-4c0-2-1.5-3.5-3.5-3.5h-12L88 14c-1.5-1.5-3.5-2.5-5.8-2.5H52.5c-2.5 0-4.8 1-6.5 2.7L30.5 26.5H12c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M8 38h104a4 4 0 004-4v-4c0-2-1.5-3.5-3.5-3.5h-12L88 14c-1.5-1.5-3.5-2.5-5.8-2.5H52.5c-2.5 0-4.8 1-6.5 2.7L30.5 26.5H12c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M33 26.5L47.5 14.8c1-1 2.5-1.6 4-1.6h26.5c1.4 0 2.7.5 3.6 1.4L92 26.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <line x1="56" y1="13.2" x2="56" y2="26.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    <circle cx="28" cy="38" r="7.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="28" cy="38" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="92" cy="38" r="7.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="92" cy="38" r="3" fill="currentColor" opacity="0.3"/>
    <ellipse cx="114" cy="32" rx="2.5" ry="1.8" fill="currentColor" opacity="0.5"/>
    <path d="M62 26.5V38" stroke="currentColor" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
  </svg>
);

const SuvIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 42h108a4 4 0 004-4v-5c0-2-1.5-3.5-3.5-3.5h-10L94 14c-1.2-1.8-3.3-3-5.6-3H48c-2.8 0-5.3 1.3-7 3.3L26.5 29.5H10c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M6 42h108a4 4 0 004-4v-5c0-2-1.5-3.5-3.5-3.5h-10L94 14c-1.2-1.8-3.3-3-5.6-3H48c-2.8 0-5.3 1.3-7 3.3L26.5 29.5H10c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M29.5 29.5L43 15.5c1-1.2 2.5-1.9 4.2-1.9h24c1.5 0 3 .6 4 1.6L89 29.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <line x1="56" y1="13.6" x2="56" y2="29.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    <line x1="72" y1="13.6" x2="72" y2="29.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    <circle cx="28" cy="42" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="28" cy="42" r="3.5" fill="currentColor" opacity="0.3"/>
    <circle cx="92" cy="42" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="92" cy="42" r="3.5" fill="currentColor" opacity="0.3"/>
    <path d="M38 11h44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <ellipse cx="114" cy="34" rx="2.5" ry="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const VanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 130 58" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 44h122a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-8L108 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v28.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M4 44h122a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-8L108 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v28.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="12" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="32" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="52" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="72" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <path d="M94 12l10 14h12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <circle cx="30" cy="44" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="30" cy="44" r="3.5" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="44" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="100" cy="44" r="3.5" fill="currentColor" opacity="0.3"/>
    <ellipse cx="124" cy="34" rx="2.5" ry="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const MinibusIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 150 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 46h142a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-7L128 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v30.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M4 46h142a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-7L128 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v30.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="10" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="28" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="46" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="64" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="82" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="100" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <path d="M120 12l10 15h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    <circle cx="34" cy="46" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="34" cy="46" r="4" fill="currentColor" opacity="0.3"/>
    <circle cx="116" cy="46" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="116" cy="46" r="4" fill="currentColor" opacity="0.3"/>
    <rect x="127" y="18" width="3" height="5" rx="1" fill="currentColor" opacity="0.4"/>
    <ellipse cx="144" cy="35" rx="2.5" ry="2" fill="currentColor" opacity="0.5"/>
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
            className="max-w-6xl mx-auto"
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
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-3">
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
                      className="group flex flex-col items-center gap-2 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
                    >
                      {/* Icon container */}
                      <div
                        className={`relative w-full rounded-xl transition-all duration-300 flex items-center justify-center px-2 py-2.5 ${
                          isActive
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
                        className={`text-[10px] leading-tight text-center font-medium transition-colors px-0.5 line-clamp-2 ${
                          isActive
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

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">

                    {/* ── Image panel ── */}
                    <div className="lg:col-span-3 relative">
                      <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[240px] relative overflow-hidden">
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
                        <div className="absolute bottom-4 left-4">
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10"
                          >
                            <Users className="w-3.5 h-3.5 text-accent" />
                            Up to {selected.capacity} passengers
                          </motion.span>
                        </div>

                        {/* Vehicle name overlay on image (mobile) */}
                        <div className="absolute bottom-4 right-4 lg:hidden">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="text-white font-bold text-lg drop-shadow-lg"
                          >
                            {selected.name}
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
                          {selected.features.slice(0, 5).map((f, i) => (
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