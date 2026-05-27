import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import airport from "../assets/AIRPORT-TRANSFERS.jpeg";
import point from "../assets/POINT-TO-POINT.jpg";
import chauffeur from "../assets/CHAUFFEUR-SERVICES.jpg";
import charter from "../assets/CHARTER-SERVICES.jpg";
import dinner from "../assets/DINNER-TRANSFERS.jpg";
import emptrans from "../assets/emptrans.jpg";
import stafftrans from "../assets/stafftrans.png";

const services = [
  {
    id: 1,
    title: "Airport Transfers",
    subtitle: "Cape Town",
    description:
      "Private Airport Transfers In Cape Town – Safe & Reliable. Cape Town Shuttle Service is the area's leader in offering affordable, professional airport transfers from Cape Town International.\n\nWe take a hands-on approach to customer inquiries and bookings, which guarantees that you get a personalized, high-quality experience each and every time you book an Airport Shuttle Cape Town.\n\nWith our Private Cape Town Airport Transfers, you won't have to share a ride with strangers and you won't have to wait on other travelers to arrive.",
    image:
      airport,
    cta: "Book Now",
    reverse: false,
  },
  {
    id: 2,
    title: "Point to Point",
    subtitle: "Cape Town Shuttles",
    description:
      "We cover most areas in Cape Town including the Atlantic seaboard, Northern Suburbs, Southern Suburbs, some Cape flats areas as well as the Helderberg (Winelands) and Cape Town international airport. Using our shuttle services is considered to be one of the safest and most convenient modes of transportation in Cape Town.\n\nAs a passenger, you have full control over the trip, you have the right to change the destination or take any desired route at any given time. Our Door to Door Shuttle service operates 24/7, so you are more than welcome to call us at any time, though we do highly recommend booking your transport in advance in order to guarantee availability.",
    image:
      point,
    cta: "Book Now",
    reverse: true,
  },
  {
    id: 3,
    title: "Charter Services",
    subtitle: "Cape Town Expert Charter Service",
    description:
      "Travelling can be frustrating when you don't have the right transportation service. Count on us. We will make travel easier and smoother for you to focus on traveling because you don't have to worry about how you will get to your destination.\n\nWith our expert Charter Services, your stress will be reduced as you don't need to deal with directions or traffic. Our professional and well-trained driver is going to take care of those things for you. No matter if it is a large group or a small one, we have got you covered. You and your group will get to your preferred location at the right time.",
    image:
      charter,
    cta: "Book Now",
    reverse: false,
  },
  {
    id: 4,
    title: "Chauffeur Services",
    subtitle: "Cape Town Chauffeur Service",
    description:
      "Are you seeking Chauffeur Services? We are your one-stop solution. We offer luxury chauffeur service that can make your travel experience more enjoyable and pleasing. Book it online whenever you need it and booking in advance ensures you will have a safe ride.\n\nNo matter it is a business trip or pleasure, we have got you covered. Our professional chauffeur will handle everything throughout the rides. For a business trip, it is the perfect option to represent your company and its professionalism. Our expert chauffeurs practice decorum, confidentiality, and discretion at all times. They will arrive at the pickup location 15 minutes earlier. You just need to sit back and relax.",
    image:
      chauffeur,
    cta: "Book Now",
    reverse: true,
  },
  {
    id: 5,
    title: "Dinner Transfers",
    subtitle: "Cape Town Dinner Service",
    description:
      "Looking for a leading company for Dinner Transfers? You have come to the right place. We have been in this business for many years. Our Vehicles are fully licensed and comply with all the relevant legal requirements. This guaranteed our Clients shorter periods of interruptions at routine traffic check points and/or road blocks.\n\nMost often people find a reliable ground transfer for their dinner party. We can offer your guests and participants excellent and dependable Dinner Transfers that will take you to your preferred location where you need to be on time and in style. Rest assured that you are in a safe place. Book your luxury vehicle online and make your dinner program amazing and memorable.",
    image:
      dinner,
    cta: "Book Now",
    reverse: false,
  },
  {
    id: 6,
    title: "Employee Transportation",
    subtitle: "Cape Town Corporate Commute",
    description:
      "Empower your workforce with reliable, comfortable, and punctual employee transportation across Cape Town. We partner with companies of all sizes to provide daily commuter services that get your team to work safely, on time, and ready to perform at their best.\n\nFrom small executive teams to large corporate campuses, our tailored employee transport programmes reduce parking pressure, lower your carbon footprint, and demonstrate genuine care for your staff's wellbeing. With customised routes, monthly corporate billing, and a vetted fleet of professional drivers, we handle every detail so you can focus on running your business.",
    image: emptrans,
    cta: "Book Now",
    reverse: true,
  },
  {
    id: 7,
    title: "Staff Shuttle Service",
    subtitle: "Cape Town Group & Shift Transport",
    description:
      "Move your team efficiently with our dedicated staff shuttle service. Whether you operate around-the-clock shifts, run a busy hospitality venue, or manage a large industrial site, we deliver safe, on-schedule group transport tailored to your operational rhythm.\n\nOur shuttle fleet covers everything from compact minibuses to full-size coaches, ensuring every staff member has a comfortable seat. With early-morning, late-night, and weekend availability, dedicated account management, and detailed trip reporting, we keep your operations moving without missing a beat.",
    image: stafftrans,
    cta: "Book Now",
    reverse: false,
  },
];

const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="pt-32 section-padding bg-background">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold tracking-wider uppercase text-accent">
              Our Services
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-6">
              Premium Transport Solutions
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive transportation services tailored to your needs
              across Cape Town.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services */}
      <div className="section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`mb-20 grid md:grid-cols-2 gap-12 items-center ${
                service.reverse ? "md:grid-cols-2" : ""
              }`}
            >
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={service.reverse ? "md:order-2" : "md:order-1"}
              >
                <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: service.reverse ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={service.reverse ? "md:order-1" : "md:order-2"}
              >
                <div className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
                  {service.subtitle}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  {service.title}
                </h2>

                <div className="space-y-4 mb-8">
                  {service.description.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <Link
                  to="/book-now"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 group"
                >
                  {service.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section-padding bg-gradient-to-r from-accent/10 to-accent/5 border-t border-accent/20"
      >
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Contact us directly for custom transportation solutions tailored to
            your specific needs.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 group"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Services;
