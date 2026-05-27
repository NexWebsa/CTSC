import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Navigation, CheckCircle, PlayCircle,
  Car, MessageSquare, Loader2, Activity, CalendarCheck, CheckCircle2,
  Phone, MessageCircle, DollarSign, Star, Lock, AlertCircle, RefreshCw, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import AuthNavbar from "@/components/AuthNavbar";
import { formatNotes } from "@/lib/formatNotes";
import { toast } from "@/hooks/use-toast";

interface DriverBooking {
  id: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string | null;
  pickup_date: string;
  pickup_time: string;
  status: string;
  service_type: string;
  notes: string | null;
  price_estimate: number | null;
  payment_status: string | null;
  vehicles?: { name: string } | null;
  customer_name?: string;
  customer_phone?: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

const statusFlow = [
  { from: "approved", to: "driver_assigned", label: "Accept", icon: CheckCircle, color: "bg-blue-600 hover:bg-blue-700 text-white" },
  { from: "driver_assigned", to: "on_the_way", label: "On The Way", icon: Navigation, color: "bg-orange-600 hover:bg-orange-700 text-white", requiresPaid: true },
  { from: "on_the_way", to: "arrived", label: "Arrived", icon: MapPin, color: "bg-purple-600 hover:bg-purple-700 text-white" },
  { from: "arrived", to: "in_progress", label: "Start Trip", icon: PlayCircle, color: "bg-accent hover:bg-accent/90 text-accent-foreground" },
  { from: "in_progress", to: "completed", label: "Complete", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700 text-white" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  driver_assigned: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  on_the_way: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  arrived: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

const DriverDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDriver, driverId, loading: driverLoading } = useDriverCheck();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tripFilter, setTripFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");

  const tripFilters: Array<{ key: "all" | "today" | "upcoming" | "completed"; label: string }> = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ];

  useEffect(() => {
    if (!authLoading && !driverLoading) {
      if (!user) navigate("/auth");
      else if (!isDriver) navigate("/dashboard");
    }
  }, [user, isDriver, authLoading, driverLoading, navigate]);

  const fetchBookings = async (silent = false) => {
    if (!driverId) return;
    if (!silent) setRefreshing(true);
    const [bookingsRes, profilesRes, ratingsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, payment_status, notes, created_at, updated_at, vehicles:vehicle_id(name)")
        .eq("driver_id", driverId)
        .in("status", ["approved", "driver_assigned", "on_the_way", "arrived", "in_progress", "completed"])
        .order("pickup_date", { ascending: true }),
      supabase.from("profiles").select("id, full_name, phone"),
      supabase.from("booking_ratings").select("rating").eq("driver_id", driverId),
    ]);
    const profileMap = new Map<string, Profile>();
    (profilesRes.data as Profile[] || []).forEach(p => profileMap.set(p.id, p));
    const enriched = ((bookingsRes.data as unknown as DriverBooking[]) || []).map(b => {
      const p = profileMap.get(b.user_id);
      return { ...b, customer_name: p?.full_name || "Customer", customer_phone: p?.phone || null };
    });
    setBookings(enriched);
    const ratings = (ratingsRes.data as { rating: number }[]) || [];
    if (ratings.length) {
      const sum = ratings.reduce((a, r) => a + r.rating, 0);
      setAvgRating({ avg: sum / ratings.length, count: ratings.length });
    } else {
      setAvgRating({ avg: 0, count: 0 });
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!driverId) return;
    fetchBookings(true);
    const channel = supabase
      .channel("driver-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `driver_id=eq.${driverId}` }, () => fetchBookings(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  const updateStatus = async (booking: DriverBooking, newStatus: string) => {
    // Block "On The Way" until payment is received
    if (newStatus === "on_the_way" && booking.payment_status !== "paid") {
      toast({
        title: "Payment required",
        description: "This trip cannot start until the customer's payment is confirmed.",
        variant: "destructive",
      });
      return;
    }
    setUpdatingId(booking.id);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", booking.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip updated", description: `Status set to ${newStatus.replace(/_/g, " ")}.` });
      await fetchBookings(true);
    }
    setUpdatingId(null);
  };

  const openInMaps = (pickup: string, dropoff?: string | null) => {
    const origin = encodeURIComponent(pickup);
    if (dropoff) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodeURIComponent(dropoff)}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${origin}`, "_blank");
    }
  };

  if (authLoading || driverLoading || !isDriver) return null;

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const todayTrips = bookings.filter(b => b.pickup_date === today && b.status !== "completed");
  const activeTrips = bookings.filter(b => ["on_the_way", "arrived", "in_progress"].includes(b.status));
  const upcomingTrips = bookings.filter(b => b.pickup_date > today && b.status !== "completed");
  const completedTrips = bookings.filter(b => b.status === "completed");

  const earningsToday = completedTrips
    .filter(b => b.pickup_date === today)
    .reduce((s, b) => s + (Number(b.price_estimate) || 0), 0);
  const earningsWeek = completedTrips
    .filter(b => b.pickup_date >= weekAgo)
    .reduce((s, b) => s + (Number(b.price_estimate) || 0), 0);

  const nextTrip = [...activeTrips, ...todayTrips, ...upcomingTrips]
    .filter(b => b.status !== "completed")
    .sort((a, b) => (a.pickup_date + a.pickup_time).localeCompare(b.pickup_date + b.pickup_time))[0];

  const filteredTrips = (() => {
    switch (tripFilter) {
      case "today": return todayTrips;
      case "upcoming": return upcomingTrips;
      case "completed": return completedTrips;
      case "all":
      default: return bookings.filter(b => !["pending", "cancelled"].includes(b.status));
    }
  })();

  const stats = [
    { label: "Today", value: todayTrips.length, sub: "trips", icon: CalendarCheck, gradient: "from-blue-500/10 to-blue-600/5" },
    { label: "Active", value: activeTrips.length, sub: "in progress", icon: Activity, gradient: "from-accent/10 to-accent/5" },
    { label: "Today", value: formatCurrency(earningsToday), sub: "earned", icon: DollarSign, gradient: "from-green-500/10 to-green-600/5" },
    { label: "7 days", value: formatCurrency(earningsWeek), sub: "earned", icon: TrendingUp, gradient: "from-purple-500/10 to-purple-600/5" },
  ];

  const PaymentBadge = ({ status }: { status: string | null }) => {
    const cfg =
      status === "paid"
        ? { c: "bg-green-500/10 text-green-600 border-green-500/20", label: "Paid", Icon: CheckCircle }
        : status === "failed"
        ? { c: "bg-destructive/10 text-destructive border-destructive/20", label: "Failed", Icon: AlertCircle }
        : { c: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Unpaid", Icon: Lock };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 ${cfg.c}`}>
        <cfg.Icon className="w-2.5 h-2.5" /> {cfg.label}
      </span>
    );
  };

  const TripCard = ({ booking, highlight = false }: { booking: DriverBooking; highlight?: boolean }) => {
    const action = statusFlow.find(s => s.from === booking.status);
    const isUpdating = updatingId === booking.id;
    const blocked = action?.requiresPaid && booking.payment_status !== "paid";

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-card border p-4 sm:p-5 transition-colors space-y-3 ${
          highlight ? "border-accent/40 shadow-[0_0_0_1px_hsl(var(--accent)/0.2)]" : "border-border/50 hover:border-border"
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
              {booking.status.replace(/_/g, " ")}
            </span>
            <PaymentBadge status={booking.payment_status} />
          </div>
          <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm font-medium text-foreground break-words">{booking.pickup_location}</span>
          </div>
          {booking.dropoff_location && (
            <div className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-destructive shrink-0" />
              <span className="text-sm font-medium text-foreground break-words">{booking.dropoff_location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.pickup_date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.pickup_time}</span>
          <span>👤 {booking.customer_name}</span>
          {booking.price_estimate != null && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <DollarSign className="w-3 h-3" />{formatCurrency(Number(booking.price_estimate))}
            </span>
          )}
        </div>

        {booking.vehicles?.name && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Car className="w-3 h-3" /> {booking.vehicles.name}
          </div>
        )}

        {booking.notes && (() => {
          const display = formatNotes(booking.notes);
          return display ? (
            <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
              <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground break-words">{display}</p>
            </div>
          ) : null;
        })()}

        {blocked && (
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5">
            <Lock className="w-3.5 h-3.5 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-500">
              Waiting for customer payment. You can't depart until the booking is paid.
            </p>
          </div>
        )}

        {/* Contact row */}
        {booking.customer_phone && (
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" className="text-xs gap-1.5 flex-1 rounded-xl"
              onClick={() => window.open(`tel:${booking.customer_phone}`)}
            >
              <Phone className="w-3 h-3" /> Call
            </Button>
            <Button
              variant="outline" size="sm" className="text-xs gap-1.5 flex-1 rounded-xl"
              onClick={() => window.open(`https://wa.me/${booking.customer_phone!.replace(/\D/g, "")}`, "_blank")}
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </Button>
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline" size="sm" className="text-xs gap-1.5 flex-1 rounded-xl"
            onClick={() => openInMaps(booking.pickup_location, booking.dropoff_location)}
          >
            <Navigation className="w-3 h-3" /> Maps
          </Button>
          {action && (
            <Button
              size="sm"
              className={`text-xs gap-1.5 flex-1 rounded-xl border-0 ${blocked ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed" : action.color}`}
              onClick={() => updateStatus(booking, action.to)}
              disabled={isUpdating || blocked}
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : blocked ? <Lock className="w-3 h-3" /> : <action.icon className="w-3 h-3" />}
              {blocked ? "Awaiting payment" : action.label}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const Section = ({ title, trips, dot }: { title: string; trips: DriverBooking[]; dot?: string }) => {
    if (trips.length === 0) return null;
    return (
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
          {title}
          <span className="text-xs font-normal text-muted-foreground">({trips.length})</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {trips.map(b => <TripCard key={b.id} booking={b} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar role="driver" />

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Driver Dashboard</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-muted-foreground text-sm">Manage your assigned trips</p>
                {avgRating.count > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                    <Star className="w-3 h-3 fill-current" />
                    {avgRating.avg.toFixed(1)} · {avgRating.count} {avgRating.count === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 self-start" onClick={() => fetchBookings(false)} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border/50 p-4`}
              >
                <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label} · {stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tripFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={tripFilter === filter.key ? "accent" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setTripFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trips assigned yet.</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No trips match this filter.</p>
              <Button variant="accent" className="rounded-full" onClick={() => setTripFilter("all")}>Show All</Button>
            </div>
          ) : tripFilter === "all" ? (
            <div className="space-y-8">
              <Section title="Today's Trips" trips={todayTrips} dot="bg-accent" />
              <Section title="Upcoming Trips" trips={upcomingTrips} />
              <Section title="Completed" trips={completedTrips} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredTrips.map(b => <TripCard key={b.id} booking={b} />)}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DriverDashboard;
