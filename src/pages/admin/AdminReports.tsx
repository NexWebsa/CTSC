import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar, DollarSign, TrendingUp, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface Booking {
  id: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  price_estimate: number | null;
  service_type: string;
  payment_status: string | null;
  created_at: string;
}

const AdminReports = () => {
  const { isAdmin } = useAdminCheck();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, pickup_date, pickup_time, status, price_estimate, service_type, payment_status, created_at")
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchBookings();
    const channel = supabase
      .channel("admin-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (dateFrom && booking.pickup_date < dateFrom) return false;
      if (dateTo && booking.pickup_date > dateTo) return false;
      return true;
    });
  }, [bookings, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totals = {
      total: filteredBookings.length,
      completed: 0,
      pending: 0,
      cancelled: 0,
      paid: 0,
      revenue: 0,
      average: 0,
      services: {} as Record<string, number>,
    };

    filteredBookings.forEach((booking) => {
      if (booking.status === "completed") totals.completed += 1;
      if (booking.status === "pending") totals.pending += 1;
      if (booking.status === "cancelled") totals.cancelled += 1;
      if (booking.payment_status === "paid") {
        totals.paid += 1;
        totals.revenue += booking.price_estimate || 0;
      }
      totals.services[booking.service_type] = (totals.services[booking.service_type] || 0) + 1;
    });

    totals.average = totals.paid > 0 ? totals.revenue / totals.paid : 0;
    return totals;
  }, [filteredBookings]);

  const serviceBreakdown = useMemo(() => {
    return Object.entries(stats.services)
      .sort((a, b) => b[1] - a[1]);
  }, [stats.services]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Business metrics for bookings and revenue.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Total bookings</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-foreground">{stats.paid}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold text-foreground">R{stats.revenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Avg per paid</p>
          <p className="text-2xl font-bold text-foreground">R{stats.average.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BarChart3 className="w-4 h-4" /> Booking breakdown
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border/50 pb-2">
              <span>Pending</span>
              <span>{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border/50 pb-2">
              <span>Paid</span>
              <span>{stats.paid}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border/50 pb-2">
              <span>Completed</span>
              <span>{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Cancelled</span>
              <span>{stats.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="w-4 h-4" /> Service types
          </div>
          {serviceBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings available yet.</p>
          ) : (
            <div className="space-y-2">
              {serviceBreakdown.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{type.replace(/_/g, " ")}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="w-4 h-4" /> Date filter
          </div>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl" />
            </div>
            <Button variant="outline" className="rounded-full w-full" onClick={() => { setDateFrom(""); setDateTo(""); }}>
              Clear dates
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <DollarSign className="w-4 h-4" /> Latest bookings
          </div>
          <span className="text-xs text-muted-foreground">Showing most recent 10 bookings</span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-secondary/50 text-muted-foreground">No bookings available for this period.</div>
        ) : (
          <div className="grid gap-3">
            {filteredBookings.slice(0, 10).map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 bg-background p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{booking.service_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{booking.pickup_date} • {booking.pickup_time}</p>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold">R{(booking.price_estimate || 0).toFixed(2)}</p>
                      <div className="flex gap-1 text-xs mt-1 flex-wrap justify-end">
                        <span className={`px-2 py-0.5 rounded-full capitalize ${
                          booking.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                          booking.status === 'approved' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-gray-500/10 text-gray-600'
                        }`}>{booking.status.replace(/_/g, " ")}</span>
                        <span className={`px-2 py-0.5 rounded-full capitalize ${
                          booking.payment_status === 'paid' ? 'bg-green-500/10 text-green-600' :
                          booking.payment_status === 'failed' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>{booking.payment_status || 'unpaid'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
