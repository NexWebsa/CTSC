import { motion } from "framer-motion";
import { Shield, Zap, Users, MapPin, Leaf, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "All drivers are thoroughly vetted and trained. Your security is our top priority with real-time tracking and 24/7 support.",
  },
  {
    icon: Zap,
    title: "Professional Fleet",
    description:
      "Premium vehicles maintained to the highest standards. Clean, comfortable, and equipped with modern amenities for every journey.",
  },
  {
    icon: Users,
    title: "Expert Drivers",
    description:
      "Courteous, experienced drivers who know Cape Town thoroughly. Professional service with a personal touch every time.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "Deep knowledge of Cape Town's roads and neighborhoods. We navigate the city efficiently to get you where you need to be.",
  },
  {
    icon: Leaf,
    title: "Eco-Conscious",
    description:
      "Committed to sustainable transport with modern vehicles offering better fuel efficiency and reduced emissions.",
  },
  {
    icon: Award,
    title: "Trusted & Certified",
    description:
      "Licensed, insured, and recognized for excellence. Years of satisfied customers across Cape Town trusting us with their journeys.",
  },
];

const WhyUs = () => {
  return (
    <section className="bg-background overflow-hidden">
      <div className="section-padding container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight">
            The Cape Town Rides Difference
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
            Experience premium transportation with safety, reliability, and
            professionalism at every turn.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="relative p-7 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group overflow-hidden"
            >
              {/* Subtle corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] bg-accent/[0.04] group-hover:bg-accent/[0.07] transition-colors duration-500 pointer-events-none" />

              {/* Icon */}
              <div className="relative w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors duration-300">
                <reason.icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-foreground mb-2.5 tracking-tight">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full-width CTA banner — upgraded */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 relative overflow-hidden border-y border-accent/20 bg-gradient-to-r from-accent/8 via-accent/12 to-accent/8"
      >
        {/* Decorative circles */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent/10 pointer-events-none" />
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-accent/10 pointer-events-none" />
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent/10 pointer-events-none" />
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-accent/10 pointer-events-none" />

        <div className="relative py-14 px-6 text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            Get Started Today
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            Ready to Experience the Difference?
          </h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed mb-7">
            Join thousands of satisfied travelers who trust Cape Town Rides for
            their transportation needs.
          </p>
          <Link to="/book" className="hidden sm:inline-block">
            <Button variant="hero" size="sm">
              Book Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyUs;