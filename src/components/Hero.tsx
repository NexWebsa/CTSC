import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Clock3,
  ChevronDown,
} from "lucide-react";
import heroImage from "@/assets/hero-cape-town.jpg";
import { useRef } from "react";

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const headingClass =
    "block text-[clamp(2.85rem,12vw,4.45rem)] sm:text-[clamp(3.15rem,6.8vw,5.8rem)] font-black leading-[0.9] tracking-tight";

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#0A0A08]"
    >
      {/* ── Grid overlay lines ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Mobile premium glow accents */}
      <div className="lg:hidden absolute inset-0 z-[9] pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#F2A51F]/15 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.35 }}
          className="absolute bottom-10 -left-28 h-80 w-80 rounded-full bg-[#F2A51F]/10 blur-3xl"
        />
      </div>

      {/* ── Split layout ── */}
      <div className="relative z-20 min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[40fr_60fr]">
        {/* ── Mobile background image ── */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <motion.img
            src={heroImage}
            alt="Cape Town coastline"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A08]/80 via-[#0A0A08]/78 to-[#0A0A08]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A08]/90 via-transparent to-[#0A0A08]/80" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0A08] via-[#0A0A08]/85 to-transparent" />
        </div>

        {/* ── LEFT: Text panel ── */}
        <div className="relative z-10 flex flex-col justify-center lg:justify-between pb-0 pt-24 sm:pt-28 lg:pt-31 px-5 sm:px-8 lg:px-16 xl:px-20 min-h-screen lg:min-h-0 items-center lg:items-stretch text-center lg:text-left">
          {/* Vertical rule - desktop only */}
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="hidden lg:block absolute left-0 top-24 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/40 to-transparent"
          />

          {/* Location tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center lg:justify-start gap-2 mb-5 lg:mb-6"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F2A51F]" />
            <span
              className="text-[11px] tracking-[0.25em] uppercase text-white/50"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Cape Town · South Africa
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 style={{ y: textY }} className="mb-4 sm:mb-4 w-full">
            <div className="overflow-hidden mb-1">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`${headingClass} text-white`}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                DRIVEN BY
              </motion.span>
            </div>

            <div className="overflow-hidden mb-1 lg:ml-[0.08em]">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.62,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={headingClass}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "0.02em",
                  WebkitTextStroke: "1.5px #F2A51F",
                  color: "transparent",
                }}
              >
                EXCELLENCE.
              </motion.span>
            </div>

            <div className="overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.74,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`${headingClass} text-white`}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                TRUSTED BY TRAVELERS.
              </motion.span>
            </div>
          </motion.h1>

          {/* Descriptor - mobile */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="lg:hidden max-w-[18rem] text-[11px] leading-relaxed tracking-[0.28em] uppercase text-[#F2A51F]/85 mb-5"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Airport Transfers · Shuttle Hire · Private Transport
          </motion.p>

          {/* Mobile trust chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.08 }}
            className="lg:hidden grid grid-cols-2 gap-2 w-full max-w-sm mb-6"
          >
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-[#F2A51F]" />
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-white/70"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Safe Rides
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 backdrop-blur-xl">
              <Clock3 className="h-4 w-4 text-[#F2A51F]" />
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-white/70"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                24/7 Ready
              </span>
            </div>
          </motion.div>

          {/* Descriptor - desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="hidden lg:flex items-start gap-5 mb-5 max-w-md"
          >
            <div className="w-8 h-px bg-[#F2A51F] mt-3 shrink-0" />
            <p
              className="text-[15px] leading-relaxed text-white/50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Premium airport transfers, shuttle hire, and private transport
              across Cape Town.
            </p>
          </motion.div>

          {/* Desktop trust chips only */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.18 }}
            className="hidden lg:flex items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-[#F2A51F]" />
              <span
                className="text-[10px] uppercase tracking-[0.14em] text-white/60"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Safe Rides
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
              <Clock3 className="h-4 w-4 text-[#F2A51F]" />
              <span
                className="text-[10px] uppercase tracking-[0.14em] text-white/60"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                24/7 Ready
              </span>
            </div>
          </motion.div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-3 w-full sm:w-auto"
          >
            <Link to="/book" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#F2A51F] text-[#0A0A08] text-sm font-semibold tracking-widest uppercase overflow-hidden transition-all duration-300 hover:pr-10 shadow-2xl shadow-[#F2A51F]/15"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.15em",
                }}
              >
                <span className="relative z-10 lg:hidden">Book a Ride</span>
                <span className="relative z-10 hidden lg:inline">
                  Reserve Now
                </span>
                <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </Link>

            <Link to="/fleet" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 border border-white/15 bg-white/[0.03] backdrop-blur-xl text-white/70 text-sm tracking-widest uppercase hover:border-white/30 hover:text-white/90 transition-all duration-300"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.15em",
                }}
              >
                View Fleet
              </button>
            </Link>
          </motion.div>

          {/* Reassurance line */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.32 }}
            className="mb-6 text-[10px] uppercase tracking-[0.18em] text-white/35"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            No account needed · Secure payment · Instant quote
          </motion.p>

          {/* Mobile mini stats */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.38 }}
            className="lg:hidden max-[700px]:hidden grid grid-cols-3 gap-px w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl"
          >
            {[
              { value: "4.8★", label: "Rating" },
              { value: "500+", label: "Riders" },
              { value: "24/7", label: "Service" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0A0A08]/45 px-3 py-3">
                <p
                  className="text-lg font-black leading-none text-[#F2A51F]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p
                  className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/45"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Image panel ── */}
        <div className="relative hidden lg:block overflow-hidden">
          {/* Diagonal clip from left */}
          <div
            className="absolute inset-0 z-10"
            style={{
              clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
          >
            <motion.div style={{ y: imageY }} className="absolute inset-0 scale-110">
              <img
                src={heroImage}
                alt="Cape Town coastline with Table Mountain"
                className="w-full h-full object-cover"
                width={1200}
                height={1600}
              />

              {/* Dark vignette */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0A0A08]/20 to-[#0A0A08]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A08]/80 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* Vertical label on far right edge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20"
          >
            <span
              className="text-[9px] tracking-[0.4em] uppercase text-white/20 [writing-mode:vertical-rl]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Premium · Private · Punctual
            </span>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.75 }}
        className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 pointer-events-none"
      >
        <span
          className="text-[9px] uppercase tracking-[0.28em] text-white/30"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <ChevronDown className="h-4 w-4 text-[#F2A51F]/80" />
        </motion.div>
      </motion.div>

      {/* ── Load fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </section>
  );
};

export default Hero;