import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit2, Phone, Mail, Lock, Eye, EyeOff, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";


interface Driver {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  is_active: boolean;
  created_at: string;
}

type DriverForm = {
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  password: string;
};

type FunctionErrorPayload = {
  error?: unknown;
  message?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeDriverForm = (form: DriverForm) => ({
  full_name: form.full_name.trim(),
  email: form.email.trim().toLowerCase(),
  phone: form.phone.trim(),
  license_number: form.license_number.trim(),
  password: form.password.trim(),
});

const getFunctionErrorMessage = async (error: unknown, response?: Response) => {
  const fallback = error instanceof Error && error.message ? error.message : "Something went wrong";
  const context =
    typeof error === "object" && error !== null && "context" in error
      ? (error as { context?: Response }).context
      : undefined;
  const errorResponse = response || context;

  if (!errorResponse || typeof errorResponse.clone !== "function") return fallback;

  try {
    const body = (await errorResponse.clone().json()) as FunctionErrorPayload;
    const serverMessage = [body.error, body.message].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (serverMessage) return serverMessage.trim();
  } catch {
    try {
      const text = await errorResponse.clone().text();
      if (text.trim()) return text.trim();
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const AdminDrivers = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    license_number: "",
    password: "",
  });

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });
    setDrivers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchDrivers();
  }, [isAdmin]);

  const resetForm = () => {
    setForm({ full_name: "", email: "", phone: "", license_number: "", password: "" });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleSave = async () => {
    const driverForm = normalizeDriverForm(form);

    if (!driverForm.full_name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    setSaving(true);
    let saved = false;

    try {
      if (editingId) {
        if (!driverForm.email) {
          toast({ title: "Email required for drivers", variant: "destructive" });
          return;
        }
        if (!EMAIL_PATTERN.test(driverForm.email)) {
          toast({ title: "Enter a valid email address", variant: "destructive" });
          return;
        }

        const { data, error, response } = await supabase.functions.invoke("manage-driver", {
          body: {
            action: "update",
            driver_id: editingId,
            full_name: driverForm.full_name,
            email: driverForm.email,
            phone: driverForm.phone || null,
            license_number: driverForm.license_number || null,
          },
        });

        if (error) {
          const description = await getFunctionErrorMessage(error, response);
          console.error("Update driver failed", { error, description });
          toast({ title: "Failed to update driver", description, variant: "destructive" });
          return;
        }

        if (data?.error) {
          toast({ title: "Failed to update driver", description: data.error, variant: "destructive" });
          return;
        }

        toast({ title: "Driver updated ✅" });
        saved = true;
      } else {
        // Creating new driver — call edge function to create auth user + driver + roles
        if (!driverForm.email) {
          toast({ title: "Email required for new drivers", variant: "destructive" });
          return;
        }
        if (!EMAIL_PATTERN.test(driverForm.email)) {
          toast({ title: "Enter a valid email address", variant: "destructive" });
          return;
        }
        if (!driverForm.password || driverForm.password.length < 6) {
          toast({ title: "Password must be at least 6 characters", variant: "destructive" });
          return;
        }

        const { data, error, response } = await supabase.functions.invoke("create-driver", {
          body: {
            email: driverForm.email,
            password: driverForm.password,
            full_name: driverForm.full_name,
            phone: driverForm.phone || null,
            license_number: driverForm.license_number || null,
          },
        });

        if (error) {
          const description = await getFunctionErrorMessage(error, response);
          console.error("Create driver failed", { error, description });
          toast({
            title: "Failed to create driver",
            description,
            variant: "destructive",
          });
          return;
        }

        if (data?.error) {
          toast({
            title: "Failed to create driver",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        toast({ title: "Driver account created ✅", description: `${driverForm.full_name} can now sign in with their email & password.` });
        saved = true;
      }

      if (saved) {
        resetForm();
        await fetchDrivers();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setForm({
      full_name: driver.full_name,
      email: driver.email || "",
      phone: driver.phone || "",
      license_number: driver.license_number || "",
      password: "",
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("drivers").update({ is_active: !current }).eq("id", id);
    if (error) {
      toast({ title: "Failed to update driver status", description: error.message, variant: "destructive" });
      return;
    }
    fetchDrivers();
  };

  const handleDelete = async (driver: Driver) => {
    setDeletingId(driver.id);
    try {
      const { data, error, response } = await supabase.functions.invoke("manage-driver", {
        body: {
          action: "delete",
          driver_id: driver.id,
        },
      });

      if (error) {
        const description = await getFunctionErrorMessage(error, response);
        console.error("Delete driver failed", { error, description });
        toast({ title: "Failed to delete driver", description, variant: "destructive" });
        return;
      }

      if (data?.error) {
        toast({ title: "Failed to delete driver", description: data.error, variant: "destructive" });
        return;
      }

      if (editingId === driver.id) resetForm();
      toast({ title: "Driver deleted", description: `${driver.full_name} was removed from the database.` });
      await fetchDrivers();
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Drivers</h1>
            <p className="text-muted-foreground mt-1">Manage your driver roster</p>
          </div>
          <Button
            variant="accent"
            className="gap-2"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Driver
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card border border-border p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">
              {editingId ? "Edit Driver" : "New Driver Account"}
            </h3>
            {!editingId && (
              <p className="text-sm text-muted-foreground">
                This will create a full login account for the driver. They'll be able to sign in with the email &amp; password you set below.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. Thabo Mthembu"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="driver@company.co.za"
                />
                {editingId && (
                  <p className="text-xs text-muted-foreground">Updating this email also updates the driver's login account.</p>
                )}
              </div>
              {!editingId && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Password *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+27 21 555 0001"
                />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                  placeholder="SA-DL-2024-001"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="accent" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Driver" : "Create Driver Account"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Drivers List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-card border border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No drivers yet. Add your first driver above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-card border border-border p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-medium text-foreground truncate">{driver.full_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${
                        driver.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {driver.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(driver)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(driver.id, driver.is_active)}
                      title={driver.is_active ? "Deactivate driver" : "Activate driver"}
                    >
                      <Power className={`w-4 h-4 ${driver.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                    <DeleteConfirmButton
                      itemName={driver.full_name}
                      itemType="driver"
                      onConfirm={() => handleDelete(driver)}
                      isDeleting={deletingId === driver.id}
                      className="h-8 w-8"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                  {driver.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{driver.email}</span>
                    </span>
                  )}
                  {driver.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0" /> {driver.phone}
                    </span>
                  )}
                  {driver.license_number && <span className="truncate">License: {driver.license_number}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminDrivers;
