import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Loader2, Save, Star, User, Phone, Mail, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import AuthNavbar from "@/components/AuthNavbar";

interface DriverData {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  avatar_url: string | null;
}

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string | null;
}

const DriverProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDriver, driverId, loading: driverLoading } = useDriverCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driver, setDriver] = useState<DriverData | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", license_number: "" });

  useEffect(() => {
    if (!authLoading && !driverLoading) {
      if (!user) navigate("/auth");
      else if (!isDriver) navigate("/dashboard");
    }
  }, [user, isDriver, authLoading, driverLoading, navigate]);

  useEffect(() => {
    if (!driverId) return;
    const load = async () => {
      // Load driver details
      const { data: driverData } = await supabase
        .from("drivers")
        .select("id, full_name, email, phone, license_number, avatar_url")
        .eq("id", driverId)
        .single();

      if (driverData) {
        setDriver(driverData);
        setForm({
          full_name: driverData.full_name || "",
          phone: driverData.phone || "",
          license_number: driverData.license_number || "",
        });
      }

      // Load ratings for this driver via bookings join
      const { data: bookingIds } = await supabase
        .from("bookings")
        .select("id, user_id")
        .eq("driver_id", driverId)
        .eq("status", "completed");

      if (bookingIds && bookingIds.length > 0) {
        const ids = bookingIds.map(b => b.id);
        const { data: ratingsData } = await supabase
          .from("booking_ratings")
          .select("id, rating, comment, created_at, booking_id")
          .in("booking_id", ids)
          .order("created_at", { ascending: false });

        if (ratingsData) {
          // Get customer names
          const userIds = [...new Set(bookingIds.map(b => b.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          const profileMap = new Map<string, string>();
          profiles?.forEach(p => { if (p.full_name) profileMap.set(p.id, p.full_name); });

          const bookingUserMap = new Map<string, string>();
          bookingIds.forEach(b => bookingUserMap.set(b.id, b.user_id));

          const enriched: Rating[] = ratingsData.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            customer_name: profileMap.get(bookingUserMap.get(r.booking_id) || "") || "Customer",
          }));
          setRatings(enriched);
        }
      }

      setLoading(false);
    };
    load();
  }, [driverId]);

  const handleSave = async () => {
    if (!driverId || !form.full_name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("drivers")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        license_number: form.license_number.trim() || null,
      })
      .eq("id", driverId);

    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setDriver(prev => prev ? { ...prev, ...form } : prev);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !driverId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/driver-avatar.${ext}`;
      const publicUrl = await uploadImage(file, "driver-photos", path, { cacheControl: "3600", upsert: true });
      await supabase.from("drivers").update({ avatar_url: publicUrl }).eq("id", driverId);
      setDriver(prev => prev ? { ...prev, avatar_url: publicUrl + "?t=" + Date.now() } : prev);
      toast({ title: "Photo updated!" });
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || driverLoading || !isDriver) return null;

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  const initials = (driver?.full_name || "D")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar role="driver" />

      <main className="container mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">My Profile</h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-secondary/50 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-border">
                    {driver?.avatar_url && <AvatarImage src={driver.avatar_url} alt={driver.full_name} />}
                    <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Rating Summary */}
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(Number(avgRating))
                              ? "fill-accent text-accent"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{avgRating}</span>
                    <span className="text-xs text-muted-foreground">({ratings.length} {ratings.length === 1 ? "review" : "reviews"})</span>
                  </div>
                )}
              </div>

              {/* Details Form */}
              <div className="rounded-2xl bg-card border border-border/50 p-5 sm:p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input value={driver?.email || ""} disabled className="rounded-xl opacity-60" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" /> License Number
                  </Label>
                  <Input
                    id="license"
                    value={form.license_number}
                    onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  variant="accent"
                  className="w-full rounded-xl gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>

              {/* Ratings & Reviews */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" /> Ratings & Reviews
                </h2>

                {ratings.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-card border border-border">
                    <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No ratings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ratings.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= r.rating ? "fill-accent text-accent" : "text-border"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-foreground">{r.customer_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">{r.comment}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DriverProfile;
