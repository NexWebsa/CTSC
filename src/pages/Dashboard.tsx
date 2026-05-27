import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Car, User, Plus, Activity, CheckCircle2, LayoutList, Star, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthNavbar from "@/components/AuthNavbar";
import RatingDialog from "@/components/RatingDialog";

interface Booking {
  id: string;
  booking_type: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  hours: number | null;
  pickup_date: string;
  pickup_time: string;
  vehicle_id: string | null;
  driver_id: string | null;
  status: string;
  price_estimate: number | null;
  is_favourite: boolean;
  notes: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { name: string } | null;
  drivers?: { full_name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  driver_assigned: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  on_the_way: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  arrived: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  approved: "Approved",
  driver_assigned: "Driver Assigned",
  on_the_way: "Driver On The Way",
  arrived: "Driver Arrived",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratedBookings, setRatedBookings] = useState<Set<string>>(new Set());
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<"all" | "recent" | "pending" | "completed">("all");

  const bookingFilters: Array<{ key: "all" | "recent" | "pending" | "completed"; label: string }> = [
    { key: "all", label: "All" },
    { key: "recent", label: "Recent (7d)" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (bookingFilter === "all") return true;
    if (bookingFilter === "recent") {
      const createdAt = new Date(booking.created_at);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= sevenDaysAgo;
    }
    if (bookingFilter === "pending") return booking.status === "pending";
    if (bookingFilter === "completed") return booking.status === "completed";
    return true;
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, is_favourite, notes, payment_status, created_at, updated_at, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings((data as unknown as Booking[]) || []);
      setLoading(false);
    };
    fetchBookings();
    // Load already-rated bookings
    supabase.from("booking_ratings").select("booking_id").eq("user_id", user.id).then(({ data }) => {
      if (data) setRatedBookings(new Set(data.map((r: any) => r.booking_id)));
    });
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, () => { fetchBookings(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (authLoading || !user) return null;

  const activeBookings = bookings.filter(b => ["on_the_way", "arrived", "in_progress"].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === "completed");

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: LayoutList, gradient: "from-blue-500/10 to-blue-600/5" },
    { label: "Active", value: activeBookings.length, icon: Activity, gradient: "from-accent/10 to-accent/5" },
    { label: "Completed", value: completedBookings.length, icon: CheckCircle2, gradient: "from-green-500/10 to-green-600/5" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar role="user" />

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Track and manage your bookings</p>
            </div>
            <Button variant="accent" className="rounded-full gap-2 w-full sm:w-auto" onClick={() => navigate("/book")}>
              <Plus className="w-4 h-4" /> New Booking
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border/50 p-4 sm:p-5`}
              >
                <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bookings */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Bookings</h2>
            <div className="flex flex-wrap gap-2">
              {bookingFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={bookingFilter === filter.key ? "accent" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setBookingFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No bookings yet.</p>
              <Button variant="accent" className="rounded-full" onClick={() => navigate("/book")}>Book Your First Ride</Button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No bookings match this filter.</p>
              <p className="text-sm text-muted-foreground mb-4">Try a different filter or clear the selection.</p>
              <Button variant="accent" className="rounded-full" onClick={() => setBookingFilter("all")}>Show All</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 hover:border-border transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[booking.status] || ""}`}>
                          {statusLabels[booking.status] || booking.status.replace(/_/g, " ")}
                        </span>
                        {booking.payment_status && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            booking.payment_status === "paid"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : booking.payment_status === "failed"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          }`}>
                            <CreditCard className="w-3 h-3 inline mr-1" />
                            {booking.payment_status === "paid" ? "Paid" : booking.payment_status === "failed" ? "Payment Failed" : "Unpaid"}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">{booking.pickup_location}</span>
                        {booking.dropoff_location && (
                          <>
                            <span className="text-muted-foreground text-xs">→</span>
                            <span className="text-sm font-medium text-foreground truncate">{booking.dropoff_location}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.pickup_date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.pickup_time}</span>
                        {booking.vehicles?.name && <span className="flex items-center gap-1"><Car className="w-3 h-3" />{booking.vehicles.name}</span>}
                        {booking.drivers?.full_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.drivers.full_name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      {booking.payment_status !== "paid" && !["cancelled", "completed"].includes(booking.status) && booking.price_estimate && (
                        <Button
                          variant="accent"
                          size="sm"
                          className="rounded-full gap-1.5"
                          disabled={payingBookingId === booking.id}
                          onClick={async () => {
                            setPayingBookingId(booking.id);
                            try {
                              const { data, error } = await supabase.functions.invoke("create-yoco-checkout", {
                                body: { bookingId: booking.id },
                              });
                              if (error) throw error;
                              if (data?.redirectUrl) {
                                window.location.href = data.redirectUrl;
                              }
                            } catch (err) {
                              console.error("Payment error:", err);
                            } finally {
                              setPayingBookingId(null);
                            }
                          }}
                        >
                          {payingBookingId === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          Pay Now
                        </Button>
                      )}
                      {booking.status === "completed" && !ratedBookings.has(booking.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-1.5 text-accent border-accent/30 hover:bg-accent/10"
                          onClick={() => setRatingBooking(booking)}
                        >
                          <Star className="w-3.5 h-3.5" /> Rate
                        </Button>
                      )}
                      {booking.status === "completed" && ratedBookings.has(booking.id) && (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <Star className="w-3.5 h-3.5 fill-accent" /> Rated
                        </span>
                      )}
                      {booking.price_estimate && (
                        <p className="text-lg font-bold text-accent">R{booking.price_estimate}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {ratingBooking && (
        <RatingDialog
          open={!!ratingBooking}
          onOpenChange={(open) => { if (!open) setRatingBooking(null); }}
          bookingId={ratingBooking.id}
          userId={user.id}
          driverId={ratingBooking.driver_id}
          driverName={ratingBooking.drivers?.full_name}
          onRated={() => {
            setRatedBookings((prev) => new Set([...prev, ratingBooking.id]));
            setRatingBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
