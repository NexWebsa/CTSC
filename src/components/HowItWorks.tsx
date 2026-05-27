import { motion } from "framer-motion";
import { MapPin, Car, Smile } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Create Your Route",
    description:
      "Enter your pickup and dropoff locations, or book by the hour for flexible travel.",
  },
  {
    icon: Car,
    title: "Choose Your Vehicle",
    description:
      "Browse our premium fleet and select the perfect vehicle for your journey.",
  },
  {
    icon: Smile,
    title: "Enjoy The Journey",
    description:
      "Sit back and relax while our professional drivers get you there safely.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight">
            Book in 3 Simple Steps
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
            Booking your ride with Cape Town Rides is quick and easy. Just
            follow these simple steps to get on the road in no time.
          </p>
        </motion.div>

        {/* Connector line behind the cards */}
        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal dashed connector */}
          <div
            className="hidden md:block absolute top-[2.25rem] left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, hsl(var(--accent)/0.35) 0, hsl(var(--accent)/0.35) 8px, transparent 8px, transparent 18px)",
            }}
          />

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Icon + step number bubble */}
                <div className="relative mb-7 z-10">
                  {/* Outer glow ring on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-accent/10 scale-100 group-hover:scale-110 transition-transform duration-500 blur-md" />
                  <div className="relative w-[4.5rem] h-[4.5rem] rounded-2xl bg-background border border-accent/25 flex items-center justify-center shadow-sm group-hover:border-accent/50 group-hover:shadow-accent/10 group-hover:shadow-lg transition-all duration-300">
                    <step.icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                  </div>
                  {/* Step number — floats at top-right */}
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-2">
                  <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;