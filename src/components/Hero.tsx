import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MapPin } from "lucide-react";
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

      {/* ── Split layout ── */}
      <div className="relative z-20 min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[40fr_60fr]">

        {/* ── Mobile background image ── */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <img
            src={heroImage}
            alt="Cape Town coastline"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A08] via-[#0A0A08]/80 to-[#0A0A08]" />
        </div>

        {/* ── LEFT: Text panel ── */}
        <div className="relative z-10 flex flex-col justify-center lg:justify-between pb-0 pt-24 sm:pt-28 lg:pt-32 px-5 sm:px-8 lg:px-16 xl:px-20 min-h-screen lg:min-h-0 items-center lg:items-stretch text-center lg:text-left">

          {/* Vertical rule - desktop only */}
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute left-0 top-24 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/40 to-transparent"
          />

          {/* Location tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center lg:justify-start gap-2 mb-6 lg:mb-10"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F2A51F]" />
            <span
              className="text-[11px] tracking-[0.25em] uppercase text-white/50"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Cape Town · South Africa
            </span>
          </motion.div>

          {/* Giant display headline */}
          <motion.div style={{ y: textY }} className="mb-6 sm:mb-8 w-full">
            <div className="overflow-hidden mb-1">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.5rem,15vw,5rem)] sm:text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-tight text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
              >
                YOUR
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-1 lg:ml-[0.08em]">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.5rem,15vw,5rem)] sm:text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-tight"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "0.02em",
                  WebkitTextStroke: "1.5px #F2A51F",
                  color: "transparent",
                }}
              >
                JOURNEY,
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.74, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.5rem,15vw,5rem)] sm:text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-tight text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
              >
                OUR CARE.
              </motion.h1>
            </div>
          </motion.div>

          {/* Descriptor - mobile: short tagline only */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="lg:hidden text-sm tracking-[0.3em] uppercase text-[#F2A51F]/80 mb-8"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Punctual · Discreet · Effortless
          </motion.p>

          {/* Descriptor - desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="hidden lg:flex items-start gap-5 mb-10 max-w-md"
          >
            <div className="w-8 h-px bg-[#F2A51F] mt-3 shrink-0" />
            <p
              className="text-[15px] leading-relaxed text-white/50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Premium airport transfers, chauffeur services, and
              point-to-point transport across Cape Town.
              Punctual. Discreet. Effortless.
            </p>
          </motion.div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto"
          >
            <Link to="/book" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#F2A51F] text-[#0A0A08] text-sm font-semibold tracking-widest uppercase overflow-hidden transition-all duration-300 hover:pr-10"
                style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}
              >
                <span className="relative z-10">Reserve Now</span>
                <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </Link>

            <Link to="/fleet" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 border border-white/15 text-white/60 text-sm tracking-widest uppercase hover:border-white/30 hover:text-white/90 transition-all duration-300"
                style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}
              >
                Our Fleet
              </button>
            </Link>
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

      {/* ── Load fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
      `}</style>
    </section>
  );
};

export default Hero;