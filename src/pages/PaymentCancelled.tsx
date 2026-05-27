import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 section-padding bg-background">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-10 text-center"
          >
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-3">
              Payment Cancelled
            </h1>

            <p className="text-muted-foreground mb-8">
              No worries — your booking is saved as awaiting payment. You can
              retry the payment from the link in your email, or start a new
              booking any time.
              {bookingId && (
                <>
                  <br />
                  <span className="text-xs text-muted-foreground/70 mt-2 inline-block">
                    Reference: {bookingId}
                  </span>
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="accent"
                className="rounded-full gap-2"
                onClick={() => navigate("/book")}
              >
                <RotateCcw className="w-4 h-4" /> Book Again
              </Button>
              <Button asChild variant="outline" className="rounded-full gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancelled;
