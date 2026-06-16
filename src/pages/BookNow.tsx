import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AuthNavbar from "@/components/AuthNavbar";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import Seo from "@/components/Seo";
import { useAuth } from "@/contexts/AuthContext";
import bookingBg from "@/assets/booking_bg.png";

const BookNow = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Seo
        title="Book a Cape Town Shuttle | Instant Quote & Online Booking"
        description="Book your Cape Town shuttle or airport transfer online. Get an instant quote, choose your vehicle and pay securely. No account required."
        path="/book"
      />

      {user ? <AuthNavbar role="user" /> : <Navbar />}

      <main className="relative isolate flex-grow overflow-hidden pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-32">
        {/* Background Image */}
        <img
          src={bookingBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[42%_center] md:object-center"
        />

        {/* Premium dark overlays */}
        <div className="absolute inset-0 -z-20 bg-black/65 sm:bg-black/60" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black/85 via-black/35 to-black/90" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-black/75 via-black/20 to-black/55" />

        {/* Soft luxury glows */}
        <div className="absolute left-1/2 top-10 -z-10 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px] sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute -left-24 top-1/3 -z-10 h-[18rem] w-[18rem] rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -right-28 bottom-10 -z-10 h-[20rem] w-[20rem] rounded-full bg-accent/10 blur-[130px]" />

        {/* Subtle texture/vignette */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_75%)]" />

        <div className="relative z-10">
          <div className="container mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
            >
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent sm:text-xs">
                  Book your shuttle
                </span>
              </div>

              <h1 className="mt-4 text-balance text-3xl font-bold leading-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
                Your journey, just a few taps away
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                Get instant pricing and availability. No account needed, book as
                a guest or sign in to track your trips.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
              className="mx-auto w-full"
            >
              <BookingWizard />
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookNow;