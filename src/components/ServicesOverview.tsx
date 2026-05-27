import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plane,
  Crown,
  ArrowRightLeft,
  ArrowRight,
  Building2,
  Briefcase,
  Sparkles,
} from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Reliable pickup and drop-off to and from Cape Town International Airport.",
    path: "/services/airport-transfers",
  },
  {
    icon: Crown,
    title: "Chauffeur Services",
    description:
      "Professional chauffeur at your disposal for business or leisure.",
    path: "/services/chauffeur",
  },
  {
    icon: ArrowRightLeft,
    title: "Point-to-Point",
    description:
      "Direct transfers between any two locations in the Cape Town area.",
    path: "/services/point-to-point",
  },
  {
    icon: Building2,
    title: "Employee Transportation",
    description:
      "Daily corporate commute solutions to keep your workforce on time.",
    path: "/services/employee-transportation",
  },
  {
    icon: Briefcase,
    title: "Staff Shuttle Service",
    description:
      "Shift-aligned group transport for teams of every size and schedule.",
    path: "/services/staff-shuttle",
  },
  {
    icon: Sparkles,
    title: "Custom Trip",
    description:
      "Tell us your unique travel needs and we'll tailor the perfect ride for you.",
    path: "/book",
    highlight: true,
  },
];

const ServicesOverview = () => {
  return (
    <section className="section-padding bg-secondary/50 overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mt-5 leading-tight">
            Premium Transport Solutions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base leading-relaxed">
            We offer a wide range of services to meet your transportation needs,
            from airport transfers to chauffeur services and point-to-point
            transfers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={service.path}
                className={`
                  flex flex-col h-full p-7 rounded-2xl bg-card border transition-all duration-300 group
                  ${service.highlight
                    ? "border-accent/40 bg-accent/[0.03] hover:border-accent/70 hover:shadow-xl hover:shadow-accent/10"
                    : "border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
                  }
                `}
              >
                {/* Top row: icon */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`
                    w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300
                    ${service.highlight ? "bg-accent/15 group-hover:bg-accent/25" : "bg-accent/10 group-hover:bg-accent/20"}
                  `}
                  >
                    <service.icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
                  </div>
                  {service.highlight && (
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
                      Custom
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Footer CTA */}
                <div className="mt-5 pt-4 border-t border-border/60">
                  <span className="inline-flex items-center text-xs font-semibold text-accent gap-1.5 group-hover:gap-2.5 transition-all duration-200">
                    Learn More
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;