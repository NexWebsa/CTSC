import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AuthNavbar from "@/components/AuthNavbar";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import { useAuth } from "@/contexts/AuthContext";

const BookNow = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {user ? <AuthNavbar role="user" /> : <Navbar />}
      <div className="flex-grow pt-24 sm:pt-28 pb-16 bg-background">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Book your shuttle</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mt-2">Your journey, just a few taps away</h1>
            <p className="text-muted-foreground mt-3 text-base max-w-2xl mx-auto">
              Get instant pricing and availability. No account needed — book as a guest or sign in to track your trips.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <BookingWizard />
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookNow;
