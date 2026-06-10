import { motion } from "framer-motion";
import {
  ShieldCheck,
  CarFront,
  UserCheck,
  Navigation,
  Sparkles,
  BadgeCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Every journey is handled with care, professional standards, and reliable support from pickup to drop-off.",
  },
  {
    icon: CarFront,
    title: "Premium Fleet",
    description:
      "Clean, comfortable and well-maintained vehicles suited for airport transfers, tours, business travel and groups.",
  },
  {
    icon: UserCheck,
    title: "Professional Drivers",
    description:
      "Experienced, courteous drivers who understand punctuality, discretion and excellent customer service.",
  },
  {
    icon: Navigation,
    title: "Cape Town Expertise",
    description:
      "Local route knowledge helps us move efficiently across Cape Town, surrounding areas and popular destinations.",
  },
  {
    icon: Sparkles,
    title: "Comfortable Experience",
    description:
      "From private rides to group transfers, every trip is designed to feel smooth, relaxed and professionally managed.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Service",
    description:
      "A reliable transport partner for travellers, families, corporate clients and groups across Cape Town.",
  },
];

const WhyUs = () => {
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.09),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.07),transparent_34%)]" />

        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 section-padding container mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Why Choose Us
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight tracking-tight">
            The CTSC Travel{" "}
            <span className="text-accent relative inline-block">
              Difference
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full bg-accent/40"
              />
            </span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
            Experience premium transport built around safety, comfort,
            punctuality and professional service across Cape Town.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.62,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group"
            >
              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/80 backdrop-blur-xl p-7 transition-all duration-500 hover:border-accent/45 hover:shadow-2xl hover:shadow-accent/10">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/14 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
                </div>

                {/* Top shine */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                {/* Background index */}
                <div className="absolute -right-2 -bottom-5 text-[6.5rem] font-black leading-none text-foreground/[0.035] tracking-tighter select-none">
                  0{i + 1}
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <motion.div
                    whileHover={{ y: -3, rotate: -5, scale: 1.07 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                    }}
                    className="relative w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 group-hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <reason.icon
                      className="relative z-10 w-6 h-6 text-accent"
                      strokeWidth={1.75}
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                    {reason.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </div>

                {/* Subtle footer line */}
                <div className="relative z-10 mt-6 pt-5 border-t border-border/60">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                    <Star className="w-3.5 h-3.5 fill-accent/20" />
                    CTSC Standard
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
        className="relative z-10 mt-8 overflow-hidden border-y border-accent/20 bg-gradient-to-r from-accent/8 via-accent/14 to-accent/8"
      >
        {/* Background details */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, hsl(var(--accent)/0.12) 1px, transparent 1px), linear-gradient(0deg, hsl(var(--accent)/0.08) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />

          <motion.div
            initial={{ x: "-20%" }}
            whileInView={{ x: "20%" }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent"
          />

          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-accent/12" />
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-accent/12" />
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-accent/12" />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-accent/12" />
        </div>

        <div className="relative py-16 px-6 text-center max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Get Started Today
          </motion.p>

          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="text-2xl sm:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight"
          >
            Ready to experience premium Cape Town transport?
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Book a reliable ride with CTSC Travel for airport transfers, private
            travel, corporate transport, tours and group shuttle services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto gap-2">
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/fleet" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2 bg-background/50 backdrop-blur-sm"
              >
                View Fleet
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyUs;