import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

// vehicles
import bmw from "@/assets/bmw.jpg";
import suzuki from "@/assets/suzuki.jpg";
import mercvan from "@/assets/merc.jpg";
import coaster from "@/assets/coaster.jpg";
import quantum from "@/assets/quantum.jpg";
import v6 from "@/assets/v6.jpeg";
import v7 from "@/assets/v7.jpeg";
import v8 from "@/assets/v8.jpeg";
import v9 from "@/assets/v9.jpeg";
import v10 from "@/assets/v10.jpeg";

// locations
import loc1 from "@/assets/loc1.jpeg";
import loc2 from "@/assets/loc2.jpeg";
import loc3 from "@/assets/loc3.jpeg";
import loc4 from "@/assets/loc4.jpeg";
import loc5 from "@/assets/loc5.jpeg";
import loc6 from "@/assets/loc6.jpeg";
import loc7 from "@/assets/loc7.jpeg";
import loc8 from "@/assets/loc8.jpeg";
import loc9 from "@/assets/loc9.jpeg";
import loc10 from "@/assets/loc10.jpeg";

// experiences
import ex1 from "@/assets/ex1.jpeg";
import ex2 from "@/assets/ex2.jpeg";
import ex3 from "@/assets/ex3.jpeg";
import ex4 from "@/assets/ex4.jpeg";
import ex5 from "@/assets/ex5.jpeg";
import ex6 from "@/assets/ex6.jpeg";
import ex7 from "@/assets/ex7.jpeg";
import ex8 from "@/assets/ex8.jpeg";
import ex9 from "@/assets/ex9.jpeg";
import ex10 from "@/assets/ex10.jpeg";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────
// Rules:
//  - Every id is unique (no duplicates)
//  - 10 vehicles, 10 experiences, 10 locations = 30 total
//  - aspect "wide" = col-span-2 row-span-1 | "tall" = col-span-1 row-span-2 | "square" = col-span-1 row-span-1
const ALL_ITEMS = [
  // ── Vehicles (10) ───────────────────────────────────────────────────────
  { id: 1, category: "vehicles", title: "BMW 530D", aspect: "wide", image: bmw },
  { id: 2, category: "vehicles", title: "Suzuki Ertiga", aspect: "square", image: suzuki },
  { id: 3, category: "vehicles", title: "Mercedes Viano", aspect: "square", image: mercvan },
  { id: 4, category: "vehicles", title: "Toyota Quantum", aspect: "tall", image: quantum },
  { id: 5, category: "vehicles", title: "Toyota Coaster Bus", aspect: "square", image: coaster },
  { id: 6, category: "vehicles", title: "v6", aspect: "wide", image: v6 },
  { id: 7, category: "vehicles", title: "v7", aspect: "square", image: v7 },
  { id: 8, category: "vehicles", title: "v8", aspect: "tall", image: v8 },
  { id: 9, category: "vehicles", title: "v9", aspect: "square", image: v9 },
  { id: 10, category: "vehicles", title: "v10", aspect: "wide", image: v10 },
  // ── Experiences (10) ────────────────────────────────────────────────────
  { id: 11, category: "experiences", title: "ex1", aspect: "tall", image: ex1 },
  { id: 12, category: "experiences", title: "ex2", aspect: "square", image: ex2 },
  { id: 13, category: "experiences", title: "ex3", aspect: "wide", image: ex3 },
  { id: 14, category: "experiences", title: "ex4", aspect: "wide", image: ex4 },
  { id: 15, category: "experiences", title: "ex5", aspect: "square", image: ex5 },
  { id: 16, category: "experiences", title: "ex6", aspect: "tall", image: ex6 },
  { id: 17, category: "experiences", title: "Corporate Event Transfer", aspect: "wide", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=700&fit=crop&auto=format" },
  { id: 18, category: "experiences", title: "Wedding Chauffeur", aspect: "square", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=800&fit=crop&auto=format" },
  { id: 19, category: "experiences", title: "Sunset Wine Tour", aspect: "square", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=800&fit=crop&auto=format" },
  { id: 20, category: "experiences", title: "VIP Airport Meet & Greet", aspect: "tall", image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=700&h=1050&fit=crop&auto=format" },
  // ── Locations (10) ──────────────────────────────────────────────────────
  { id: 21, category: "locations", title: "Cape Town", aspect: "wide", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=700&fit=crop&auto=format" },
  { id: 22, category: "locations", title: "loc1", aspect: "tall", image: loc1 },
  { id: 23, category: "locations", title: "loc2", aspect: "square", image: loc2 },
  { id: 24, category: "locations", title: "loc3", aspect: "wide", image: loc3 },
  { id: 25, category: "locations", title: "loc4", aspect: "square", image: loc4 },
  { id: 26, category: "locations", title: "loc5", aspect: "tall", image: loc5 },
  { id: 27, category: "locations", title: "loc6", aspect: "wide", image: loc6 },
  { id: 28, category: "locations", title: "loc7", aspect: "square", image: loc7 },
  { id: 29, category: "locations", title: "loc8", aspect: "square", image: loc9 },
  { id: 30, category: "locations", title: "loc9", aspect: "wide", image: loc8 },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Experiences", value: "experiences" },
  { label: "Locations", value: "locations" },
];

/**
 * Returns Tailwind grid-span classes.
 *
 * IMPORTANT: On small screens (< md) the grid is 2 cols.
 * A "wide" card (col-span-2) is fine on 2-col grids — it fills the row.
 * A "tall" card (row-span-2) is fine on any column count.
 * We never exceed the available column count so no overlap occurs.
 */
function gridClass(aspect: string) {
  switch (aspect) {
    case "wide": return "col-span-2 row-span-1";
    case "tall": return "col-span-1 row-span-2";
    default: return "col-span-1 row-span-1"; // square
  }
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0 w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse" style={{ background: "#e8e3db" }} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}

export default function Gallery() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [lightbox, setLightbox] = useState<(typeof ALL_ITEMS)[0] | null>(null);

  const filtered = activeFilter === "all"
    ? ALL_ITEMS
    : ALL_ITEMS.filter((i) => i.category === activeFilter);

  // ── Hero entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(heroTitleRef.current, { y: 70, opacity: 0, duration: 1.1 })
      .from(heroSubRef.current, { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(heroLineRef.current, { scaleX: 0, opacity: 0, transformOrigin: "left center", duration: 0.9 }, "-=0.5");
    return () => { tl.kill(); };
  }, []);

  // ── CTA scroll reveal ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!ctaRef.current) return;
    const anim = gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
    return () => { anim.kill(); };
  }, []);


  useEffect(() => {
    if (!gridRef.current) return;

    // Kill any stale gallery-card triggers from previous filter renders
    ScrollTrigger.getAll()
      .filter((t) => t.vars.id === "gallery-card")
      .forEach((t) => t.kill());

    const cards = gridRef.current.querySelectorAll<HTMLElement>(".gallery-card");

    // Reset to invisible — Framer handles the enter animation itself via
    // AnimatePresence, so we only do GSAP scroll-reveal for cards below the fold.
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.97 });

    // Longer timeout so Framer's layout animation and AnimatePresence settle
    // before we measure positions with ScrollTrigger.
    const timeout = setTimeout(() => {
      if (!gridRef.current) return;

      const freshCards = gridRef.current.querySelectorAll<HTMLElement>(".gallery-card");

      freshCards.forEach((card, i) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
          delay: (i % 5) * 0.06,
          scrollTrigger: {
            id: "gallery-card",
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        });
      });

      ScrollTrigger.refresh();
    }, 120); // slightly longer settle window

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll()
        .filter((t) => t.vars.id === "gallery-card")
        .forEach((t) => t.kill());
    };
  }, [activeFilter]);

  return (
    <div className="min-h-screen" style={{ background: "#FCFAF8" }}>
      <Seo
        title="Gallery | CTSC Travel Cape Town Shuttle Fleet & Trips"
        description="Photo gallery of the CTSC Travel fleet, drivers and trips around Cape Town — airport transfers, tours and corporate shuttles in action."
        path="/gallery"
      />
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 pt-32 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,159,10,0.11) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,159,10,0.07) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #c4b89a 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.18,
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="text-sm font-bold tracking-[0.35em] uppercase mb-5" style={{ color: "#F59F0A" }}>
            Cape Town's Finest
          </p>

          <h1
            ref={heroTitleRef}
            className="font-black tracking-tighter mb-6"
            style={{
              color: "#0A0A08",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(4rem, 12vw, 9rem)",
              lineHeight: 0.92,
            }}
          >
            Our{" "}
            <span style={{ color: "#F59F0A" }}>Gallery</span>
          </h1>

          <p
            ref={heroSubRef}
            className="text-lg md:text-xl max-w-xl mx-auto mb-10"
            style={{ color: "#6b6b60", lineHeight: 1.75 }}
          >
            A curated visual journey through premium vehicles, iconic Cape Town routes, and experiences crafted for the discerning traveller.
          </p>

          <div
            ref={heroLineRef}
            className="h-px w-28 mx-auto"
            style={{ background: "linear-gradient(90deg, #F59F0A 0%, transparent 100%)" }}
          />
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "#b0aa9e" }}
        >
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ══ FILTERS ════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {FILTERS.map((f) => {
            const active = activeFilter === f.value;
            const count = f.value === "all"
              ? ALL_ITEMS.length
              : ALL_ITEMS.filter((i) => i.category === f.value).length;
            return (
              <motion.button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200"
                style={
                  active
                    ? { background: "#0A0A08", color: "#FCFAF8", boxShadow: "0 4px 16px rgba(10,10,8,0.18)" }
                    : { background: "transparent", color: "#7a7a70", border: "1px solid #d0cbc2" }
                }
              >
                {f.label}
                {active && (
                  <span
                    className="ml-2 text-xs rounded-full px-2 py-0.5"
                    style={{ background: "#F59F0A", color: "#0A0A08" }}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ══ GALLERY GRID ═══════════════════════════════════════════════════════ */}
      {/*
        OVERLAP FIX NOTES:
        1. `grid-auto-rows` is set via inline style so the value is stable and
           not recomputed on filter changes.
        2. `overflow-hidden` on the grid prevents tall/wide cards from visually
           bleeding outside their allocated cells.
        3. We use `min-h-0` on each card so grid row sizing is respected.
        4. On mobile (2 cols) "wide" cards span both columns correctly because
           the grid only has 2 cols — col-span-2 fills the row cleanly.
        5. AnimatePresence `mode="popLayout"` handles exit animations without
           causing layout shifts that push other cards out of their cells.
      */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-7xl">
          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            style={{ gridAutoRows: "260px" }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`gallery-card group relative overflow-hidden rounded-2xl cursor-pointer min-h-0 ${gridClass(item.aspect)}`}
                  onClick={() => setLightbox(item)}
                >
                  {/* Image with zoom-on-hover */}
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <GalleryImage src={item.image} alt={item.title} />
                  </motion.div>

                  {/* Category badge — visible on hover */}
                  <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(252,250,248,0.9)", color: "#5a5a52" }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Gold corner flash — on hover */}
                  <div
                    className="absolute top-0 right-0 z-20 transition-all duration-500 w-0 h-0 group-hover:w-14 group-hover:h-14"
                    style={{
                      background: "linear-gradient(225deg, rgba(245,159,10,0.75) 0%, transparent 65%)",
                      borderTopRightRadius: "1rem",
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <p className="text-lg" style={{ color: "#aaa9a0" }}>
                No items found
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══ STATS STRIP ═══════════════════════════════════════════════════════ */}
      <section
        className="py-16 px-4"
        style={{ borderTop: "1px solid #e4dfd7", borderBottom: "1px solid #e4dfd7" }}
      >
        <div className="container mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          {[
            { num: "500+", label: "Journeys completed" },
            { num: "4.8★", label: "Average rating" },
            { num: "24/7", label: "Concierge support" },
          ].map((s) => (
            <div key={s.num}>
              <p
                className="text-3xl md:text-4xl font-black mb-1"
                style={{
                  color: "#0A0A08",
                  fontFamily: "'Georgia','Times New Roman',serif",
                }}
              >
                {s.num}
              </p>
              <p className="text-sm" style={{ color: "#8a8a80" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div
          className="absolute inset-6 md:inset-10 rounded-3xl"
          style={{
            background:
              "linear-gradient(to right, rgba(245,159,10,0.1) 0%, rgba(245,159,10,0.15) 50%, rgba(245,159,10,0.1) 100%)",
          }}
        />

        <div
          ref={ctaRef}
          className="relative z-10 container mx-auto text-center max-w-2xl"
          style={{ opacity: 0 }}
        >
          <p
            className="text-xs font-bold tracking-[0.35em] uppercase mb-4"
            style={{ color: "#F59F0A" }}
          >
            Ready to ride?
          </p>
          <h2
            className="text-4xl md:text-5xl font-black mb-5 tracking-tight"
            style={{
              color: "#0A0A08",
              fontFamily: "'Georgia','Times New Roman',serif",
            }}
          >
            Book your perfect journey today
          </h2>
          <p
            className="mb-10 text-base"
            style={{ color: "rgba(10,10,8,0.65)", lineHeight: 1.7 }}
          >
            From airport transfers to full-day winelands excursions, we have the perfect vehicle and experience for every occasion.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/fleet" className="hidden sm:inline-block mt-6">
              <Button
                className="font-bold px-10 py-6 rounded-full text-base"
                style={{
                  background: "#F59F0A",
                  color: "#0A0A08",
                  boxShadow: "0 8px 32px rgba(245,159,10,0.45)",
                }}
              >
                Explore Our Fleet →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ══ LIGHTBOX ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12"
            style={{ background: "rgba(10,10,8,0.93)", backdropFilter: "blur(10px)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              key="lightbox-modal"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative max-w-5xl w-full rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.image.replace(/w=\d+&h=\d+/, "w=1600&h=1000")}
                alt={lightbox.title}
                className="w-full object-cover"
                style={{ maxHeight: "82vh" }}
              />

              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-opacity hover:opacity-80"
                style={{ background: "rgba(10,10,8,0.7)" }}
                onClick={() => setLightbox(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}