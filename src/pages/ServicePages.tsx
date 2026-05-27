import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Shield,
  Zap,
  Building2,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import airportTransfersImage from "@/assets/AIRPORT-TRANSFERS.jpeg";
import chauffeurServicesImage from "@/assets/CHAUFFEUR-SERVICES.jpg";
import pointToPointImage from "@/assets/POINT-TO-POINT.jpg";
import employeeTransportImage from "@/assets/emptrans.jpg";
import staffShuttleImage from "@/assets/stafftrans.png";

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string[];
  features: string[];
  benefits?: string[];
  why?: string;
  icon?: React.ReactNode;
  image?: string;
}

const ServicePage = ({
  title,
  subtitle,
  description,
  features,
  benefits,
  why,
  icon,
  image,
}: ServicePageProps) => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero Section */}
    <div className="pt-32 section-padding bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {icon && <div className="mb-6 flex justify-center">{icon}</div>}
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            {subtitle}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {description[0]}
          </p>
        </motion.div>
      </div>
    </div>

    {/* Main Content */}
    <div className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Description with Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Image on Left */}
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              <img
                src={image}
                alt={title}
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          )}

          {/* Description on Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {description.map((p, i) => (
              <p
                key={i}
                className="text-muted-foreground leading-relaxed mb-4 text-lg"
              >
                {p}
              </p>
            ))}
          </motion.div>
        </motion.div>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">
            What's Included
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-accent/30 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <p className="text-foreground font-medium">{f}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Choose This Service */}
        {why && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 p-8 rounded-2xl bg-secondary/30 border border-border"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why Choose This Service
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {why}
            </p>
            {benefits && (
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit}
                    </h3>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Book?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience premium transportation in Cape Town. Book your service
            today and arrive in style.
          </p>
          <Link to="/book">
            <Button variant="hero" size="lg" className="gap-2">
              Book Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>

    <Footer />
  </div>
);

export const AirportTransfers = () => (
  <ServicePage
    title="Airport Transfers"
    subtitle="Reliable & Punctual"
    description={[
      "Never miss a flight again. Our airport transfer service ensures you arrive at Cape Town International Airport on time, every time. We monitor flight schedules in real-time and adjust pickup times accordingly, so you're always covered even when plans change.",
      "Whether you're arriving, departing, or connecting through Cape Town, our professional drivers will ensure a smooth, stress-free journey. With our meet & greet service, you'll be welcomed and assisted from the moment you arrive.",
    ]}
    features={[
      "Real-time flight tracking & schedule adjustments",
      "Meet & greet service at arrivals",
      "24/7 availability for all flights",
      "Fixed pricing no surprise charges",
      "Complimentary 30-minute waiting time",
      "Professional, courteous drivers",
    ]}
    why="Airport transfers can be stressful, especially when you're traveling. Our service eliminates the worry by providing reliable, professional transportation that gets you to or from Cape Town International Airport safely, on time, and in comfort."
    benefits={[
      "On-Time Guarantee",
      "Real-Time Tracking",
      "Professional Service",
    ]}
    icon={<Users className="w-12 h-12 text-accent" />}
    image={airportTransfersImage}
  />
);

export const ChauffeurServices = () => (
  <ServicePage
    title="Chauffeur Services"
    subtitle="Your Personal Driver"
    description={[
      "Have a professional chauffeur at your disposal for business meetings, wine tours, special events, or simply exploring Cape Town in style. Our experienced drivers are trained to provide exceptional service while letting you focus on what matters.",
      "Book by the hour and enjoy the flexibility of having a dedicated driver who knows the city inside and out. From navigating Cape Town's scenic routes to handling corporate protocols, our chauffeurs are prepared for every situation.",
    ]}
    features={[
      "Hourly or daily booking options",
      "Professional, vetted, uniformed drivers",
      "Multilingual driver availability",
      "Corporate accounts & invoicing available",
      "Executive-level service standards",
      "Luxury vehicle options",
    ]}
    why="When you need more than just a ride, our chauffeur service provides professional, discreet, and courteous drivers who understand service excellence. Whether for business or leisure, we handle the driving so you can manage your schedule, prepare for meetings, or simply relax."
    benefits={[
      "Professional Standards",
      "Multilingual Support",
      "Executive Service",
    ]}
    icon={<Clock className="w-12 h-12 text-accent" />}
    image={chauffeurServicesImage}
  />
);

export const PointToPoint = () => (
  <ServicePage
    title="Point-to-Point Transfers"
    subtitle="Direct & Efficient"
    description={[
      "Need to get from A to B? Our point-to-point transfer service offers direct, no-fuss transport anywhere in the greater Cape Town area. From the Winelands to the Waterfront, we've got you covered with competitive pricing and premium comfort.",
      "With flexible departure times, transparent pricing, and a range of vehicle options, our point-to-point transfers are perfect for individuals, couples, families, and groups of any size. We serve all major destinations across Cape Town.",
    ]}
    features={[
      "Door-to-door service with direct routes",
      "Competitive, transparent pricing",
      "No detours or unexpected stops",
      "Available 7 days a week, 24/7",
      "Multiple vehicle options for groups",
      "Easy online booking",
    ]}
    why="Getting around Cape Town shouldn't be complicated. Our point-to-point transfer service provides straightforward, efficient transportation with no surprises. We focus on getting you where you need to be quickly, safely, and affordably every single time."
    benefits={["Direct Routes", "Great Prices", "Easy Booking"]}
    icon={<MapPin className="w-12 h-12 text-accent" />}
    image={pointToPointImage}
  />
);

export const EmployeeTransportation = () => (
  <ServicePage
    title="Employee Transportation"
    subtitle="Corporate Commute Solutions"
    description={[
      "Empower your workforce with reliable, comfortable, and punctual employee transportation across Cape Town. We partner with companies of all sizes to provide daily commuter services that get your team to work safely, on time, and ready to perform.",
      "From small executive teams to large corporate campuses, our tailored employee transport programmes reduce parking pressure, lower your carbon footprint, and demonstrate genuine care for your staff's wellbeing. We handle the logistics so you can focus on running your business.",
    ]}
    features={[
      "Customised daily commute schedules",
      "Dedicated routes & pickup points",
      "Modern, air-conditioned vehicles",
      "Vetted, professional drivers",
      "Monthly corporate billing & reporting",
      "Real-time route tracking & support",
    ]}
    why="Reliable employee transport boosts productivity, reduces lateness, and improves staff retention. Our corporate commute solutions are built around your company's hours, locations, and headcount, with flexible contracts that scale as your team grows."
    benefits={[
      "Boosted Productivity",
      "Happier Employees",
      "Reduced Overheads",
    ]}
    icon={<Building2 className="w-12 h-12 text-accent" />}
    image={employeeTransportImage}
  />
);

export const StaffShuttleService = () => (
  <ServicePage
    title="Staff Shuttle Service"
    subtitle="Group & Shift Transport"
    description={[
      "Move your team efficiently with our dedicated staff shuttle service. Whether you operate around-the-clock shifts, run a busy hospitality venue, or manage a large industrial site, we deliver safe, on-schedule group transport tailored to your operational rhythm.",
      "Our shuttle fleet covers everything from compact minibuses to full-size coaches, ensuring every staff member has a comfortable seat. With early-morning, late-night, and weekend availability, we keep your operations moving without missing a beat.",
    ]}
    features={[
      "Shift-aligned pickups & drop-offs",
      "Fleet sized to your headcount",
      "24/7 availability for night shifts",
      "Multiple pickup zones across Cape Town",
      "Dedicated account manager",
      "Trip logs & attendance reporting",
    ]}
    why="Late or missing staff disrupts your entire operation. Our staff shuttle service guarantees consistent, on-time transport for your team — backed by a professional fleet, experienced drivers, and 24/7 operational support that never lets you down."
    benefits={[
      "On-Time Every Shift",
      "Scalable Fleet",
      "Dedicated Support",
    ]}
    icon={<Briefcase className="w-12 h-12 text-accent" />}
    image={staffShuttleImage}
  />
);
