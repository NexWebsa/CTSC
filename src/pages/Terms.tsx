import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsContent from "@/components/TermsContent";
import Seo from "@/components/Seo";

const Terms = () => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionIndex = parseInt(sectionId.split("-")[1]);
          setActiveSection(sectionIndex);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll("[id^='section-']");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const sections = [
    "Bookings, Confirmations and Costs",
    "Cancellations and Refunds",
    "No-shows and Punctuality",
    "Luggage",
    "Health and Safety",
    "Privacy",
    "Other",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 overflow-x-hidden">
      <Seo
        title="Terms & Conditions | CTSC Travel"
        description="CTSC Travel terms and conditions — bookings, cancellations, refunds, luggage, safety and privacy policies for our Cape Town shuttle services."
        path="/terms"
      />
      <Navbar />
      <div className="flex-grow pt-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-accent/70">
            Our Policies
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mt-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before making a booking with CTSC Travel. Your understanding and agreement to these terms ensures a smooth experience.
          </p>
        </motion.div>

        <div className="container mx-auto max-w-7xl px-0 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-2">
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Sections</h3>
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveSection(idx);
                      const element = document.getElementById(`section-${idx}`);
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === idx
                      ? "bg-accent text-white shadow-lg"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                      }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="col-span-1 lg:col-span-3"
            >
              <TermsContent activeSection={activeSection} onSectionChange={setActiveSection} />
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
