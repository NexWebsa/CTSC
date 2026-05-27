import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Truck, Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";


interface Vehicle {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  image_url: string | null;
  price_per_km: number | null;
  price_per_hour: number | null;
  is_active: boolean;
  created_at: string;
}

const AdminFleet = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", capacity: "4", price_per_km: "", price_per_hour: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    setVehicles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchVehicles();
  }, [isAdmin]);

  const resetForm = () => {
    setForm({ name: "", description: "", capacity: "4", price_per_km: "", price_per_hour: "", image_url: "" });
    setEditingId(null);
    setShowForm(false);
    setPreviewUrl(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `vehicles/${Date.now()}.${ext}`;
      const publicUrl = await uploadImage(file, "vehicle-images", path, { cacheControl: "3600", upsert: true });
      setForm(prev => ({ ...prev, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      capacity: parseInt(form.capacity) || 4,
      price_per_km: form.price_per_km ? parseFloat(form.price_per_km) : null,
      price_per_hour: form.price_per_hour ? parseFloat(form.price_per_hour) : null,
      image_url: form.image_url || null,
    };

    if (editingId) {
      await supabase.from("vehicles").update(payload).eq("id", editingId);
      toast({ title: "Vehicle updated" });
    } else {
      await supabase.from("vehicles").insert(payload);
      toast({ title: "Vehicle added" });
    }
    resetForm();
    fetchVehicles();
  };

  const handleEdit = (v: Vehicle) => {
    setForm({
      name: v.name,
      description: v.description || "",
      capacity: String(v.capacity),
      price_per_km: v.price_per_km ? String(v.price_per_km) : "",
      price_per_hour: v.price_per_hour ? String(v.price_per_hour) : "",
      image_url: v.image_url || "",
    });
    setPreviewUrl(v.image_url || null);
    setEditingId(v.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("vehicles").update({ is_active: !current }).eq("id", id);
    fetchVehicles();
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fleet</h1>
            <p className="text-muted-foreground mt-1">Manage vehicles</p>
          </div>
          <Button variant="accent" className="gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{editingId ? "Edit Vehicle" : "New Vehicle"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price per KM (R)</Label>
                <Input type="number" step="0.01" value={form.price_per_km} onChange={(e) => setForm({ ...form, price_per_km: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price per Hour (R)</Label>
                <Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Vehicle Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img src={previewUrl} alt="Vehicle" className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => { setPreviewUrl(null); setForm(prev => ({ ...prev, image_url: "" })); }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-5 h-5" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="accent" onClick={handleSave}>{editingId ? "Update" : "Add"} Vehicle</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-card border border-border">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{v.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${v.is_active ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {v.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(v.id, v.is_active)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Capacity: {v.capacity} passengers</p>
                  {v.price_per_km && <p>R{v.price_per_km}/km</p>}
                  {v.price_per_hour && <p>R{v.price_per_hour}/hour</p>}
                  {v.description && <p>{v.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminFleet;