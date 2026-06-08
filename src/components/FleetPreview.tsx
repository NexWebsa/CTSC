import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Users, Car, Luggage, Wind, Shield } from "lucide-react";
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
   PREMIUM VEHICLE SILHOUETTE ICONS
   ═══════════════════════════════════════════ */

const SedanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 52" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <path d="M8 38h104a4 4 0 004-4v-4c0-2-1.5-3.5-3.5-3.5h-12L88 14c-1.5-1.5-3.5-2.5-5.8-2.5H52.5c-2.5 0-4.8 1-6.5 2.7L30.5 26.5H12c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M8 38h104a4 4 0 004-4v-4c0-2-1.5-3.5-3.5-3.5h-12L88 14c-1.5-1.5-3.5-2.5-5.8-2.5H52.5c-2.5 0-4.8 1-6.5 2.7L30.5 26.5H12c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Cabin / windows */}
    <path d="M33 26.5L47.5 14.8c1-1 2.5-1.6 4-1.6h26.5c1.4 0 2.7.5 3.6 1.4L92 26.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <line x1="56" y1="13.2" x2="56" y2="26.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    {/* Wheels */}
    <circle cx="28" cy="38" r="7.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="28" cy="38" r="3" fill="currentColor" opacity="0.3"/>
    <circle cx="92" cy="38" r="7.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="92" cy="38" r="3" fill="currentColor" opacity="0.3"/>
    {/* Headlight */}
    <ellipse cx="114" cy="32" rx="2.5" ry="1.8" fill="currentColor" opacity="0.5"/>
    {/* Door line */}
    <path d="M62 26.5V38" stroke="currentColor" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
  </svg>
);

const SuvIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Body — taller */}
    <path d="M6 42h108a4 4 0 004-4v-5c0-2-1.5-3.5-3.5-3.5h-10L94 14c-1.2-1.8-3.3-3-5.6-3H48c-2.8 0-5.3 1.3-7 3.3L26.5 29.5H10c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M6 42h108a4 4 0 004-4v-5c0-2-1.5-3.5-3.5-3.5h-10L94 14c-1.2-1.8-3.3-3-5.6-3H48c-2.8 0-5.3 1.3-7 3.3L26.5 29.5H10c-3.3 0-6 2.7-6 6v2.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Windows */}
    <path d="M29.5 29.5L43 15.5c1-1.2 2.5-1.9 4.2-1.9h24c1.5 0 3 .6 4 1.6L89 29.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    <line x1="56" y1="13.6" x2="56" y2="29.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    <line x1="72" y1="13.6" x2="72" y2="29.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    {/* Wheels — bigger */}
    <circle cx="28" cy="42" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="28" cy="42" r="3.5" fill="currentColor" opacity="0.3"/>
    <circle cx="92" cy="42" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="92" cy="42" r="3.5" fill="currentColor" opacity="0.3"/>
    {/* Roof rails */}
    <path d="M38 11h44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    {/* Headlight */}
    <ellipse cx="114" cy="34" rx="2.5" ry="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const VanIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 130 58" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Boxy body */}
    <path d="M4 44h122a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-8L108 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v28.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M4 44h122a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-8L108 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v28.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Side windows */}
    <rect x="12" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="32" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="52" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="72" y="12" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    {/* Front windshield */}
    <path d="M94 12l10 14h12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    {/* Wheels */}
    <circle cx="30" cy="44" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="30" cy="44" r="3.5" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="44" r="8.5" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="100" cy="44" r="3.5" fill="currentColor" opacity="0.3"/>
    {/* Headlight */}
    <ellipse cx="124" cy="34" rx="2.5" ry="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const MinibusIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 150 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Long body */}
    <path d="M4 46h142a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-7L128 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v30.5c0 1.7 1.3 3 3 3z" fill="currentColor" opacity="0.15"/>
    <path d="M4 46h142a3 3 0 003-3v-6c0-2-1.5-3.5-3.5-3.5h-7L128 10c-1-2-3-3.5-5.5-3.5H18c-3.3 0-6 2.7-6 6v30.5c0 1.7 1.3 3 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Many windows */}
    <rect x="10" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="28" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="46" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="64" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="82" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    <rect x="100" y="12" width="14" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    {/* Front windshield */}
    <path d="M120 12l10 15h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    {/* Wheels */}
    <circle cx="34" cy="46" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="34" cy="46" r="4" fill="currentColor" opacity="0.3"/>
    <circle cx="116" cy="46" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="116" cy="46" r="4" fill="currentColor" opacity="0.3"/>
    {/* Side mirror */}
    <rect x="127" y="18" width="3" height="5" rx="1" fill="currentColor" opacity="0.4"/>
    {/* Headlight */}
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
    <section className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            Our Fleet
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight">
            Choose Your Ride
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base leading-relaxed">
            From sleek sedans to spacious minibuses — every vehicle is fully licensed,
            insured, and meticulously maintained for your comfort across Cape Town.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No vehicles available.</p>
        ) : (
          <div className="max-w-6xl mx-auto">

            {/* ═══════ ICON SELECTOR ═══════ */}
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="italic">Click a vehicle to view details</span>
            </div>

            <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-5 sm:p-7 mb-8">
              <div className="flex items-end justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto pb-2">
                {vehicles.map((v) => {
                  const Icon = pickIcon(v.capacity);
                  const isActive = selected?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className="group flex flex-col items-center gap-3 flex-shrink-0 transition-all duration-300"
                      style={{ width: "110px" }}
                    >
                      {/* Icon container */}
                      <div
                        className={`relative w-full aspect-[2.3/1] flex items-center justify-center rounded-xl transition-all duration-300 px-3 py-2 ${
                          isActive
                            ? "bg-accent/[0.08] border-2 border-accent text-accent shadow-[0_0_28px_-8px_hsl(var(--accent)/0.5)]"
                            : "bg-secondary/40 border border-transparent text-muted-foreground/60 group-hover:text-foreground group-hover:bg-secondary/70"
                        }`}
                      >
                        <Icon className="w-full h-full" />
                        {/* Active indicator dot */}
                        {isActive && (
                          <motion.span
                            layoutId="fleet-active-dot"
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                          />
                        )}
                      </div>
                      {/* Vehicle name — allow wrap, proper line-height */}
                      <span
                        className={`text-[11px] sm:text-xs font-semibold text-center leading-snug transition-colors px-1 ${
                          isActive
                            ? "text-accent"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                        style={{ wordBreak: "break-word", hyphens: "auto" }}
                      >
                        {v.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══════ SHOWCASE ═══════ */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-6 sm:p-10 items-center"
                >
                  {/* ── Image ── */}
                  <div className="lg:col-span-3 relative aspect-[16/10] rounded-xl overflow-hidden bg-secondary">
                    {selected.image_url ? (
                      <motion.img
                        key={selected.image_url}
                        initial={{ scale: 1.05, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        src={selected.image_url}
                        alt={selected.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Car className="w-16 h-16 opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    {/* Capacity badge on image */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
                        <Users className="w-3.5 h-3.5" />
                        Up to {selected.capacity} passengers
                      </span>
                    </div>
                  </div>

                  {/* ── Details ── */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl font-bold text-accent tracking-tight"
                      >
                        {selected.name}
                      </motion.h3>
                      {selected.description && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm text-foreground/85 mt-3 leading-relaxed"
                        >
                          {selected.description}
                        </motion.p>
                      )}
                    </div>

                    {/* Feature icons row */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center gap-4"
                    >
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Luggage className="w-3.5 h-3.5" />
                        Ample luggage
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Wind className="w-3.5 h-3.5" />
                        Climate control
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Shield className="w-3.5 h-3.5" />
                        Fully insured
                      </span>
                    </motion.div>

                    {/* Features list */}
                    {selected.features && selected.features.length > 0 && (
                      <ul className="space-y-2.5">
                        {selected.features.slice(0, 6).map((f, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className="flex items-start gap-3 text-sm text-foreground leading-snug"
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
                            <span>{f}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-1">
                      <Link to="/book">
                        <Button
                          variant="accent"
                          className="gap-2 rounded-xl font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow"
                        >
                          Book {selected.name.split(" ")[0]}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center mt-12">
              <Link to="/fleet">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 font-semibold rounded-xl hover:border-accent/40 hover:text-accent transition-colors"
                >
                  View Full Fleet <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FleetPreview;
