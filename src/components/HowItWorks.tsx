import { motion } from "framer-motion";
import {
  MapPinned,
  CarFront,
  CreditCard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: MapPinned,
    title: "Create Your Route",
    description:
      "Enter your pickup, drop-off, travel date and time to view availability and trip details.",
  },
  {
    icon: CarFront,
    title: "Choose Your Vehicle",
    description:
      "Select the vehicle that best suits your journey, passenger count and travel style.",
  },
  {
    icon: CreditCard,
    title: "Confirm & Pay",
    description:
      "Add the passenger details, confirm your booking and complete secure payment with Yoco.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative section-padding bg-background overflow-hidden">
      {/* Premium background detail */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.08),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.06),transparent_30%)]" />

        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            How It Works
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight tracking-tight">
            Book in{" "}
            <span className="text-accent relative inline-block">
              3 Simple Steps
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
            Booking your ride with CTSC Travel is quick, simple and secure
            from route selection to confirmed transport.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Desktop animated connector line */}
          <div className="hidden md:block absolute top-[4.65rem] left-[16.5%] right-[16.5%] h-px bg-border/70 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                delay: 0.25,
              }}
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 42, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative group"
              >
                <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-7 text-center transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
                    <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
                  </div>

                  {/* Top shine */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                  {/* Big background step number */}
                  <div className="absolute -right-3 -bottom-5 text-[7rem] font-black leading-none text-foreground/[0.035] tracking-tighter select-none">
                    0{i + 1}
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 flex justify-center mb-6">
                    <motion.div
                      whileHover={{ y: -3, rotate: -4, scale: 1.06 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                      }}
                      className="relative"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-accent/15 blur-md scale-110 group-hover:scale-125 transition-transform duration-500" />

                      <div className="relative w-[4.75rem] h-[4.75rem] rounded-2xl bg-background border border-accent/25 flex items-center justify-center shadow-sm group-hover:border-accent/55 group-hover:bg-accent/10 transition-all duration-300">
                        <step.icon
                          className="w-7 h-7 text-accent"
                          strokeWidth={1.7}
                        />
                      </div>

                      <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center shadow-lg shadow-accent/20 border border-background">
                        {i + 1}
                      </span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* Mini footer */}
                  <div className="relative z-10 mt-6 pt-5 border-t border-border/60">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Step {i + 1} of 3
                    </div>
                  </div>
                </div>

                {/* Mobile connector arrow */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-4">
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 }}
                      className="w-9 h-9 rounded-full border border-accent/20 bg-accent/8 flex items-center justify-center"
                    >
                      <ArrowRight className="w-4 h-4 text-accent rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;