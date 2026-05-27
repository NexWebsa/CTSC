import { motion } from "framer-motion";
import { CheckCircle, Award, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import fleetwithstaffImage from "@/assets/fleetwithstaff.jpg";
import fleetwith1Image from "@/assets/fleetwith1.jpg";

const About = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero Section */}
    <div className="pt-32 section-padding bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-4">
            Cape Town Shuttle Services
          </h1>
          <p className="text-xl font-semibold text-accent mb-6">
            Travel • Tours • Adventure
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your all-in-one service provider dedicated to delivering the best
            and most exciting transportation experiences for our valued clients.
          </p>
        </motion.div>
      </div>
    </div>

    {/* Main Content */}
    <div className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Who We Are */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Who We Are
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            We are a passionate team with the vision of delivering exceptional
            transportation experiences. In our short period of operation, we've
            established ourselves as a reputable service provider in Cape Town's
            tourism and hospitality industry.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your required services inspire us to provide innovative solutions to
            our valued clients. At Cape Town Shuttle Services, we pride
            ourselves on letting our clients{" "}
            <span className="font-semibold text-foreground">
              Arrive In Style
            </span>{" "}
            with every journey backed by our impeccable track record and full
            commitment to excellence.
          </p>
        </motion.section>

        {/* Who We Are with Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src={fleetwithstaffImage}
                alt="Our Professional Fleet and Team"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Professional Team
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Behind every successful journey is a dedicated team of
              professionals committed to excellence. Our drivers and staff
              undergo rigorous training to ensure every client experience
              exceeds expectations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that exceptional service starts with exceptional
              people. That's why we invest in our team, ensuring they represent
              the quality and reliability that Cape Town Shuttle Services is
              known for.
            </p>
          </motion.div>
        </motion.div>

        {/* Our History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 p-8 rounded-2xl bg-secondary/30 border border-border"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Our Journey
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded in 2008 by Severo Zwartz, Cape Town Shuttle Services began
            as a sole proprietorship with a simple mission: provide outstanding
            shuttle services. Thanks to Severo's absolute commitment to
            exceptional service, the business expanded rapidly so much so that
            we were forced to purchase more vehicles and employ additional
            professional drivers and operators.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, we specialize in airport transfers, tourist shuttling, and
            adventure travel services with consistent demand. Our success is
            built on a simple principle: when our fleet is fully booked, we
            personally recommend and negotiate with reputable service providers
            to ensure our clients always receive the quality standards that
            define Cape Town Shuttle Services.
          </p>
        </motion.section>

        {/* What Sets Us Apart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">
            What Sets Us Apart
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Legal Compliance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Fully Licensed & Compliant
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All our vehicles are fully licensed and comply with all
                    relevant legal requirements. This ensures your experience
                    smooth travel with minimal interruptions at checkpoints and
                    roadblocks.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quality Guarantee */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Quality Service Guaranteed
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We guarantee a smooth and comfortable trip every time you
                    travel with us. Subject to prevailing conditions, your
                    satisfaction is our priority.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Satisfied Customers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Satisfied Customers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our impeccable track record speaks for itself. Every client
                    matters, and we're committed to helping them arrive in
                    style.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Innovative Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Innovative Solutions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your required services inspire us. We provide tailored
                    solutions and trusted recommendations to ensure you always
                    get the best experience.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Fleet Excellence with Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Premium Fleet Excellence
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our fleet represents the pinnacle of comfort, safety, and style.
              From luxury sedans to spacious coaches, every vehicle is
              meticulously maintained and regularly inspected to ensure the
              highest standards.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We invest continuously in our fleet because we believe your
              journey deserves nothing but the best. Each vehicle is equipped
              with modern amenities and designed to provide you with a premium
              travel experience every single time.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src={fleetwith1Image}
                alt="Our Premium Fleet"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Our Specialties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative p-8 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Specialties
          </h2>
          <p className="text-muted-foreground mb-6">
            We specialize in comprehensive transportation solutions designed to
            make your journey through Cape Town unforgettable:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">
                Cape Town Airport Shuttle Services
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">
                Tourist Tours & Adventure Travel
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">
                Corporate & Private Transfers
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">
                Premium Fleet Options
              </span>
            </li>
          </ul>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Ready to Experience Excellence?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Join thousands of satisfied travelers who trust Cape Town Shuttle
            Services for their transportation needs.
          </p>
          <Link to="/book" className="hidden sm:inline-block mt-2">
            <Button variant="hero" size="sm">
              Book Your Ride
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>

    <Footer />
  </div>
);

export default About;
