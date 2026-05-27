import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck, CheckCircle, XCircle, Loader2, Search, ArrowUpDown,
  ChevronDown, ChevronUp, Filter, X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { formatNotes } from "@/lib/formatNotes";

interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  service_type: string;
  booking_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  hours: number | null;
  pickup_date: string;
  pickup_time: string;
  status: string;
  price_estimate: number | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { name: string } | null;
  drivers?: { full_name: string } | null;
  customer_name?: string;
  customer_email?: string;
}

interface Driver {
  id: string;
  full_name: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
  email?: string | null;
}

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

const STATUS_OPTIONS = [
  "pending", "approved", "driver_assigned", "on_the_way",
  "arrived", "in_progress", "completed", "cancelled",
];

const PAYMENT_OPTIONS = ["unpaid", "paid", "failed"];

type SortKey = "created_at" | "pickup_date" | "price_estimate" | "status";
type SortDir = "asc" | "desc";

const AdminBookings = () => {
  const { isAdmin } = useAdminCheck();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    const [bookingsRes, driversRes, profilesRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, payment_status, notes, created_at, updated_at, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("is_active", true),
      supabase.from("profiles").select("id, full_name"),
    ]);
    const profileMap = new Map<string, { name: string; email: string }>();
    (profilesRes.data as Profile[] || []).forEach(p => {
      profileMap.set(p.id, { name: p.full_name || "Unknown", email: (p as any).email || "" });
    });
    const enriched = ((bookingsRes.data as unknown as Booking[]) || []).map(b => {
      const p = profileMap.get(b.user_id);
      return { ...b, customer_name: p?.name || "Unknown", customer_email: p?.email || "" };
    });
    setBookings(enriched);
    setDrivers((driversRes.data as Driver[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const channel = supabase
      .channel("admin-bookings-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setActionLoading(null);
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    setActionLoading(bookingId);
    await supabase.from("bookings").update({
      driver_id: driverId,
      status: "driver_assigned",
      updated_at: new Date().toISOString(),
    }).eq("id", bookingId);
    setActionLoading(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = bookings.filter(b => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (paymentFilter !== "all" && (b.payment_status || "unpaid") !== paymentFilter) return false;
      if (dateFrom && b.pickup_date < dateFrom) return false;
      if (dateTo && b.pickup_date > dateTo) return false;
      if (q) {
        const hay = [
          b.customer_name, b.customer_email, b.pickup_location, b.dropoff_location,
          b.service_type, b.vehicles?.name, b.drivers?.full_name, b.id,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      let av: string | number = "", bv: string | number = "";
      if (sortKey === "created_at") { av = a.created_at; bv = b.created_at; }
      else if (sortKey === "pickup_date") {
        av = `${a.pickup_date} ${a.pickup_time}`; bv = `${b.pickup_date} ${b.pickup_time}`;
      } else if (sortKey === "price_estimate") {
        av = a.price_estimate || 0; bv = b.price_estimate || 0;
      } else if (sortKey === "status") { av = a.status; bv = b.status; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [bookings, search, statusFilter, paymentFilter, dateFrom, dateTo, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("all"); setPaymentFilter("all");
    setDateFrom(""); setDateTo("");
  };

  const hasActiveFilters = search || statusFilter !== "all" || paymentFilter !== "all" || dateFrom || dateTo;

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading…" : `${filtered.length} of ${bookings.length} bookings`}
          </p>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search customer, route, driver, vehicle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={() => setShowFilters(s => !s)}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">!</span>}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" className="rounded-xl gap-2" onClick={clearFilters}>
            <XIcon className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-border/50 bg-card p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <option value="all">All payments</option>
              {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pickup from</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pickup to</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-xl" />
          </div>
        </div>
      )}

      {/* Sort bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sort:</span>
        {([
          { key: "created_at", label: "Created" },
          { key: "pickup_date", label: "Pickup" },
          { key: "price_estimate", label: "Price" },
          { key: "status", label: "Status" },
        ] as { key: SortKey; label: string }[]).map(s => (
          <button
            key={s.key}
            onClick={() => toggleSort(s.key)}
            className={`px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
              sortKey === s.key
                ? "bg-accent/10 text-accent border-accent/30"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
            {sortKey === s.key && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary/50 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-card border border-border">
          <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No bookings match your filters.</p>
          {hasActiveFilters && (
            <Button variant="accent" className="rounded-full mt-2" onClick={clearFilters}>Clear filters</Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => {
            const isActioning = actionLoading === booking.id;
            const isExpanded = expanded === booking.id;
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
                    {booking.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
                  {booking.payment_status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      booking.payment_status === "paid"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : booking.payment_status === "failed"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}>
                      {booking.payment_status === "paid" ? "💳 Paid" : booking.payment_status === "failed" ? "💳 Failed" : "💳 Unpaid"}
                    </span>
                  )}
                  {booking.price_estimate != null && (
                    <span className="ml-auto text-sm font-bold text-accent">R{booking.price_estimate}</span>
                  )}
                </div>

                <p className="text-sm font-medium text-foreground mb-1 break-words">
                  {booking.pickup_location}
                  {booking.dropoff_location && <span className="text-muted-foreground"> → {booking.dropoff_location}</span>}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-3">
                  <span>{booking.pickup_date} at {booking.pickup_time}</span>
                  <span>Customer: {booking.customer_name}</span>
                  {booking.vehicles?.name && <span>Vehicle: {booking.vehicles.name}</span>}
                  {booking.drivers?.full_name && <span>Driver: {booking.drivers.full_name}</span>}
                </div>

                {isExpanded && (
                  <div className="mb-3 p-3 rounded-xl bg-secondary/40 text-xs space-y-1 border border-border/40">
                    <div><span className="text-muted-foreground">Booking ID:</span> <span className="font-mono">{booking.id}</span></div>
                    {booking.customer_email && <div><span className="text-muted-foreground">Email:</span> {booking.customer_email}</div>}
                    <div><span className="text-muted-foreground">Booking type:</span> {booking.booking_type}</div>
                    {booking.hours != null && <div><span className="text-muted-foreground">Hours:</span> {booking.hours}</div>}
                    <div><span className="text-muted-foreground">Created:</span> {new Date(booking.created_at).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Updated:</span> {new Date(booking.updated_at).toLocaleString()}</div>
                    {booking.notes && (() => {
                      const display = formatNotes(booking.notes);
                      return display ? <div className="break-words"><span className="text-muted-foreground">Notes:</span> {display}</div> : null;
                    })()}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {["pending", "approved"].includes(booking.status) && (
                    <select
                      className="text-xs rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-foreground max-w-[180px]"
                      value={booking.driver_id || ""}
                      onChange={(e) => assignDriver(booking.id, e.target.value)}
                      disabled={isActioning}
                    >
                      <option value="">Assign Driver</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </select>
                  )}

                  {/* Quick status changer (any non-terminal status) */}
                  {!["cancelled", "completed"].includes(booking.status) && (
                    <select
                      className="text-xs rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-foreground"
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      disabled={isActioning}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  )}

                  {booking.status === "pending" && (
                    <Button size="sm" className="text-xs gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => updateStatus(booking.id, "approved")} disabled={isActioning}>
                      {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                    </Button>
                  )}
                  {booking.status === "in_progress" && (
                    <Button size="sm" className="text-xs gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => updateStatus(booking.id, "completed")} disabled={isActioning}>
                      {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Complete
                    </Button>
                  )}
                  {!["cancelled", "completed"].includes(booking.status) && (
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => updateStatus(booking.id, "cancelled")} disabled={isActioning}>
                      <XCircle className="w-3 h-3" /> Cancel
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs gap-1.5 rounded-xl ml-auto"
                    onClick={() => setExpanded(isExpanded ? null : booking.id)}
                  >
                    {isExpanded ? <>Hide details <ChevronUp className="w-3 h-3" /></> : <>Details <ChevronDown className="w-3 h-3" /></>}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
