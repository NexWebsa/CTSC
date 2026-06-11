import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PlaneTakeoff,
  CarFront,
  Route,
  UsersRound,
  BusFront,
  MapPinned,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: PlaneTakeoff,
    title: "Airport Transfers",
    description:
      "Reliable pickup and drop-off to and from Cape Town International Airport.",
    path: "/services/airport-transfers",
  },
  {
    icon: CarFront,
    title: "Chauffeur Services",
    description:
      "Professional chauffeur at your disposal for business or leisure.",
    path: "/services/chauffeur",
  },
  {
    icon: Route,
    title: "Point-to-Point",
    description:
      "Direct transfers between any two locations in the Cape Town area.",
    path: "/services/point-to-point",
  },
  {
    icon: UsersRound,
    title: "Employee Transportation",
    description:
      "Daily corporate commute solutions to keep your workforce on time.",
    path: "/services/employee-transportation",
  },
  {
    icon: BusFront,
    title: "Staff Shuttle Service",
    description:
      "Shift-aligned group transport for teams of every size and schedule.",
    path: "/services/staff-shuttle",
  },
  {
    icon: MapPinned,
    title: "Custom Trip",
    description:
      "Tell us your unique travel needs and we'll tailor the perfect ride for you.",
    path: "/book",
    highlight: true,
  },
];

const ServicesOverview = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const calculateScrollDistance = () => {
      if (!trackRef.current) return;

      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;

      /**
       * Stops horizontal movement when the last card is fully visible.
       */
      const distance = Math.max(trackWidth - viewportWidth, 0);

      setScrollDistance(distance);
    };

    calculateScrollDistance();

    window.addEventListener("resize", calculateScrollDistance);

    return () => {
      window.removeEventListener("resize", calculateScrollDistance);
    };
  }, []);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.9,
  });

  const x = useTransform(smoothProgress, [0, 1], [0, -scrollDistance]);
  const progressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  const topGlowY = useTransform(smoothProgress, [0, 1], ["0%", "18%"]);
  const bottomGlowY = useTransform(smoothProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[380vh] bg-secondary/50 overflow-visible"
    >
      {/* Sticky horizontal experience */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background details */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.12),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.08),transparent_35%)]" />

          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <motion.div
            style={{ y: topGlowY }}
            className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl"
          />

          <motion.div
            style={{ y: bottomGlowY }}
            className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full">
          {/* Header */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-3">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-3xl mx-auto mb-10 sm:mb-14 text-center"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent bg-accent/8 border border-accent/20 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Our Services
              </span>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-5 leading-tight tracking-tight">
                Premium Transport{" "}
                <span className="text-accent">Solutions</span>
              </h2>

              <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-base sm:text-lg leading-relaxed">
                Scroll through our core travel services across Cape Town.
              </p>
            </motion.div>
          </div>

          {/* Horizontal cards */}
          <div className="relative">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-5 sm:gap-7 pl-4 sm:pl-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-4 sm:pr-6 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] will-change-transform"
            >
              {services.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="shrink-0 w-[82vw] sm:w-[430px] lg:w-[470px]"
                >
                  <Link
                    to={service.path}
                    className={`
                      relative flex h-[360px] sm:h-[390px] flex-col overflow-hidden rounded-[2rem] border p-7 sm:p-8 group
                      backdrop-blur-xl transition-all duration-500
                      ${
                        service.highlight
                          ? "border-accent/50 bg-accent/[0.06] shadow-2xl shadow-accent/10 hover:border-accent/80"
                          : "border-border/80 bg-card/80 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10"
                      }
                    `}
                  >
                    {/* Card glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
                      <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
                    </div>

                    {/* Top shine */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                    {/* Large background number */}
                    <div className="absolute right-6 bottom-4 text-[8rem] sm:text-[9rem] font-black leading-none text-foreground/[0.035] tracking-tighter select-none">
                      0{i + 1}
                    </div>

                    <div className="relative z-10 flex items-start justify-between mb-8">
                      <motion.div
                        whileHover={{ rotate: -6, scale: 1.08 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 16,
                        }}
                        className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500
                          ${
                            service.highlight
                              ? "bg-accent/20 border-accent/30"
                              : "bg-accent/10 border-accent/20 group-hover:bg-accent/20"
                          }
                        `}
                      >
                        <service.icon
                          className="w-7 h-7 text-accent"
                          strokeWidth={1.7}
                        />
                      </motion.div>

                      {service.highlight ? (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground border border-border/70 bg-background/40 px-3 py-1.5 rounded-full">
                          Service
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 flex-1">
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-4">
                        {service.title}
                      </h3>

                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
                        {service.description}
                      </p>
                    </div>

                    <div className="relative z-10 mt-8 pt-5 border-t border-border/60">
                      <span className="inline-flex items-center text-sm font-semibold text-accent gap-2 group-hover:gap-4 transition-all duration-300">
                        Learn More
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Final CTA card */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.65,
                  delay: services.length * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="shrink-0 w-[82vw] sm:w-[430px] lg:w-[470px]"
              >
                <Link
                  to="/book"
                  className="relative flex h-[360px] sm:h-[390px] flex-col justify-between overflow-hidden rounded-[2rem] border border-accent/40 bg-foreground text-background p-7 sm:p-8 group shadow-2xl shadow-accent/10"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.28),transparent_38%)]" />
                  <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                      Ready When You Are
                    </span>

                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mt-6 leading-tight">
                      Book your next ride with CTSC Travel.
                    </h3>

                    <p className="text-background/70 mt-4 text-sm sm:text-base leading-relaxed">
                      Airport transfers, private trips, tours, corporate travel,
                      and custom transport, all in one place.
                    </p>
                  </div>

                  <div className="relative z-10 inline-flex items-center gap-3 text-sm font-bold text-accent">
                    Start Booking
                    <span className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="flex items-center gap-4 max-w-xl mx-auto">
              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Scroll
              </span>

              <div className="relative h-1 flex-1 rounded-full bg-border overflow-hidden">
                <motion.div
                  style={{ scaleX: progressScale }}
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                />
              </div>

              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Explore
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;