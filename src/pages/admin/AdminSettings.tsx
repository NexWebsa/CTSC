import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Edit2, CheckCircle, XCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";

interface TripType {
  id: string;
  name: string;
  description: string | null;
  service_type: string;
  is_active: boolean;
  created_at: string;
}

const SERVICE_TYPES = [
  { value: "airport_transfer", label: "Airport Transfer" },
  { value: "chauffeur", label: "Chauffeur Service" },
  { value: "point_to_point", label: "Point to Point" },
];

const AdminSettings = () => {
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", service_type: "airport_transfer", is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchTripTypes = async () => {
    const { data } = await supabase.from("trip_types").select("id, name, description, service_type, is_active, created_at").order("created_at", { ascending: false });
    setTripTypes((data as TripType[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchTripTypes();
  }, [isAdmin]);

  const resetForm = () => {
    setForm({ name: "", description: "", service_type: "airport_transfer", is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from("trip_types").update({
        name: form.name,
        description: form.description || null,
        service_type: form.service_type,
        is_active: form.is_active,
      }).eq("id", editingId);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Trip type updated" });
      }
    } else {
      const { error } = await supabase.from("trip_types").insert({
        name: form.name,
        description: form.description || null,
        service_type: form.service_type,
        is_active: form.is_active,
      });
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Trip type added" });
      }
    }

    setSaving(false);
    resetForm();
    fetchTripTypes();
  };

  const handleEdit = (type: TripType) => {
    setForm({
      name: type.name,
      description: type.description || "",
      service_type: type.service_type,
      is_active: type.is_active,
    });
    setEditingId(type.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("trip_types").update({ is_active: !active }).eq("id", id);
    fetchTripTypes();
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage trip types and booking settings.</p>
        </div>
        <Button variant="accent" className="gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> New Trip Type
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Settings className="w-4 h-4" /> {editingId ? "Edit Trip Type" : "Create Trip Type"}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cape Town Tour" />
            </div>
            <div className="space-y-2">
              <Label>Service Type</Label>
              <select
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm"
              >
                {SERVICE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the service offering" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant={form.is_active ? "accent" : "outline"} size="sm" className="rounded-full gap-2" onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}>
                {form.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {form.is_active ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="accent" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Trip Type" : "Create Trip Type"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Trip type configuration</h2>
            <p className="text-sm text-muted-foreground">Active trip types are available for booking.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : tripTypes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-secondary/50 text-muted-foreground">
            No trip types configured yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tripTypes.map((type) => (
              <div key={type.id} className="rounded-2xl border border-border/50 bg-background p-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{type.name}</p>
                    <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-xs text-muted-foreground">{type.service_type.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{type.description || "No description provided."}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-end">
                  <Button variant={type.is_active ? "ghost" : "outline"} size="sm" className="rounded-full gap-2" onClick={() => toggleActive(type.id, type.is_active)}>
                    {type.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {type.is_active ? "Active" : "Inactive"}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => handleEdit(type)}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
