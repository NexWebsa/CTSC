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
// ─────────────────────────────────────────────
const formatSAPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
};

const formatIntlPhone = (raw: string): string => {
  return raw.replace(/\D/g, "").slice(0, 12);
};

// ─────────────────────────────────────────────
// Custom Date Picker
// ─────────────────────────────────────────────
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface DatePickerProps {
  value: string;
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
          "bg-background hover:border-accent/50 focus:outline-none",
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              thisDate.setHours(0, 0, 0, 0);
              const isDisabled = thisDate < min;
              const isSelected = parsed &&
                parsed.getFullYear() === viewYear &&
                parsed.getMonth() === viewMonth &&
                parsed.getDate() === day;
              const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
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
  value: string;
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

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setSelHour(h);
      setSelMin(m);
    }
  }, [value]);

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
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
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
          "bg-background hover:border-accent/50 focus:outline-none",
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
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">
              {displayValue
                ? <span className="text-accent">{displayValue}</span>
                : <span className="text-muted-foreground">Pick a time</span>
              }
            </p>
          </div>
          <div className="flex">
            <div className="flex-1 border-r border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Hour</p>
              <div ref={hourRef} className="overflow-y-auto h-48 py-1 scroll-smooth">
                {HOURS.map(h => {
                  const period = h >= 12 ? "PM" : "AM";
                  const display = h === 0 ? "12" : h > 12 ? String(h - 12) : String(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      data-hour={h}
                      onClick={() => selectTime(h, selMin ?? 0)}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left transition-colors duration-100",
                        selHour === h ? "bg-accent text-white font-semibold" : "hover:bg-accent/10 text-foreground"
                      )}
                    >
                      {display} {period}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Min</p>
              <div ref={minRef} className="overflow-y-auto h-48 py-1 scroll-smooth">
                {MINUTES.map(m => (
                  <button
                    key={m}
                    type="button"
                    data-min={m}
                    onClick={() => selectTime(selHour ?? 8, m)}
                    className={cn(
                      "w-full px-4 py-2 text-sm text-left transition-colors duration-100",
                      selMin === m ? "bg-accent text-white font-semibold" : "hover:bg-accent/10 text-foreground"
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
// Trip type options — grouped by service tab
// ─────────────────────────────────────────────
const SHUTTLE_TRIPS = [
  { value: "airport_transfers", label: "Airport Transfers" },
  { value: "shuttle_service", label: "Shuttle Service" },
  { value: "cape_town_tour", label: "Cape Town Tour" },
  { value: "other", label: "Other / Custom" },
];

const STAFF_TRIPS = [
  { value: "employee_transport", label: "Employee Transportation" },
  { value: "staff_shuttle", label: "Staff Shuttle Service" },
  { value: "other", label: "Other / Custom" },
];

// ─────────────────────────────────────────────
// Main BookingForm — original logic 100% preserved
// ─────────────────────────────────────────────
const BookingForm = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showReturnTrip, setShowReturnTrip] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Visual-only tab state — does NOT affect submit logic
  const [serviceTab, setServiceTab] = useState<"shuttle" | "staff">("shuttle");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+27",
    numPassengers: 1,
    tripType: "airport_transfers",
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
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // ── Original fetchVehicles — untouched ──
  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Could not load vehicles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  // ── Original fetchUserProfile — untouched ──
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
        let countryCode = "+27";
        let phoneNumber = "";
        if (data.phone) {
          // Handle +27 format
          if (data.phone.startsWith("+27")) {
            countryCode = "+27";
            phoneNumber = data.phone.substring(3); // Remove "+27"
          }
          // Handle 0 prefix (SA default format)
          else if (data.phone.startsWith("0")) {
            countryCode = "+27";
            phoneNumber = data.phone.substring(1); // Remove "0"
          }
          // Handle other country codes
          else {
            const match = data.phone.match(/^(\+\d{1,3})\s*(.*)$/);
            if (match) {
              countryCode = match[1];
              phoneNumber = match[2];
            } else {
              phoneNumber = data.phone;
            }
          }
        }
        // Format the phone number based on country code
        const isSA = countryCode === "+27";
        const digits = phoneNumber.replace(/\D/g, "").slice(0, isSA ? 9 : 12);
        const formattedPhone = isSA ? formatSAPhone(digits) : formatIntlPhone(digits);
        setFormData((prev) => ({
          ...prev,
          fullName: data.full_name || "",
          phone: formattedPhone,
          countryCode: countryCode,
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

  // ── Phone handler: numbers only + auto-format ──
  const handlePhoneChange = (raw: string) => {
    const isSA = formData.countryCode === "+27";
    const formatted = isSA ? formatSAPhone(raw) : formatIntlPhone(raw);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleCountryCodeChange = (code: string) => {
    const isSA = code === "+27";
    const digits = formData.phone.replace(/\D/g, "").slice(0, isSA ? 9 : 12);
    const formatted = isSA ? formatSAPhone(digits) : formatIntlPhone(digits);
    setFormData((prev) => ({ ...prev, countryCode: code, phone: formatted }));
  };

  // When switching tabs, reset tripType to first option in that category
  const handleTabChange = (tab: string) => {
    const next = tab as "shuttle" | "staff";
    setServiceTab(next);
    const firstTrip = next === "staff" ? STAFF_TRIPS[0] : SHUTTLE_TRIPS[0];
    setFormData((prev) => ({ ...prev, tripType: firstTrip.value }));
  };

  // ── Original handleSubmit — completely untouched ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to book.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.pickupAddress ||
      !formData.dropoffAddress ||
      !formData.pickupDate ||
      !formData.pickupTime ||
      !formData.vehicleId
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.tripType === "other" && !formData.extraDetails) {
      toast({
        title: "Details required",
        description: "Please provide details about your custom trip type.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update user profile with latest info
      const phoneNumber = `${formData.countryCode}${formData.phone.replace(/\s/g, "")}`;
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        phone: phoneNumber,
        updated_at: new Date().toISOString(),
      });

      // Prepare booking data
      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      const priceEstimate =
        formData.tripType === "airport_transfers"
          ? selectedVehicle?.price_per_km || 0
          : selectedVehicle?.price_per_hour || 0;

      // Build a clean, human-readable notes string
      const noteParts: string[] = [];
      if (formData.numPassengers && Number(formData.numPassengers) > 1) {
        noteParts.push(`Passengers: ${formData.numPassengers}`);
      }
      if (formData.flightNumber) {
        noteParts.push(`Flight: ${formData.flightNumber}`);
      }
      if (formData.extraDetails) {
        noteParts.push(formData.extraDetails);
      }
      if (showReturnTrip && formData.returnAddress) {
        noteParts.push(
          `Return trip: ${formData.returnAddress} → ${formData.returnDropoffAddress || "N/A"} on ${formData.returnDate || "N/A"} at ${formData.returnTime || "N/A"}`
        );
      }
      const bookingNotes = noteParts.length > 0 ? noteParts.join(" | ") : null;

      // Map trip types to service types (matching schema CHECK constraint)
      const serviceTypeMap: { [key: string]: string } = {
        airport_transfers: "airport_transfer",
        shuttle_service: "point_to_point",
        cape_town_tour: "point_to_point",
        employee_transport: "point_to_point",
        staff_shuttle: "point_to_point",
        other: "point_to_point",
      };

      const now = new Date().toISOString();
      const { data: insertedBooking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          vehicle_id: formData.vehicleId,
          service_type: serviceTypeMap[formData.tripType] || "point_to_point",
          booking_type: "transfer",
          pickup_location: formData.pickupAddress,
          dropoff_location: formData.dropoffAddress,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          status: "pending",
          price_estimate: priceEstimate,
          notes: bookingNotes,
          is_favourite: false,
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (error) throw error;

      const bookingId = insertedBooking.id;

      // 1) Create Yoco checkout (returns hosted checkout URL)
      const origin = window.location.origin;
      const { data: checkoutData, error: checkoutError } =
        await supabase.functions.invoke("create-yoco-checkout", {
          body: {
            bookingId,
            amount: priceEstimate,
            currency: "ZAR",
            successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
            cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
          },
        });

      if (checkoutError) throw checkoutError;

      const checkoutUrl =
        checkoutData?.checkoutUrl ||
        checkoutData?.checkout_url ||
        checkoutData?.redirectUrl ||
        checkoutData?.url;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from Yoco.");
      }

      // 2) Send booking email with payment link
      const { error: emailError } = await supabase.functions.invoke(
        "send-booking-email",
        {
          body: {
            bookingId,
            checkoutUrl,
            to: formData.email,
          },
        }
      );

      if (emailError) {
        console.error("Email send error:", emailError);
        toast({
          title: "Booking saved, email failed",
          description:
            "Your booking is created but we couldn't send the email. You can make the payment through the dashboard or feel free to contact us.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent!📧",
          description:
            "Check your inbox for the secure Yoco payment link to complete your booking. Or head to your dashboard to view your booking and make payment there.",
        });
      }

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        countryCode: "+27",
        numPassengers: 1,
        tripType: "airport_transfers",
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
      setShowReturnTrip(false);
      setAcceptedTerms(false);
      setServiceTab("shuttle");

      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentTrips = serviceTab === "staff" ? STAFF_TRIPS : SHUTTLE_TRIPS;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Service Category Tabs ── */}
      <div className="bg-card border border-border rounded-2xl p-1.5">
        <Tabs value={serviceTab} onValueChange={handleTabChange}>
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

      {/* ── Main form card ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* Section 1: Your Details */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={1} title="Your Details" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your@email.com"
                className="h-11"
                required
              />
            </div>

            {/* Phone with auto-formatter */}
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
                  {formData.countryCode === "+27" && (
                    <span className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none transition-colors",
                      formData.phone.replace(/\D/g, "").length === 9 ? "text-accent" : "text-muted-foreground/40"
                    )}>
                      {formData.phone.replace(/\D/g, "").length}/9
                    </span>
                  )}
                </div>
              </div>
              {formData.countryCode === "+27" && formData.phone && formData.phone.replace(/\D/g, "").length < 9 && (
                <p className="text-[11px] text-muted-foreground/60 pl-0.5">SA numbers are 9 digits — e.g. 72 123 4567</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Passengers *</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={formData.numPassengers}
                onChange={(e) => handleChange("numPassengers", parseInt(e.target.value))}
                className="h-11"
                required
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-6 sm:mx-8" />

        {/* Section 2: Trip Details */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={2} title="Trip Details" />

          {/* Trip type — driven by tab selection */}
          <div className="space-y-1.5 mb-5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip Type *</Label>
            <Select
              value={formData.tripType}
              onValueChange={(value) => handleChange("tripType", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a trip type" />
              </SelectTrigger>
              <SelectContent>
                {currentTrips.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Addresses */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" /> Pickup Address *
              </Label>
              <Input
                value={formData.pickupAddress}
                onChange={(e) => handleChange("pickupAddress", e.target.value)}
                placeholder="e.g., Cape Town International Airport"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground/40" /> Drop-off Address *
              </Label>
              <Input
                value={formData.dropoffAddress}
                onChange={(e) => handleChange("dropoffAddress", e.target.value)}
                placeholder="e.g., Hotel or destination"
                className="h-11"
                required
              />
            </div>
          </div>

          {/* Custom date + time pickers */}
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

        {/* Return Trip Toggle */}
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
                  <Input
                    value={formData.returnAddress}
                    onChange={(e) => handleChange("returnAddress", e.target.value)}
                    placeholder="e.g., Hotel"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-foreground/40" /> Return Drop-off
                  </Label>
                  <Input
                    value={formData.returnDropoffAddress}
                    onChange={(e) => handleChange("returnDropoffAddress", e.target.value)}
                    placeholder="e.g., Airport"
                    className="h-11"
                  />
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

        {/* Section 3: Additional Information */}
        <div className="p-6 sm:p-8">
          <SectionHeading step={3} title="Additional Information" />

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-accent" /> Flight Number
                <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</span>
              </Label>
              <Input
                value={formData.flightNumber}
                onChange={(e) => handleChange("flightNumber", e.target.value)}
                placeholder="e.g., SA123"
                className="h-11"
              />
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent" /> Extra Details
              {formData.tripType === "other"
                ? <span className="text-destructive">*</span>
                : <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">(optional)</span>
              }
            </Label>
            <Textarea
              value={formData.extraDetails}
              onChange={(e) => handleChange("extraDetails", e.target.value)}
              placeholder={
                formData.tripType === "other"
                  ? "Please describe your trip type and requirements..."
                  : "Flight details, special requirements, luggage info, etc."
              }
              rows={3}
              className="resize-none"
              required={formData.tripType === "other"}
            />
            <p className="text-xs text-muted-foreground pt-0.5">
              {formData.tripType === "other"
                ? "Required — please provide details about your custom trip type."
                : "Tell us anything else we should know about your booking."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Terms & Conditions checkbox ── */}
      <label className={cn(
        "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none",
        acceptedTerms
          ? "border-accent/40 bg-accent/5"
          : "border-border hover:border-accent/30 hover:bg-accent/[0.03]"
      )}>
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="sr-only"
          />
          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
            acceptedTerms
              ? "bg-accent border-accent"
              : "bg-background border-border"
          )}>
            {acceptedTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-sm text-muted-foreground leading-relaxed">
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium underline underline-offset-2 hover:text-accent/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Terms &amp; Conditions
          </a>{" "}
          . I understand that my booking is subject to availability and confirmation.
        </span>
      </label>

      {/* Submit buttons */}
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
    </form>
  );
};

export default BookingForm;