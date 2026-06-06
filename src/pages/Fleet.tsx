import { motion } from "framer-motion";
import { Users, Zap, Shield, Award, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const Fleet = () => {
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

  return (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-32 section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Welcome
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2">
            To Our Fleet
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Showcasing our diverse range of vehicles. From luxury sedans to
            spacious SUVs and versatile vans, each vehicle is well maintained
            and looked after.
          </p>
        </motion.div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 px-2 sm:px-0">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/50 hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden relative">
                {v.image_url ? (
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={512}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {v.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg whitespace-nowrap">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">
                        {v.capacity} Seater
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {v.description}
                  </p>
                </div>

                {/* CTA */}
                <Link to="/book" className="w-full">
                  <Button variant="accent" className="w-full" size="sm">
                    Book Now
                  </Button>
                </Link>
              </div>
            </motion.div>
            ))
          )}
        </div>

        {/* Quality Assurance Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Why Our Fleet Stands Out
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Fully Licensed
              </h3>
              <p className="text-sm text-muted-foreground">
                All vehicles meet legal requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Well Maintained
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular servicing & inspections
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Always Ready
              </h3>
              <p className="text-sm text-muted-foreground">
                24/7 availability for your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Professional Drivers
              </h3>
              <p className="text-sm text-muted-foreground">
                Courteous & experienced team
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Book Your Ride?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Choose from our premium fleet and experience the Cape Town Rides
            difference today.
          </p>
          <Link to="/book">
            <Button variant="hero" size="lg">
              Book Your Ride Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
  );
};

export default Fleet;
