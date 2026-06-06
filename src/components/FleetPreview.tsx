import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight, Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

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
}

const FleetPreview = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const previewVehicles = vehicles.slice(0, 3);

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            Our Fleet
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight">
            Choose Your Ride
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
            Explore our premium fleet of vehicles, each meticulously maintained
            and ready to provide you with a comfortable and stylish ride around
            Cape Town.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
            </div>
          ) : (
            previewVehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden bg-secondary">
                  {vehicle.image_url ? (
                    <img
                      src={vehicle.image_url}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      width={800}
                      height={480}
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}

                  {/* Gradient overlay — always present, darkens on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Capacity badge — bottom right */}
                  {vehicle.capacity > 0 && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                      <Users className="w-3.5 h-3.5" strokeWidth={2} />
                      {vehicle.capacity}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-base tracking-tight">
                      {vehicle.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" strokeWidth={2} />
                      Cape Town Area
                    </p>
                  </div>
                  <Link to="/book">
                    <button className="w-9 h-9 rounded-xl bg-accent/10 hover:bg-accent hover:text-white text-accent flex items-center justify-center transition-all duration-200 group/btn">
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-10"
        >
          <Link to="/fleet">
            <Button variant="outline" size="lg" className="gap-2 font-semibold rounded-xl hover:border-accent/40 hover:text-white transition-colors">
              View Full Fleet <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FleetPreview;