import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck, CheckCircle, XCircle, Loader2, Search, ArrowUpDown,
  ChevronDown, ChevronUp, Filter, X as XIcon, CalendarClock, Car,
  CreditCard, Mail, MapPin, Phone, UserRound, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { formatNotes } from "@/lib/formatNotes";
import { sendTripAssignmentEmails } from "@/lib/driverTripAssignmentEmail";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";

interface Booking {
  id: string;
  user_id: string | null;
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
  is_guest?: boolean | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  extras?: { id: string; label: string; qty: number; unit_price: number; subtotal: number }[] | null;
  extras_total?: number | null;
  extra_stop?: boolean | null;
  extra_stop_location?: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { name: string } | null;
  drivers?: { full_name: string } | null;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface Driver {
  id: string;
  full_name: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone?: string | null;
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

const bookingReference = (id: string) => id.slice(0, 8).toUpperCase();

const formatMoney = (value: number | null | undefined) =>
  value != null ? `R${Number(value).toFixed(2)}` : "No estimate";

const paymentStatusClasses = (status: string | null | undefined) => {
  if (status === "paid") return "bg-green-500/10 text-green-600 border-green-500/20";
  if (status === "failed") return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
};

const paymentLabel = (status: string | null | undefined) =>
  status ? status.replace(/_/g, " ") : "unpaid";

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </div>
    <div className="mt-1 text-sm font-medium text-foreground break-words">{value || "-"}</div>
  </div>
);

const LocationBlock = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
      <MapPin className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </div>
    <div className="mt-1 text-sm font-semibold text-foreground break-words">{value || "-"}</div>
  </div>
);

const AdminBookings = () => {
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
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
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, payment_status, notes, is_guest, guest_name, guest_email, guest_phone, extras, extras_total, extra_stop, extra_stop_location, created_at, updated_at, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("is_active", true),
      supabase.from("profiles").select("id, full_name, phone"),
    ]);
    const profileMap = new Map<string, { name: string; email: string; phone: string }>();
    (profilesRes.data as Profile[] || []).forEach(p => {
      profileMap.set(p.id, { name: p.full_name || "Unknown", email: "", phone: p.phone || "" });
    });
    const enriched = ((bookingsRes.data as unknown as Booking[]) || []).map(b => {
      if (b.is_guest) {
        return { ...b, customer_name: b.guest_name || "Guest", customer_email: b.guest_email || "", customer_phone: b.guest_phone || "" };
      }
      const p = b.user_id ? profileMap.get(b.user_id) : undefined;
      return { ...b, customer_name: p?.name || "Unknown", customer_email: p?.email || "", customer_phone: p?.phone || "" };
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
    const { error } = await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Failed to update booking", description: error.message, variant: "destructive" });
    setActionLoading(null);
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    if (!driverId) return;

    setActionLoading(bookingId);
    try {
      const { error } = await supabase.from("bookings").update({
        driver_id: driverId,
        status: "driver_assigned",
        updated_at: new Date().toISOString(),
      }).eq("id", bookingId);

      if (error) {
        toast({ title: "Failed to assign driver", description: error.message, variant: "destructive" });
        return;
      }

      const emailResult = await sendTripAssignmentEmails(bookingId, driverId);
      const emailFailures = [
        emailResult.driver.sent ? null : `Driver email: ${emailResult.driver.error}`,
        emailResult.customer.sent ? null : `Customer email: ${emailResult.customer.error}`,
      ].filter(Boolean);

      if (emailFailures.length) {
        console.error("Trip assignment email failure", { bookingId, driverId, emailResult });
        toast({
          title: "Driver assigned, some emails not sent",
          description: emailFailures.join(" | "),
          variant: "destructive",
        });
      } else {
        toast({ title: "Driver assigned", description: "Trip details emailed to the driver and customer." });
      }

      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBooking = async (booking: Booking) => {
    setActionLoading(booking.id);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
      if (error) {
        toast({ title: "Failed to delete booking", description: error.message, variant: "destructive" });
        return;
      }

      if (expanded === booking.id) setExpanded(null);
      toast({ title: "Booking deleted", description: `${booking.customer_name || "Booking"} was removed from the database.` });
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = bookings.filter(b => {
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">Booking reference</p>
                    <p className="font-mono text-sm font-bold text-foreground">#{bookingReference(booking.id)}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground">Estimated total</p>
                    <p className="text-lg font-bold text-accent">{formatMoney(booking.price_estimate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap border-b border-border/60 pb-3 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
                    {booking.status.replace(/_/g, " ")}
                  </span>
                  {booking.is_guest && (
                    <span className="hidden">
                      👤 Guest
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
                  {booking.payment_status && (
                    <span className="hidden">
                      {booking.payment_status === "paid" ? "💳 Paid" : booking.payment_status === "failed" ? "💳 Failed" : "💳 Unpaid"}
                    </span>
                  )}
                  {booking.price_estimate != null && (
                    <span className="hidden">R{booking.price_estimate}</span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 border-b border-border/60 pb-4 mb-4">
                  <LocationBlock label="Pickup" value={booking.pickup_location} />
                  <LocationBlock label="Drop-off" value={booking.dropoff_location || "Not specified"} />
                </div>

                <p className="hidden">
                  {booking.pickup_location}
                  {booking.dropoff_location && <span className="text-muted-foreground"> → {booking.dropoff_location}</span>}
                </p>

                <div className="grid gap-3 border-b border-border/60 pb-4 mb-4 sm:grid-cols-2 lg:grid-cols-5">
                  <DetailItem icon={CalendarClock} label="Pickup time" value={`${booking.pickup_date} at ${booking.pickup_time}`} />
                  <DetailItem
                    icon={UserRound}
                    label={booking.is_guest ? "Guest" : "Customer"}
                    value={
                      <>
                        {booking.customer_name || "Unknown"}
                        {booking.customer_phone && (
                          <span className="block text-xs font-normal text-muted-foreground">{booking.customer_phone}</span>
                        )}
                      </>
                    }
                  />
                  <DetailItem icon={Car} label="Vehicle" value={booking.vehicles?.name || "Not assigned"} />
                  <DetailItem icon={UserRound} label="Driver" value={booking.drivers?.full_name || "Not assigned"} />
                  <DetailItem
                    icon={CreditCard}
                    label="Payment"
                    value={
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${paymentStatusClasses(booking.payment_status)}`}>
                        {paymentLabel(booking.payment_status)}
                      </span>
                    }
                  />
                </div>

                <div className="hidden">
                  <span>{booking.pickup_date} at {booking.pickup_time}</span>
                  <span>
                    {booking.is_guest ? "Guest" : "Customer"}: {booking.customer_name}
                    {booking.customer_phone && <span className="ml-1">· {booking.customer_phone}</span>}
                  </span>
                  {booking.vehicles?.name && <span>Vehicle: {booking.vehicles.name}</span>}
                  {booking.drivers?.full_name && <span>Driver: {booking.drivers.full_name}</span>}
                </div>

                {isExpanded && (
                  <div className="grid gap-2 border-b border-border/60 pb-4 mb-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <div><span className="text-muted-foreground">Booking ID:</span> <span className="font-mono">{booking.id}</span></div>
                    <div><span className="text-muted-foreground">Booked by:</span> {booking.is_guest ? "Guest (no account)" : "Registered user"}</div>
                    {booking.customer_email && <div><span className="text-muted-foreground">Email:</span> {booking.customer_email}</div>}
                    {booking.customer_phone && <div><span className="text-muted-foreground">Phone:</span> {booking.customer_phone}</div>}
                    <div><span className="text-muted-foreground">Booking type:</span> {booking.booking_type}</div>
                    {booking.hours != null && <div><span className="text-muted-foreground">Hours:</span> {booking.hours}</div>}
                    <div><span className="text-muted-foreground">Created:</span> {new Date(booking.created_at).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Updated:</span> {new Date(booking.updated_at).toLocaleString()}</div>
                    {Array.isArray(booking.extras) && booking.extras.length > 0 && (
                      <div className="break-words">
                        <span className="text-muted-foreground">Extras:</span>{" "}
                        {booking.extras.map(e => `${e.label}${e.qty > 1 ? ` ×${e.qty}` : ""} (R${e.subtotal})`).join(", ")}
                      </div>
                    )}
                    {booking.extra_stop && (
                      <div className="break-words">
                        <span className="text-muted-foreground">Extra stop:</span>{" "}
                        {booking.extra_stop_location || "(no address)"} (+R100)
                      </div>
                    )}
                    {booking.extras_total != null && Number(booking.extras_total) > 0 && (
                      <div><span className="text-muted-foreground">Extras total:</span> R{booking.extras_total}</div>
                    )}
                    {booking.notes && (() => {
                      const display = formatNotes(booking.notes);
                      return display ? <div className="break-words"><span className="text-muted-foreground">Notes:</span> {display}</div> : null;
                    })()}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-full text-[11px] font-semibold uppercase text-muted-foreground">Dispatch controls</div>
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

                  <DeleteConfirmButton
                    itemName={`booking for ${booking.customer_name || "Unknown"} on ${booking.pickup_date}`}
                    itemType="booking"
                    onConfirm={() => deleteBooking(booking)}
                    disabled={isActioning}
                    isDeleting={isActioning}
                    size="sm"
                    showLabel
                    className="text-xs gap-1.5 rounded-xl ml-auto text-destructive border border-destructive/30 hover:bg-destructive/10"
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs gap-1.5 rounded-xl"
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
