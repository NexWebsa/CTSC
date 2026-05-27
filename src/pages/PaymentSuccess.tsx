import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const [status, setStatus] = useState<string>("checking");

  useEffect(() => {
    if (!bookingId) {
      setStatus("unknown");
      return;
    }

    let cancelled = false;

    const markPaid = async () => {
      // Read current payment_status first — if webhook already fired, leave it alone.
      const { data: current } = await supabase
        .from("bookings")
        .select("payment_status")
        .eq("id", bookingId)
        .single();

      if (cancelled) return;

      if (current?.payment_status === "paid") {
        setStatus("paid");
        return;
      }

      // Yoco redirected the user here, so flip payment_status optimistically.
      // The yoco-webhook will idempotently confirm this server-side.
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (cancelled) return;

      if (error) {
        console.error("Failed to mark booking as paid:", error);
        setStatus("processing");
        return;
      }

      setStatus("paid");
    };

    markPaid();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

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
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              {status === "checking" ? (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-3">
              {status === "checking"
                ? "Confirming your payment…"
                : "Payment Successful"}
            </h1>

            <p className="text-muted-foreground mb-8">
              {status === "paid" &&
                "Thank you! Your booking is confirmed and marked as paid. We'll be in touch shortly with driver details."}
              {status === "processing" &&
                "Your payment is being processed. It can take a moment to update — your dashboard will refresh automatically once confirmed."}
              {status === "checking" &&
                "Hang tight while we verify your payment with Yoco."}
              {status === "unknown" &&
                "We couldn't find your booking reference, but if you completed payment it'll appear on your dashboard shortly."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="accent"
                className="rounded-full gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">Back Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
