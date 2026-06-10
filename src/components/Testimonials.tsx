import { motion } from "framer-motion";
import {
  Star,
  Quote,
  ExternalLink,
  BadgeCheck,
  MessageCircleHeart,
  ArrowRight,
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
  { value: "4.8★", label: "Average Rating" },
  { value: "500+", label: "Happy Riders" },
  { value: "500+", label: "Trips Completed" },
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
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.62, delay: 0.2, ease: "easeOut" }}
          className="mt-14 sm:mt-16"
        >
          <div className="relative max-w-3xl mx-auto overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/80 backdrop-blur-xl shadow-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/70">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.28 + i * 0.08 }}
                  className="relative text-center py-6 px-5 transition-colors duration-300 hover:bg-accent/5 group"
                >
                  <p className="text-3xl sm:text-4xl font-black text-accent leading-none tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-bold tracking-[0.18em] uppercase">
                    {stat.label}
                  </p>
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
          className="mt-9 flex justify-center"
        >
          <a
            href="https://g.page/r/CerTy7UbkEkkEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-5 py-3 rounded-full text-sm font-bold bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-accent/15 hover:shadow-accent/25"
          >
            <MessageCircleHeart className="w-4 h-4" />
            Review us on Google
            <span className="w-7 h-7 rounded-full bg-background/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ExternalLink className="w-3.5 h-3.5" />
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