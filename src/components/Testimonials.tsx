import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Quote,
  ExternalLink,
  BadgeCheck,
  MessageCircleHeart,
  ArrowRight,
  UsersRound,
  Route,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

const CountUpNumber = ({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;

        setHasAnimated(true);

        const duration = 1600;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easedProgress = 1 - Math.pow(1 - progress, 4);
          const currentValue = value * easedProgress;

          setDisplayValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        };

        requestAnimationFrame(animate);
      },
      { threshold: 0.45 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref}>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const GoogleIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

const testimonials = [
  {
    name: "Maneesha Sookenram",
    content:
      "Awesome as usual. Very reliable. Good vehicles. Drivers are very polite and helpful. Garth and Enrico were great. Last year also they did our transfer. This year we even rented a car from them. Special mention to Nikita who assisted us and helped with all our requests. Highly recommended.",
    rating: 5,
  },
  {
    name: "Ana Jovanovic",
    content:
      "We had a wonderful experience with this company. We loved our driver Mbombo who was a great guide, showed us Cape Town and took an extra step and went over and beyond! Thanks for everything, we will hire you again!",
    rating: 5,
  },
  {
    name: "Cloe Smith",
    content:
      "Fabulous service - great comms from Tracy and a superb driving experience from Enrico. Thank you!",
    rating: 5,
  },
  {
    name: "Edward Keown",
    content:
      "The pickup was precisely on time. The ride was smooth and we were on time for book-in. Can highly recommend this service! Can't wait for my next trip!",
    rating: 5,
  },
  {
    name: "Jason Bagley",
    content:
      "Garth was our driver for the afternoon and did a great job. Was in constant communication and on time for both collection and drop off.",
    rating: 5,
  },
  {
    name: "Ivan Kakolo",
    content:
      "Awesome service 😊👌, friendly drivers they are always in time and clean cars, our tour was just amazing.",
    rating: 5,
  },
];

const avatarColors = [
  "bg-accent/15 text-accent ring-accent/25",
  "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
];

const stats = [
  {
    value: 4.8,
    suffix: "★",
    label: "Average Rating",
    icon: Trophy,
    decimals: 1,
  },
  {
    value: 500,
    suffix: "+",
    label: "Happy Riders",
    icon: UsersRound,
    decimals: 0,
  },
  {
    value: 500,
    suffix: "+",
    label: "Trips Completed",
    icon: Route,
    decimals: 0,
  },
];

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) => {
  const colorClass = avatarColors[index % avatarColors.length];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative h-full group"
    >
      <div className="relative h-full min-h-[360px] sm:min-h-[390px] overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/85 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 flex flex-col">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-accent/14 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        {/* Decorative quote */}
        <Quote
          className="absolute -top-2 right-5 w-20 h-20 text-accent/[0.06] group-hover:text-accent/[0.12] transition-colors duration-500 rotate-180"
          strokeWidth={1}
        />

        {/* Review badge */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-accent text-accent drop-shadow-sm"
              />
            ))}
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>
        </div>

        {/* Content */}
        <p className="relative z-10 text-sm sm:text-[15px] text-muted-foreground leading-relaxed flex-grow">
          “{testimonial.content}”
        </p>

        {/* Author */}
        <div className="relative z-10 mt-6 pt-5 border-t border-border/60 flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-full ring-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 group-hover:ring-[3px] group-hover:scale-105",
              colorClass,
            )}
          >
            {getInitials(testimonial.name)}
          </div>

          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm truncate">
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              CTSC Travel Rider
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative section-padding bg-muted/30 overflow-hidden">
      {/* Premium background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.09),transparent_36%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.07),transparent_34%)]" />

        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="absolute -top-40 -right-40 w-[430px] h-[430px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[430px] h-[430px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase bg-accent/10 text-accent border border-accent/20 mb-5">
            <Star className="w-3 h-3 fill-accent" />
            Trusted by Travelers
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            What Our{" "}
            <span className="text-accent relative inline-block">
              Riders Say
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 right-0 h-0.5 origin-left rounded-full bg-accent/40"
              />
            </span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
            Real reviews from travelers who trust CTSC Travel for airport
            transfers, tours, private rides and reliable Cape Town transport.
          </p>
        </motion.div>

        {/* Carousel shell */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
          className="relative"
        >
          {/* Soft edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-muted/30 to-transparent hidden sm:block" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-muted/30 to-transparent hidden sm:block" />

          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={[
              Autoplay({
                delay: 3600,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4 py-2">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.name}
                  className={cn(
                    "pl-4",
                    isMobile ? "basis-[88%]" : "md:basis-1/2 lg:basis-1/3",
                  )}
                >
                  <TestimonialCard testimonial={testimonial} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
          className="mt-14 sm:mt-16"
        >
          <div className="relative max-w-4xl mx-auto overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl shadow-accent/5">
            {/* Premium glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
              <div className="absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.06),transparent_45%)]" />
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/70">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.55,
                    delay: 0.28 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative group text-center py-7 sm:py-8 px-5 transition-colors duration-300 hover:bg-accent/[0.04]"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl" />
                  </div>

                  <motion.div
                    whileHover={{ y: -3, scale: 1.06, rotate: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent group-hover:border-accent/45 group-hover:bg-accent/15 transition-all duration-300"
                  >
                    <stat.icon className="h-5 w-5" strokeWidth={1.8} />
                  </motion.div>

                  <p className="relative text-4xl sm:text-5xl font-black text-accent leading-none tracking-tight">
                    <CountUpNumber
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                    />
                  </p>

                  <p className="relative text-[11px] text-muted-foreground mt-3 font-bold tracking-[0.18em] uppercase">
                    {stat.label}
                  </p>

                  <div className="relative mx-auto mt-4 h-1 w-12 overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: 0.45 + i * 0.12,
                        ease: "easeOut",
                      }}
                      className="h-full w-full origin-left rounded-full bg-accent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Google review CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
          className="mt-10 flex justify-center"
        >
          <a
            href="https://g.page/r/CerTy7UbkEkkEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-border/80 bg-background/80 px-5 py-3 text-sm font-bold text-foreground shadow-xl shadow-accent/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/20 active:scale-[0.98]"
          >
            {/* Glow layer */}
            <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-accent/15 blur-2xl" />
              <span className="absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl" />
            </span>

            {/* Shine sweep */}
            <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />

            {/* Google icon */}
            <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
              <GoogleIcon className="h-5 w-5" />
            </span>

            <span className="relative z-10 flex flex-col items-start leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Enjoyed your ride?
              </span>
              <span className="text-sm font-black text-foreground">
                Review us on Google
              </span>
            </span>

            <span className="relative z-10 ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:translate-x-1">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </a>
        </motion.div>

        {/* Small trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <ArrowRight className="w-3.5 h-3.5 text-accent" />
          <span>Trusted transport experiences across Cape Town</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;