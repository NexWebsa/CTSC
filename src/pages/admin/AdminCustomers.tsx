import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  price_estimate: number | null;
  service_type: string;
  pickup_location: string;
  dropoff_location: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminCustomers = () => {
  const { isAdmin } = useAdminCheck();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id, user_id, pickup_date, pickup_time, status, price_estimate, service_type, pickup_location, dropoff_location").order("created_at", { ascending: false }),
    ]);

    const profiles = (profilesRes.data as Profile[]) || [];
    const customersOnly: Profile[] = [];

    for (const profile of profiles) {
      const [{ data: isAdmin }, { data: isDriver }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: profile.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: profile.id, _role: "driver" }),
      ]);
      
      // Only include if they are NOT admin and NOT driver
      if (!isAdmin && !isDriver) {
        customersOnly.push(profile);
      }
    }

    setCustomers(customersOnly);
    setBookings((bookingsRes.data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const channel = supabase
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const customerStats = useMemo(() => {
    const map = new Map<string, { count: number; lastBooking: string | null }>();
    bookings.forEach((booking) => {
      const existing = map.get(booking.user_id) || { count: 0, lastBooking: null };
      const bookingDate = `${booking.pickup_date} ${booking.pickup_time}`;
      map.set(booking.user_id, {
        count: existing.count + 1,
        lastBooking: existing.lastBooking && existing.lastBooking > bookingDate
          ? existing.lastBooking
          : bookingDate,
      });
    });
    return map;
  }, [bookings]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      if (!query) return true;
      const haystack = [customer.full_name, customer.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [customers, search]);

  const totalBookings = bookings.length;
  const uniqueCustomers = customers.length;
  const activeCustomers = filteredCustomers.length;

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">View customer profiles, booking counts, and recent trips.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Total customers</p>
          <p className="text-2xl font-bold text-foreground">{uniqueCustomers}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Total bookings</p>
          <p className="text-2xl font-bold text-foreground">{totalBookings}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Showing</p>
          <p className="text-2xl font-bold text-foreground">{activeCustomers}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email or phone"
            className="pl-9 rounded-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-card border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No customers match your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => {
            const stats = customerStats.get(customer.id) || { count: 0, lastBooking: null };
            const isOpen = expanded === customer.id;
            const customerBookings = bookings.filter((booking) => booking.user_id === customer.id).slice(0, 5);
            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl bg-card border border-border/50 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground truncate">{customer.full_name || "Unknown customer"}</h2>
                      <span className="text-xs text-muted-foreground">Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {customer.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="rounded-full bg-secondary/80 px-3 py-1 text-xs text-muted-foreground">{stats.count} bookings</div>
                    {stats.lastBooking && (
                      <div className="rounded-full bg-secondary/80 px-3 py-1 text-xs text-muted-foreground">Last: {stats.lastBooking}</div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setExpanded(isOpen ? null : customer.id)}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-background/50 p-4 border border-border/50">
                      <p className="text-sm font-medium text-foreground mb-2">Recent bookings</p>
                      {customerBookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No bookings for this customer yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {customerBookings.map((booking) => (
                            <div key={booking.id} className="rounded-2xl bg-card border border-border/50 p-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                                <span className="font-medium text-foreground">{booking.service_type.replace(/_/g, " ")}</span>
                                <span className="text-xs text-muted-foreground">{booking.pickup_date} • {booking.pickup_time}</span>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                                <span>{booking.pickup_location}</span>
                                {booking.dropoff_location && <span>→ {booking.dropoff_location}</span>}
                                <span>Status: {booking.status.replace(/_/g, " ")}</span>
                                {booking.price_estimate != null && <span>R{booking.price_estimate}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
