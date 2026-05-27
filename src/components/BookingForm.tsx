import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Check,
  MapPin,
  Clock,
  Calendar,
  Users,
  Plane,
  FileText,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TermsContent from "@/components/TermsContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  price_per_km: number;
  price_per_hour: number;
}

interface TripType {
  id: string;
  name: string;
  description: string | null;
  service_type: "airport_transfer" | "chauffeur" | "point_to_point";
}

// ─────────────────────────────────────────────
// Section heading helper
// ─────────────────────────────────────────────
const SectionHeading = ({ step, title }: { step: number; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
      {step}
    </span>
    <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─────────────────────────────────────────────
// Phone number formatter
// Formats raw digits as SA: XX XXX XXXX (9 digits)
// or international: strips to raw digits
// ─────────────────────────────────────────────
const formatSAPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
};

const formatIntlPhone = (raw: string): string => {
  // For non-SA codes just strip non-digits and limit to 12
  return raw.replace(/\D/g, "").slice(0, 12);
};

// ─────────────────────────────────────────────
// Custom Date Picker
// ─────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_OF_WEEK = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: Date;
}

const DatePicker = ({ value, onChange, placeholder = "Select date", minDate }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate || today;

  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onChange(str);
    setOpen(false);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full h-11 px-3 rounded-lg border text-sm flex items-center justify-between gap-2 transition-all duration-200",
          "bg-background hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
          open ? "border-accent ring-2 ring-accent/20" : "border-input",
          !displayValue && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent shrink-0" />
          {displayValue || placeholder}
        </span>
        <ChevronRight className={cn("w-4 h-4 text-muted-foreground/50 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 w-72 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              thisDate.setHours(0,0,0,0);
              const isDisabled = thisDate < min;
              const isSelected = parsed &&
                parsed.getFullYear() === viewYear &&
                parsed.getMonth() === viewMonth &&
                parsed.getDate() === day;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "w-full aspect-square rounded-lg text-sm transition-all duration-150 font-medium",
                    isSelected && "bg-accent text-white shadow-sm",
                    !isSelected && !isDisabled && isToday && "border border-accent/40 text-accent",
                    !isSelected && !isDisabled && !isToday && "hover:bg-accent/10 text-foreground",
                    isDisabled && "text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Custom Time Picker
// ─────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (val: string) => void;
  placeholder?: string;
}

const TimePicker = ({ value, onChange, placeholder = "Select time" }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  const [selHour, setSelHour] = useState<number | null>(null);
  const [selMin, setSelMin] = useState<number | null>(null);

  // Parse existing value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setSelHour(h);
      setSelMin(m);
    }
  }, [value]);

  // Scroll selected hour/minute into center when opening
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      if (selHour !== null && hourRef.current) {
        const btn = hourRef.current.querySelector(`[data-hour="${selHour}"]`) as HTMLElement;
        btn?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (selMin !== null && minRef.current) {
        const btn = minRef.current.querySelector(`[data-min="${selMin}"]`) as HTMLElement;
        btn?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 50);
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectTime = (h: number, m: number) => {
    setSelHour(h);
    setSelMin(m);
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const formatDisplay = (h: number | null, m: number | null) => {
    if (h === null || m === null) return "";
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
  };

  const displayValue = formatDisplay(selHour, selMin);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full h-11 px-3 rounded-lg border text-sm flex items-center justify-between gap-2 transition-all duration-200",
          "bg-background hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
          open ? "border-accent ring-2 ring-accent/20" : "border-input",
          !displayValue && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent shrink-0" />
          {displayValue || placeholder}
        </span>
        <ChevronRight className={cn("w-4 h-4 text-muted-foreground/50 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden w-64">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {displayValue ? (
                <span className="text-accent">{displayValue}</span>
              ) : (
                <span className="text-muted-foreground">Pick a time</span>
              )}
            </p>
          </div>

          <div className="flex">
            {/* Hours column */}
            <div className="flex-1 border-r border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Hour</p>
              <div ref={hourRef} className="overflow-y-auto h-48 py-1 scroll-smooth">
                {HOURS.map(h => {
                  const period = h >= 12 ? "PM" : "AM";
                  const display = h === 0 ? "12" : h > 12 ? String(h - 12) : String(h);
                  const label = `${display} ${period}`;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-hour={h}
                      onClick={() => {
                        const m = selMin ?? 0;
                        selectTime(h, m);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left transition-colors duration-100",
                        selHour === h
                          ? "bg-accent text-white font-semibold"
                          : "hover:bg-accent/10 text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes column */}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Min</p>
              <div ref={minRef} className="overflow-y-auto h-48 py-1 scroll-smooth">
                {MINUTES.map(m => (
                  <button
                    key={m}
                    type="button"
                    data-min={m}
                    onClick={() => {
                      const h = selHour ?? 8;
                      selectTime(h, m);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-sm text-left transition-colors duration-100",
                      selMin === m
                        ? "bg-accent text-white font-semibold"
                        : "hover:bg-accent/10 text-foreground"
                    )}
                  >
                    :{String(m).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const BookingForm = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showReturnTrip, setShowReturnTrip] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingTripTypes, setLoadingTripTypes] = useState(true);
  const [serviceCategory, setServiceCategory] = useState<"shuttle" | "staff">("shuttle");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const isStaffTrip = (name: string) => {
    const n = name.toLowerCase().trim();
    return (
      n.includes("employee") ||
      n.includes("staff shuttle") ||
      n.includes("staff transport")
    );
  };

  const filteredTripTypes = tripTypes.filter((t) =>
    serviceCategory === "staff" ? isStaffTrip(t.name) : !isStaffTrip(t.name)
  );

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+27",
    numPassengers: 1,
    tripType: "",
    pickupAddress: "",
    dropoffAddress: "",
    pickupDate: "",
    pickupTime: "",
    returnAddress: "",
    returnDropoffAddress: "",
    returnDate: "",
    returnTime: "",
    flightNumber: "",
    vehicleId: "",
    extraDetails: "",
  });

  useEffect(() => {
    fetchVehicles();
    fetchTripTypes();
    if (user) fetchUserProfile();
  }, [user]);

  const fetchTripTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("trip_types")
        .select("id, name, description, service_type")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const list = (data || []) as TripType[];
      setTripTypes(list);
      const firstShuttle = list.find((t) => !isStaffTrip(t.name));
      setFormData((prev) =>
        prev.tripType ? prev : { ...prev, tripType: firstShuttle?.id || list[0]?.id || "" }
      );
    } catch (error) {
      console.error("Error fetching trip types:", error);
      toast({ title: "Error", description: "Could not load trip types.", variant: "destructive" });
    } finally {
      setLoadingTripTypes(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase.from("vehicles").select("*").eq("is_active", true);
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({ title: "Error", description: "Could not load vehicles.", variant: "destructive" });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      if (data) {
        setFormData((prev) => ({
          ...prev,
          fullName: data.full_name || "",
          phone: data.phone || "",
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Phone input handler: numbers only, auto-format per country code ──
  const handlePhoneChange = (raw: string) => {
    const isSA = formData.countryCode === "+27";
    const formatted = isSA ? formatSAPhone(raw) : formatIntlPhone(raw);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  // When country code changes, reformat the existing phone number
  const handleCountryCodeChange = (code: string) => {
    const isSA = code === "+27";
    const digits = formData.phone.replace(/\D/g, "").slice(0, isSA ? 9 : 12);
    const formatted = isSA ? formatSAPhone(digits) : formatIntlPhone(digits);
    setFormData((prev) => ({ ...prev, countryCode: code, phone: formatted }));
  };

  const handleServiceCategoryChange = (value: string) => {
    const next = value as "shuttle" | "staff";
    setServiceCategory(next);
    const firstInCategory = tripTypes.find((t) =>
      next === "staff" ? isStaffTrip(t.name) : !isStaffTrip(t.name)
    );
    setFormData((prev) => ({ ...prev, tripType: firstInCategory?.id || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to book.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.pickupAddress ||
        !formData.dropoffAddress || !formData.pickupDate || !formData.pickupTime || !formData.vehicleId) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const selectedTripType = tripTypes.find((t) => t.id === formData.tripType);
    const isCustomTrip =
      selectedTripType?.name?.toLowerCase().includes("custom") ||
      selectedTripType?.name?.toLowerCase().includes("other");

    if (isCustomTrip && !formData.extraDetails) {
      toast({ title: "Details required", description: "Please provide details about your custom trip type.", variant: "destructive" });
      return;
    }

    if (!acceptedTerms) {
      toast({ title: "Please accept the Terms & Conditions", description: "You must agree to our Terms & Conditions.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const phoneNumber = `${formData.countryCode}${formData.phone.replace(/\s/g, "")}`;
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        phone: phoneNumber,
        updated_at: new Date().toISOString(),
      });

      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      const serviceType = selectedTripType?.service_type || "point_to_point";
      const priceEstimate =
        serviceType === "airport_transfer"
          ? selectedVehicle?.price_per_km || 0
          : selectedVehicle?.price_per_hour || 0;

      const noteParts: string[] = [];
      if (selectedTripType?.name) noteParts.push(`Trip Type: ${selectedTripType.name}`);
      if (formData.numPassengers && Number(formData.numPassengers) > 1) noteParts.push(`Passengers: ${formData.numPassengers}`);
      if (formData.flightNumber) noteParts.push(`Flight: ${formData.flightNumber}`);
      if (formData.extraDetails) noteParts.push(formData.extraDetails);
      if (showReturnTrip && formData.returnAddress) {
        noteParts.push(`Return trip: ${formData.returnAddress} → ${formData.returnDropoffAddress || "N/A"} on ${formData.returnDate || "N/A"} at ${formData.returnTime || "N/A"}`);
      }
      const bookingNotes = noteParts.length > 0 ? noteParts.join(" | ") : null;

      const now = new Date().toISOString();
      const bookingId = crypto.randomUUID();

      // CREATE YOCO CHECKOUT FIRST (before saving booking to database)
      // This prevents orphaned bookings if Yoco checkout fails
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-yoco-checkout", {
        body: { bookingId },
      });

      if (checkoutError) throw checkoutError;

      const checkoutId = checkoutData?.checkoutId;
      const checkoutUrl = checkoutData?.redirectUrl;
      if (!checkoutId || !checkoutUrl) throw new Error("No checkout data returned from Yoco.");

      // NOW save the booking to the database (only after Yoco succeeds)
      const { error } = await supabase.from("bookings").insert({
        id: bookingId,
        user_id: user.id,
        vehicle_id: formData.vehicleId,
        service_type: serviceType,
        booking_type: "transfer",
        pickup_location: formData.pickupAddress,
        dropoff_location: formData.dropoffAddress,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        status: "pending",
        price_estimate: priceEstimate,
        notes: bookingNotes,
        is_favourite: false,
        payment_status: "unpaid",
        yoco_checkout_id: checkoutId,
        created_at: now,
        updated_at: now,
      });

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke("send-booking-email", {
        body: { bookingId, checkoutUrl, to: formData.email },
      });

      if (emailError) {
        toast({ title: "Booking saved, email failed", description: "Booking created but we couldn't send the email.", variant: "destructive" });
      } else {
        toast({ title: "Email sent! 📧", description: "Check your inbox for the secure Yoco payment link." });
      }

      const firstShuttle = tripTypes.find((t) => !isStaffTrip(t.name));
      setFormData({
        fullName: "", email: "", phone: "", countryCode: "+27", numPassengers: 1,
        tripType: firstShuttle?.id || tripTypes[0]?.id || "",
        pickupAddress: "", dropoffAddress: "", pickupDate: "", pickupTime: "",
        returnAddress: "", returnDropoffAddress: "", returnDate: "", returnTime: "",
        flightNumber: "", vehicleId: "", extraDetails: "",
      });
      setShowReturnTrip(false);
      setServiceCategory("shuttle");
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: error instanceof Error ? error.message : "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Service Category Tabs */}
      <div className="bg-card border border-border rounded-2xl p-1.5">
        <Tabs value={serviceCategory} onValueChange={handleServiceCategoryChange}>
          <TabsList className="grid w-full grid-cols-2 h-12 p-0 bg-transparent gap-1.5">
            <TabsTrigger
              value="shuttle"
              className="h-11 text-sm font-semibold rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
            >
              Shuttle Service
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="h-11 text-sm font-semibold rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
            >
              Staff Service
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main form card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* ── Section 1: Your Details ── */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={1} title="Your Details" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</Label>
              <Input value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Enter your full name" className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="your@email.com" className="h-11" required />
            </div>

            {/* ── Phone field with auto-formatter ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number *</Label>
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={handleCountryCodeChange}>
                  <SelectTrigger className="w-24 h-11 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+27">+27</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+33">+33</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={formData.countryCode === "+27" ? "72 123 4567" : "Enter number"}
                    className="h-11 w-full"
                    required
                  />
                  {/* digit counter for SA */}
                  {formData.countryCode === "+27" && (
                    <span className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none transition-colors",
                      formData.phone.replace(/\D/g, "").length === 9
                        ? "text-accent"
                        : "text-muted-foreground/40"
                    )}>
                      {formData.phone.replace(/\D/g, "").length}/9
                    </span>
                  )}
                </div>
              </div>
              {formData.countryCode === "+27" && formData.phone && formData.phone.replace(/\D/g, "").length < 9 && (
                <p className="text-[11px] text-muted-foreground/60 pl-0.5">
                  SA numbers are 9 digits — e.g. 72 123 4567
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Passengers *</span>
              </Label>
              <Input type="number" min="1" max="8" value={formData.numPassengers} onChange={(e) => handleChange("numPassengers", parseInt(e.target.value))} className="h-11" required />
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-6 sm:mx-8" />

        {/* ── Section 2: Trip Details ── */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={2} title="Trip Details" />

          <div className="space-y-1.5 mb-5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip Type *</Label>
            <Select value={formData.tripType} onValueChange={(value) => handleChange("tripType", value)} disabled={loadingTripTypes}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={loadingTripTypes ? "Loading trip types..." : "Choose a trip type"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTripTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(() => {
              const sel = tripTypes.find((t) => t.id === formData.tripType);
              return sel?.description ? (
                <p className="text-xs text-muted-foreground mt-1.5 pl-1">{sel.description}</p>
              ) : null;
            })()}
          </div>

          <div className="relative mb-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> Pickup Address *
                </Label>
                <Input value={formData.pickupAddress} onChange={(e) => handleChange("pickupAddress", e.target.value)} placeholder="e.g., Cape Town International Airport" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foreground/40" /> Drop-off Address *
                </Label>
                <Input value={formData.dropoffAddress} onChange={(e) => handleChange("dropoffAddress", e.target.value)} placeholder="e.g., Hotel or destination" className="h-11" required />
              </div>
            </div>
          </div>

          {/* ── Custom Date + Time pickers ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Pickup Date *
              </Label>
              <DatePicker
                value={formData.pickupDate}
                onChange={(val) => handleChange("pickupDate", val)}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" /> Pickup Time *
              </Label>
              <TimePicker
                value={formData.pickupTime}
                onChange={(val) => handleChange("pickupTime", val)}
                placeholder="Select time"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-6 sm:mx-8" />

        {/* ── Return Trip Toggle ── */}
        <div className="px-6 sm:px-8 py-5">
          <button
            type="button"
            onClick={() => setShowReturnTrip(!showReturnTrip)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium",
              showReturnTrip
                ? "border-accent/40 bg-accent/5 text-accent"
                : "border-dashed border-border hover:border-accent/40 hover:bg-accent/5 text-muted-foreground hover:text-accent"
            )}
          >
            <span className="flex items-center gap-2">
              {showReturnTrip ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showReturnTrip ? "Remove Return Trip" : "Add Return Trip (Optional)"}
            </span>
            {!showReturnTrip && <ChevronRight className="w-4 h-4 opacity-50" />}
          </button>

          {showReturnTrip && (
            <div className="mt-4 space-y-4 p-5 bg-background/60 rounded-xl border border-border/70">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> Return Pickup
                  </Label>
                  <Input value={formData.returnAddress} onChange={(e) => handleChange("returnAddress", e.target.value)} placeholder="e.g., Hotel" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-foreground/40" /> Return Drop-off
                  </Label>
                  <Input value={formData.returnDropoffAddress} onChange={(e) => handleChange("returnDropoffAddress", e.target.value)} placeholder="e.g., Airport" className="h-11" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" /> Return Date
                  </Label>
                  <DatePicker
                    value={formData.returnDate}
                    onChange={(val) => handleChange("returnDate", val)}
                    placeholder="Select date"
                    minDate={formData.pickupDate ? new Date(formData.pickupDate + "T00:00:00") : undefined}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" /> Return Time
                  </Label>
                  <TimePicker
                    value={formData.returnTime}
                    onChange={(val) => handleChange("returnTime", val)}
                    placeholder="Select time"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border mx-6 sm:mx-8" />

        {/* ── Section 3: Additional Info ── */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={3} title="Additional Information" />

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-accent" /> Flight Number
                <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</span>
              </Label>
              <Input value={formData.flightNumber} onChange={(e) => handleChange("flightNumber", e.target.value)} placeholder="e.g., SA123" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferred Vehicle *</Label>
              {loadingVehicles ? (
                <div className="h-11 flex items-center justify-center bg-background rounded-lg border border-border">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                </div>
              ) : (
                <Select value={formData.vehicleId} onValueChange={(value) => handleChange("vehicleId", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.capacity} passengers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {(() => {
            const selectedTrip = tripTypes.find((t) => t.id === formData.tripType);
            const isCustomTrip =
              !!selectedTrip &&
              (selectedTrip.name.toLowerCase().includes("custom") ||
                selectedTrip.name.toLowerCase().includes("other"));
            return (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" /> Extra Details
                  {isCustomTrip ? <span className="text-destructive">*</span> : <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</span>}
                </Label>
                <Textarea
                  value={formData.extraDetails}
                  onChange={(e) => handleChange("extraDetails", e.target.value)}
                  placeholder={isCustomTrip ? "Please describe your custom trip — destinations, schedule, group size, special requirements..." : "Flight details, special requirements, luggage info, etc."}
                  rows={3}
                  className="resize-none"
                  required={isCustomTrip}
                />
                <p className="text-xs text-muted-foreground pt-0.5">
                  {isCustomTrip ? "Required — please provide full details so we can tailor your trip." : "Tell us anything else we should know about your booking."}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-3 bg-card border border-border rounded-xl px-5 py-4 hover:border-accent/25 transition-colors">
        <Checkbox
          id="accept-terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="accept-terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-accent font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Terms &amp; Conditions
          </button>
          .
        </Label>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={() => navigate("/")} className="px-6">
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={submitting || loadingVehicles || !acceptedTerms}
          className="flex-1 gap-2 font-semibold"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Check className="w-4 h-4" /> Book Now</>
          )}
        </Button>
      </div>

      {/* Terms Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
            <DialogTitle className="text-xl font-bold">Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] px-6 py-5">
            <TermsContent />
          </ScrollArea>
          <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setTermsOpen(false)}>Close</Button>
            <Button type="button" onClick={() => { setAcceptedTerms(true); setTermsOpen(false); }}>
              <Check className="w-4 h-4 mr-2" /> I Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default BookingForm;