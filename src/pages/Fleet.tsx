import { motion } from "framer-motion";
import { Users, Zap, Shield, Award, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleDetailModal from "@/components/fleet/VehicleDetailModal";
import Seo from "@/components/Seo";

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  image_url: string | null;
  price_per_km: number | null;
  price_per_hour: number | null;
  is_active: boolean;
  created_at: string;
  features: string[] | null;
  gallery_images: string[] | null;
}

const Fleet = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setVehicles(data || []);
      } catch (e) {
        console.error("Error fetching vehicles:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo
        title="Our Fleet | Cape Town Shuttles, Sedans, Vans & Minibuses"
        description="Browse the CTSC Travel fleet — sedans, SUVs, luxury vans and minibuses for airport transfers, chauffeur hire and group transport in Cape Town."
        path="/fleet"
      />
      <Navbar />

      {/* ── Hero ── */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full mb-5">
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              Our Fleet
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-3 leading-tight tracking-tight">
              Every trip deserves the{" "}
              <span className="text-accent relative inline-block">
                right vehicle
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full bg-accent/40"
                />
              </span>
            </h1>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed">
              From sleek sedans to spacious minibuses, every vehicle is fully
              licensed, insured and meticulously maintained.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Fleet Grid ── */}
      <div className="px-1.5 sm:px-6 lg:px-8 pb-20">
        <div className="w-full mx-auto max-w-7xl">  
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              {vehicles.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  onClick={() => { setSelected(v); setModalOpen(true); }}
                  className="cursor-pointer rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden relative bg-secondary/30">
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No image</span>
                      </div>
                    )}
                    {/* Capacity pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[11px] font-semibold border border-white/10">
                        <Users className="w-3 h-3 text-accent" />
                        {v.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-lg leading-tight">
                        {v.name}
                      </h3>
                      {v.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {v.description}
                        </p>
                      )}
                    </div>

                    {/* Features — hidden on smallest screens to save space */}
                    {v.features && v.features.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1.5">
                        {v.features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] font-medium text-muted-foreground border border-border/60 bg-secondary/40 rounded-md px-2 py-0.5"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                        onClick={(e) => { e.stopPropagation(); setSelected(v); setModalOpen(true); }}
                      >
                        Details
                      </Button>
                      <Link to="/book" className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="accent" size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9 gap-1">
                          Book <ArrowRight className="w-3 h-3 hidden sm:inline" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Why Our Fleet ── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="w-full mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-10"
          >
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-accent/70 mb-2">Standards</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why our fleet stands out</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: "Fully Licensed", desc: "All vehicles meet legal requirements" },
                { icon: Award, title: "Well Maintained", desc: "Regular servicing & inspections" },
                { icon: Zap, title: "Always Ready", desc: "24/7 availability for your needs" },
                { icon: Users, title: "Pro Drivers", desc: "Courteous & experienced team" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to book your ride?
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm sm:text-base">
              Choose from our premium fleet and experience the CTSC Travel difference today.
            </p>
            <Link to="/book">
              <Button variant="hero" size="lg" className="gap-2">
                Book your ride now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
      <VehicleDetailModal vehicle={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default Fleet;