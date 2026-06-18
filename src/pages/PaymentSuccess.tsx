import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type ConfirmationStatus =
  | "checking"
  | "processing"
  | "confirmed"
  | "fallback"
  | "unknown";

const MAX_CONFIRMATION_ATTEMPTS = 6;
const CONFIRMATION_RETRY_MS = 2500;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const [status, setStatus] = useState<ConfirmationStatus>("checking");

  useEffect(() => {
    if (!bookingId) {
      setStatus("unknown");
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const confirmPaymentEmail = async (attempt = 1) => {
      setStatus(attempt === 1 ? "checking" : "processing");

      try {
        const { data, error } = await supabase.functions.invoke(
          "send-payment-confirmation",
          {
            body: { bookingId },
          }
        );

        if (cancelled) return;
        if (error) throw error;

        const responseStatus =
          data && typeof data.status === "string" ? data.status : "";

        if (
          responseStatus === "sent" ||
          responseStatus === "already_sent" ||
          responseStatus === "email_failed" ||
          responseStatus === "email_partial_failed" ||
          responseStatus === "email_not_configured" ||
          responseStatus === "paid_tracking_unavailable" ||
          data?.paymentConfirmed === true ||
          data?.success === true
        ) {
          setStatus("confirmed");
          return;
        }

        if (
          (responseStatus === "not_paid" || responseStatus === "sending") &&
          attempt < MAX_CONFIRMATION_ATTEMPTS
        ) {
          retryTimer = setTimeout(
            () => confirmPaymentEmail(attempt + 1),
            CONFIRMATION_RETRY_MS
          );
          return;
        }

        setStatus("fallback");
      } catch (error) {
        console.error("Payment confirmation check failed:", error);
        if (!cancelled && attempt < MAX_CONFIRMATION_ATTEMPTS) {
          retryTimer = setTimeout(
            () => confirmPaymentEmail(attempt + 1),
            CONFIRMATION_RETRY_MS
          );
          return;
        }

        if (!cancelled) setStatus("fallback");
      }
    };

    confirmPaymentEmail();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [bookingId]);

  const isLoading = status === "checking" || status === "processing";

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
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-3">
              {isLoading && "Confirming your payment..."}
              {status === "confirmed" && "Payment Confirmed"}
              {status === "fallback" && "Payment Processing"}
              {status === "unknown" && "Payment Reference Missing"}
            </h1>

            <p className="text-muted-foreground mb-8">
              {status === "confirmed" &&
                "Thank you! Your payment has been received and your confirmation email is on its way. We'll be in touch shortly with driver details."}
              {status === "processing" &&
                "Your payment is being verified. This can take a moment while Yoco notifies our system."}
              {status === "checking" &&
                "Hang tight while we verify your payment with Yoco."}
              {status === "fallback" &&
                "Your payment may still be processing. If payment completed, your booking will update shortly and our team will follow up if the confirmation email needs attention."}
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
