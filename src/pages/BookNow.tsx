import { motion } from "framer-motion";
import AuthNavbar from "@/components/AuthNavbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";

const BookNow = () => (
  <div className="min-h-screen flex flex-col">
    <AuthNavbar role="user" />
    <div className="flex-grow pt-20 section-padding bg-background">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Book Your Shuttle
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2">
            Book Your Shuttle Today
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Fill in your details below and we'll confirm your booking within 2
            hours.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BookingForm />
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export default BookNow;
