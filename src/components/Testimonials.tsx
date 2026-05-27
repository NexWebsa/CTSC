import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
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

// Soft palette for avatar backgrounds — cycles through a few accent-adjacent hues
const avatarColors = [
  "bg-accent/15 text-accent ring-accent/20",
  "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
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
    <div className="relative p-6 sm:p-7 rounded-2xl bg-card border border-border hover:border-accent/25 transition-all duration-500 shadow-sm hover:shadow-lg h-full flex flex-col group overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Large decorative quote mark */}
      <Quote
        className="absolute -top-1 right-5 w-16 h-16 text-accent/5 group-hover:text-accent/10 transition-colors duration-500 rotate-180"
        strokeWidth={1}
      />

      {/* Stars */}
      <div className="flex gap-0.5 mb-5">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
        ))}
      </div>

      {/* Content */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-grow relative z-10">
        "{testimonial.content}"
      </p>

      {/* Divider */}
      <div className="mt-5 pt-5 border-t border-border/60 flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full ring-2 flex items-center justify-center font-semibold text-xs shrink-0 transition-all duration-300 group-hover:ring-[3px]",
            colorClass
          )}
        >
          {getInitials(testimonial.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {testimonial.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Verified Rider</p>
        </div>
      </div>
    </div>
  );
};

const stats = [
  { value: "4.8★", label: "Average Rating" },
  { value: "200+", label: "Happy Riders" },
  { value: "150+", label: "Trips Completed" },
];

const Testimonials = () => {
  const isMobile = useIsMobile();

  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Soft accent glow top-right */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-5">
            <Star className="w-3 h-3 fill-accent" />
            Trusted by Travelers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            What Our Riders Say
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mt-4 text-sm sm:text-base leading-relaxed">
            Real experiences from passengers across Cape Town who trust us with
            their daily commutes, airport transfers, and special journeys.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
        >
          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={[
              Autoplay({
                delay: 3500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.name}
                  className={cn(
                    "pl-4",
                    isMobile ? "basis-[88%]" : "md:basis-1/2 lg:basis-1/3"
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-14 sm:mt-18"
        >
          <div className="flex flex-wrap justify-center gap-px rounded-2xl overflow-hidden border border-border bg-border mx-auto max-w-xl">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "flex-1 min-w-[100px] bg-card text-center py-5 px-4 transition-colors duration-200 hover:bg-accent/5",
                  i === 0 && "rounded-l-2xl",
                  i === stats.length - 1 && "rounded-r-2xl"
                )}
              >
                <p className="text-2xl sm:text-3xl font-bold text-accent leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Google review CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 flex justify-center"
        >
          <a
            href="https://g.page/r/CerTy7UbkEkkEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-accent text-white hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Review us on Google
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;