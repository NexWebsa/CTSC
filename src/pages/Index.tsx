import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PaymentTrustStrip from "@/components/PaymentTrustStrip";
import HowItWorks from "@/components/HowItWorks";
import ServicesOverview from "@/components/ServicesOverview";
import FleetPreview from "@/components/FleetPreview";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <Hero />
    <HowItWorks />
    <ServicesOverview />
    <PaymentTrustStrip />
    <FleetPreview />
    <WhyUs />
    <Testimonials />
    <Footer />
  </div>
);

export default Index;
