import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Calendar, Check, Info, Plus, Minus,
  Loader2, MapPin, Plane, Users, Car, Briefcase, BabyIcon,
  ShieldCheck, Mail, Phone, UserCircle2, ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { DatePicker, TimePicker } from "./DateTimePickers";
import {
  Vehicle, formatZAR, quoteVehicle,
  EXTRAS, EXTRA_STOP_PRICE, computeExtrasTotal,
} from "@/lib/pricing";

type ServiceTab = "airport_transfer" | "point_to_point" | "chauffeur";
type Direction = "one_way" | "return";

interface TripData {
  serviceType: ServiceTab;
  direction: Direction;
  trailer: boolean;
  oversizeLuggage: boolean;
  passengers: number;
  babySeats: number;
  luggageCheckin: number;
  luggageCarry: number;
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  endTime: string;
  returnDate: string;
  returnTime: string;
  hours: number;
  pointsOfInterest: string;
  distanceKm: number | null;
  durationMinutes: number | null;
  extras: Record<string, number>;
  extraStop: boolean;
  extraStopLocation: string;
  airportDirection: "to_airport" | "from_airport";
}

interface PassengerData {
  fullName: string;
  email: string;
  phone: string;
  flightNumber: string;
  notes: string;
  acceptTerms: boolean;
}

const TABS: { value: ServiceTab; label: string; icon: typeof Plane }[] = [
  { value: "airport_transfer", label: "Airport Transfer", icon: Plane },
  { value: "chauffeur", label: "Shuttle Hire", icon: Car },
  { value: "point_to_point", label: "Staff Service", icon: Briefcase },
];

const initialTrip = (s: ServiceTab): TripData => ({
  serviceType: s, direction: "one_way", trailer: false, oversizeLuggage: false,
  passengers: 2, babySeats: 0, luggageCheckin: 0, luggageCarry: 0,
  pickup: "", dropoff: "", pickupDate: "", pickupTime: "",
  endTime: "", returnDate: "", returnTime: "", hours: 4,
  pointsOfInterest: "",
  distanceKm: null, durationMinutes: null,
  extras: {}, extraStop: false, extraStopLocation: "",
  airportDirection: "to_airport",
});

// ─────────────────────────────────────────────────────────────
// Number select (matches screenshot's chunky number dropdown look)
// ─────────────────────────────────────────────────────────────
const NumberSelect = ({ value, onChange, max = 8, min = 0, label, icon: Icon }: {
  value: number; onChange: (n: number) => void; max?: number; min?: number; label: string; icon?: typeof Users;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5" />}{label} *
    </Label>
    <Select value={String(value)} onValueChange={(v) => onChange(parseInt(v))}>
      <SelectTrigger className="h-11 text-base font-medium"><SelectValue /></SelectTrigger>
      <SelectContent>
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const n = i + min;
          return (
            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  </div>
);

const getHireHours = (start: string, end: string, fallback: number) => {
  if (!start || !end) return fallback;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) return fallback;

  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.max(1, Math.ceil(minutes / 60));
};

// ─────────────────────────────────────────────────────────────
// Extras (add-ons) + extra-stop section
// ─────────────────────────────────────────────────────────────
const ExtrasSection = ({ trip, setTrip }: { trip: TripData; setTrip: (t: TripData) => void }) => {
  const setQty = (id: string, qty: number) => {
    const next = { ...trip.extras };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    setTrip({ ...trip, extras: next });
  };
  const extrasTotal = computeExtrasTotal(trip.extras, trip.extraStop);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" /> Extras (optional)
        </Label>
        {extrasTotal > 0 && (
          <span className="text-xs font-bold text-accent">+ {formatZAR(extrasTotal)}</span>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-secondary/30 divide-y divide-border/60 overflow-hidden">
        {EXTRAS.map((e) => {
          const qty = trip.extras[e.id] || 0;
          return (
            <div key={e.id} className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.label}</p>
                <p className="text-xs text-muted-foreground">{formatZAR(e.price)}{e.max > 1 ? " each" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(e.id, Math.max(0, qty - 1))}
                  disabled={qty === 0}
                  className="w-8 h-8 grid place-items-center rounded-full border border-border bg-card disabled:opacity-40"
                  aria-label={`Decrease ${e.label}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(e.id, Math.min(e.max, qty + 1))}
                  disabled={qty >= e.max}
                  className="w-8 h-8 grid place-items-center rounded-full border border-border bg-card disabled:opacity-40"
                  aria-label={`Increase ${e.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Extra stop */}
        <div className="p-3 space-y-2 bg-accent/5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={trip.extraStop}
              onCheckedChange={(v) => setTrip({ ...trip, extraStop: !!v })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                Extra Stop on route <span className="text-accent font-bold">+ {formatZAR(EXTRA_STOP_PRICE)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Includes up to 15 min waiting time at the extra stop.</p>
            </div>
          </label>
          {trip.extraStop && (
            <div className="pl-7">
              <AddressAutocomplete
                value={trip.extraStopLocation}
                onChange={(v) => setTrip({ ...trip, extraStopLocation: v })}
                placeholder="Extra stop address…"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const CUSTOM_POI = "Custom (Please specify in notes)";

export interface PoiOption {
  name: string;
  category: string | null;
  vehicle_prices: Record<string, number>;
}

const usePointsOfInterest = () => {
  const [points, setPoints] = useState<PoiOption[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("points_of_interest")
        .select("name, category, vehicle_prices")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      const custom: PoiOption = { name: CUSTOM_POI, category: null, vehicle_prices: {} };
      if (error || !data) {
        setPoints([custom]);
        return;
      }
      setPoints([
        ...data.map((p: any) => ({
          name: p.name as string,
          category: (p.category as string) ?? null,
          vehicle_prices: (p.vehicle_prices as Record<string, number>) ?? {},
        })),
        custom,
      ]);
    })();
    return () => { cancelled = true; };
  }, []);
  return points;
};

/** Resolve the POI rate-card price for a given vehicle (by slug). */
export const getPoiPriceForVehicle = (
  poi: PoiOption | undefined,
  vehicle: Pick<Vehicle, "slug" | "name">,
): number | null => {
  if (!poi || !vehicle?.slug) return null;
  const v = poi.vehicle_prices?.[vehicle.slug];
  return typeof v === "number" && v > 0 ? v : null;
};


// Support contact info
const SUPPORT_CONTACT = {
  whatsapp: "https://wa.me/27837668601",
  email: "info@shuttlecapetown.com",
  phone: "083 766 8601",
};

// ─────────────────────────────────────────────────────────────
// Cancellation Policy Notice
// ─────────────────────────────────────────────────────────────
const CancellationNotice = ({ isGuest }: { isGuest: boolean }) => (
  <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 space-y-2">
    <div className="flex items-start gap-3">
      <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-foreground">Free Cancellation</p>
        <p className="text-xs text-muted-foreground mt-1">
          Cancel for free up to 2 days before your pickup date.
          {isGuest ? " Contact us via WhatsApp or email to request a cancellation." : " You can request cancellations from your dashboard."}
        </p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Support Section
// ─────────────────────────────────────────────────────────────
const SupportSection = () => (
  <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Need help?</p>
    <div className="grid sm:grid-cols-2 gap-3">
      <a
        href={SUPPORT_CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-all"
      >
        <Phone className="w-4 h-4 text-accent" />
        <div className="text-left">
          <p className="text-xs font-semibold text-foreground">WhatsApp</p>
          <p className="text-[11px] text-muted-foreground">Chat with us</p>
        </div>
      </a>
      <a
        href={`mailto:${SUPPORT_CONTACT.email}`}
        className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-all"
      >
        <Mail className="w-4 h-4 text-accent" />
        <div className="text-left">
          <p className="text-xs font-semibold text-foreground">Email</p>
          <p className="text-[11px] text-muted-foreground">info@shuttlecapetown.com</p>
        </div>
      </a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Step header / progress
// ─────────────────────────────────────────────────────────────
const StepProgress = ({ step }: { step: 1 | 2 | 3 }) => {
  const steps = ["Trip details", "Choose your ride", "Confirm & pay"];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-6">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = step === n; const done = step > n;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0 transition-colors",
              done ? "bg-accent text-white" : active ? "bg-accent text-white ring-4 ring-accent/20" : "bg-muted text-muted-foreground"
            )}>
              {done ? <Check className="w-3.5 h-3.5" /> : n}
            </div>
            <span className={cn("text-xs sm:text-sm font-medium truncate", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            {i < steps.length - 1 && <div className={cn("flex-1 h-px", done ? "bg-accent" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Step 1 — Trip details
// ─────────────────────────────────────────────────────────────
const TripDetailsStep = ({ trip, setTrip, onNext, computing }: {
  trip: TripData; setTrip: (t: TripData) => void; onNext: () => void; computing: boolean;
}) => {
  const isChauffeur = trip.serviceType === "chauffeur";
  const update = <K extends keyof TripData>(k: K, v: TripData[K]) => setTrip({ ...trip, [k]: v });
  const pointsOfInterest = usePointsOfInterest();

  if (isChauffeur) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Need a custom quote?{" "}
          <a
            href="mailto:info@shuttlecapetown.com?subject=Custom%20Shuttle%20Hire%20Itinerary"
            className="font-medium text-accent underline underline-offset-4"
          >
            Click to mail us your itinerary
          </a>
        </p>

        <div className="grid grid-cols-2 gap-4">
          <NumberSelect value={trip.passengers} onChange={(n) => update("passengers", n)} min={1} max={32} label="Passengers" icon={Users} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date required *</Label>
          <DatePicker value={trip.pickupDate} onChange={(v) => update("pickupDate", v)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Start time *</Label>
            <TimePicker value={trip.pickupTime} onChange={(v) => {
              setTrip({ ...trip, pickupTime: v, hours: getHireHours(v, trip.endTime, trip.hours) });
            }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">End time *</Label>
            <TimePicker value={trip.endTime} onChange={(v) => {
              setTrip({ ...trip, endTime: v, hours: getHireHours(trip.pickupTime, v, trip.hours) });
            }} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Start location *
            </Label>
            <AddressAutocomplete value={trip.pickup} onChange={(v) => update("pickup", v)} placeholder="Address, airport, hotel..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-foreground/40" /> End location *
            </Label>
            <AddressAutocomplete value={trip.dropoff} onChange={(v) => update("dropoff", v)} placeholder="Address, airport, hotel..." />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Points of interest *</Label>
          <Select value={trip.pointsOfInterest} onValueChange={(v) => update("pointsOfInterest", v)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Please select a point of interest" />
            </SelectTrigger>
            <SelectContent>
              {pointsOfInterest.map((point) => {
                const hasPrice = Object.keys(point.vehicle_prices || {}).length > 0;
                return (
                  <SelectItem key={point.name} value={point.name}>
                    <span className="flex items-center gap-2">
                      <span>{point.name}</span>
                      {!hasPrice && point.name !== CUSTOM_POI && (
                        <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Get Quote</span>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <ExtrasSection trip={trip} setTrip={setTrip} />


        <Button type="button" size="lg" onClick={onNext} disabled={computing}
          className="w-full h-14 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
          {computing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking availability...</> : <>Check pricing & availability <ArrowRight className="w-5 h-5 ml-2" /></>}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip direction */}
      {!isChauffeur && (
        <div className="bg-secondary/30 rounded-2xl p-4 border border-border/60">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trip direction</p>
          <div className="flex gap-6">
            {(["one_way", "return"] as Direction[]).map(d => (
              <button key={d} type="button" onClick={() => update("direction", d)}
                className="flex items-center gap-2.5 text-sm font-medium py-1.5">
                <span className={cn("w-4 h-4 rounded-full border-2 grid place-items-center transition-all",
                  trip.direction === d ? "border-accent" : "border-muted-foreground/40")}>
                  {trip.direction === d && <span className="w-2 h-2 rounded-full bg-accent" />}
                </span>
                <span className="text-foreground">{d === "one_way" ? "One-way" : "Return"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passenger/luggage counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumberSelect value={trip.passengers} onChange={(n) => update("passengers", n)} min={1} max={16} label="Passengers" icon={Users} />
        {!isChauffeur && <>
          <NumberSelect value={trip.luggageCheckin} onChange={(n) => update("luggageCheckin", n)} max={10} label="Check-in bags" icon={Briefcase} />
          <NumberSelect value={trip.luggageCarry} onChange={(n) => update("luggageCarry", n)} max={10} label="Carry-on bags" icon={Briefcase} />
        </>}
        {isChauffeur && (
          <div className="space-y-1.5 col-span-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Duration (hours) *</Label>
            <Select value={String(trip.hours)} onValueChange={(v) => update("hours", parseInt(v))}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{[2,3,4,5,6,8,10,12].map(h => <SelectItem key={h} value={String(h)}>{h} hours</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" /> From *
          </Label>
          <AddressAutocomplete value={trip.pickup} onChange={(v) => update("pickup", v)} placeholder="Address, airport, hotel…" />
        </div>
        {!isChauffeur && (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-foreground/40" /> To *
            </Label>
            <AddressAutocomplete value={trip.dropoff} onChange={(v) => update("dropoff", v)} placeholder="Address, airport, hotel…" />
          </div>
        )}
      </div>

      {/* Date + time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pickup date *</Label>
          <DatePicker value={trip.pickupDate} onChange={(v) => update("pickupDate", v)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pickup time *</Label>
          <TimePicker value={trip.pickupTime} onChange={(v) => update("pickupTime", v)} />
        </div>
      </div>

      {trip.direction === "return" && !isChauffeur && (
        <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/20">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-accent uppercase tracking-wider">Return date *</Label>
            <DatePicker value={trip.returnDate} onChange={(v) => update("returnDate", v)} minDate={trip.pickupDate ? new Date(trip.pickupDate) : undefined} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-accent uppercase tracking-wider">Return time *</Label>
            <TimePicker value={trip.returnTime} onChange={(v) => update("returnTime", v)} />
          </div>
        </div>
      )}

      {trip.serviceType === "airport_transfer" && (
        <div className="bg-secondary/30 rounded-2xl p-4 border border-border/60">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Airport direction</p>
          <div className="flex gap-6">
            {(["to_airport", "from_airport"] as Array<"to_airport" | "from_airport">).map(d => (
              <button key={d} type="button" onClick={() => update("airportDirection", d)}
                className="flex items-center gap-2.5 text-sm font-medium py-1.5">
                <span className={cn("w-4 h-4 rounded-full border-2 grid place-items-center transition-all",
                  trip.airportDirection === d ? "border-accent" : "border-muted-foreground/40")}>
                  {trip.airportDirection === d && <span className="w-2 h-2 rounded-full bg-accent" />}
                </span>
                <span className="text-foreground">{d === "to_airport" ? "Traveling TO airport" : "Traveling FROM airport"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <ExtrasSection trip={trip} setTrip={setTrip} />

      <Button type="button" size="lg" onClick={onNext} disabled={computing}
        className="w-full h-14 text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
        {computing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Calculating route…</> : <>Check pricing & availability <ArrowRight className="w-5 h-5 ml-2" /></>}
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Step 2 — Vehicle selection
// ─────────────────────────────────────────────────────────────
const VehicleSelectStep = ({ trip, vehicles, selectedPoi, selected, onSelect, onBack, onNext, loading, isGuest }: {
  trip: TripData; vehicles: Vehicle[]; selectedPoi: PoiOption | undefined;
  selected: string | null;
  onSelect: (id: string) => void; onBack: () => void; onNext: () => void; loading: boolean; isGuest: boolean;
}) => (
  <div className="space-y-6">
    {/* Cancellation Notice */}
    <CancellationNotice isGuest={isGuest} />
    <div className="rounded-2xl border border-border bg-secondary/30 p-4 grid sm:grid-cols-4 gap-4 text-sm">
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">From</p>
        <p className="font-medium truncate">{trip.pickup}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">To</p>
        <p className="font-medium truncate">{trip.serviceType === "chauffeur" ? (trip.pointsOfInterest || trip.dropoff) : trip.dropoff}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">When</p>
        <p className="font-medium">
          {trip.pickupDate} - {trip.pickupTime}
          {trip.serviceType === "chauffeur" && trip.endTime ? ` to ${trip.endTime}` : ""}
        </p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Distance</p>
        <p className="font-medium">
          {trip.distanceKm ? `${trip.distanceKm.toFixed(1)} km` : "—"}
        </p>
      </div>
    </div>

    {loading ? (
      <div className="py-16 grid place-items-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    ) : vehicles.length === 0 ? (
      <p className="text-center text-muted-foreground py-12">No vehicles available right now.</p>
    ) : (
      <div className="grid sm:grid-cols-2 gap-4">
        {vehicles.map(v => {
          const isChauffeur = trip.serviceType === "chauffeur";
          const poiPrice = isChauffeur ? getPoiPriceForVehicle(selectedPoi, v) : null;
          const isCustomPoi = isChauffeur && trip.pointsOfInterest === CUSTOM_POI;
          const needsQuote = isChauffeur && !poiPrice && !isCustomPoi;
          const price = needsQuote ? 0 : quoteVehicle(v, {
            distanceKm: trip.distanceKm ?? 0,
            durationMinutes: trip.durationMinutes ?? 0,
            isReturn: trip.direction === "return",
            serviceType: trip.serviceType,
            hours: trip.hours,
            extrasTotal: computeExtrasTotal(trip.extras, trip.extraStop),
            poiPrice,
          });
          const tooSmall = v.capacity < trip.passengers;
          const disabled = tooSmall || needsQuote;
          const sel = selected === v.id;
          return (
            <button key={v.id} type="button" disabled={disabled} onClick={() => onSelect(v.id)}
              className={cn(
                "text-left rounded-2xl border bg-card overflow-hidden transition-all",
                sel ? "border-accent ring-2 ring-accent/30 shadow-lg" : "border-border hover:border-accent/40",
                disabled && "opacity-40 cursor-not-allowed"
              )}>
              <div className="aspect-[16/9] bg-secondary/40 overflow-hidden">
                {v.image_url ? <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted-foreground"><Car className="w-10 h-10" /></div>}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> Up to {v.capacity} passengers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                    {needsQuote ? (
                      <p className="text-sm font-bold text-accent">Get a quote</p>
                    ) : (
                      <p className="text-xl font-bold text-accent">{formatZAR(price)}</p>
                    )}
                  </div>
                </div>
                {tooSmall && <p className="text-xs text-destructive">Not enough seats for {trip.passengers} passengers</p>}
                {needsQuote && !tooSmall && (
                  <p className="text-xs text-muted-foreground">Contact us via WhatsApp or email for a custom quote.</p>
                )}
                {sel && <p className="text-xs font-semibold text-accent flex items-center gap-1"><Check className="w-3 h-3" /> Selected</p>}
              </div>
            </button>
          );
        })}
      </div>
    )}

    {/* Support Section */}
    <SupportSection />

    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onBack} className="h-12"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
      <Button type="button" size="lg" onClick={onNext} disabled={!selected}
        className="flex-1 h-12 bg-accent hover:bg-accent/90 text-accent-foreground">
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Step 3 — Passenger details + summary + pay
// ─────────────────────────────────────────────────────────────
const PassengerStep = ({
  trip, vehicle, totalPrice, passenger, setPassenger, isGuest, onBack, onSubmit, submitting,
}: {
  trip: TripData; vehicle: Vehicle; totalPrice: number;
  passenger: PassengerData; setPassenger: (p: PassengerData) => void;
  isGuest: boolean; onBack: () => void; onSubmit: () => void; submitting: boolean;
}) => {
  const update = <K extends keyof PassengerData>(k: K, v: PassengerData[K]) => setPassenger({ ...passenger, [k]: v });
  const isAirport = trip.serviceType === "airport_transfer";
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-5">
        {isGuest && (
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
            <UserCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="text-xs text-foreground">
              <p className="font-semibold mb-0.5">Continuing as guest</p>
              <p className="text-muted-foreground">You'll receive your booking confirmation by email. <a href="/auth" className="text-accent underline">Sign in</a> to track your trips.</p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Full name *</Label>
            <Input value={passenger.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="John Doe" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email *</Label>
            <Input type="email" value={passenger.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="h-11" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone *</Label>
            <Input type="tel" value={passenger.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+27 72 123 4567" className="h-11" />
          </div>
          {isAirport && trip.airportDirection === "to_airport" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Flight number (optional)
              </Label>
              <Input value={passenger.flightNumber} onChange={(e) => update("flightNumber", e.target.value)} placeholder="e.g. BA 6231" className="h-11" />
            </div>
          )}
          {isAirport && trip.airportDirection === "from_airport" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Flight number *
              </Label>
              <Input required value={passenger.flightNumber} onChange={(e) => update("flightNumber", e.target.value)} placeholder="e.g. BA 6231" className="h-11" />
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Special requests (optional)</Label>
            <Textarea value={passenger.notes} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Anything we should know?" />
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer text-sm">
          <Checkbox checked={passenger.acceptTerms} onCheckedChange={(v) => update("acceptTerms", !!v)} className="mt-0.5" />
          <span className="text-muted-foreground">I agree to the <a href="/terms" className="text-accent underline">terms & conditions</a> and authorise payment.</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="h-12"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <Button type="button" size="lg" onClick={onSubmit} disabled={submitting}
            className="flex-1 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</> : <>Confirm & Pay {formatZAR(totalPrice)}</>}
          </Button>
        </div>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 h-fit space-y-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Booking summary</p>
        {vehicle.image_url && <img src={vehicle.image_url} alt={vehicle.name} className="w-full aspect-[16/9] object-cover rounded-xl" />}
        <div className="space-y-2 text-sm">
          <Row label="Vehicle" value={vehicle.name} />
          <Row label="From" value={trip.pickup} truncate />
          <Row label="To" value={trip.dropoff} truncate />
          <Row label="Date" value={`${trip.pickupDate} - ${trip.pickupTime}${trip.serviceType === "chauffeur" && trip.endTime ? ` to ${trip.endTime}` : ""}`} />
          {trip.direction === "return" && trip.returnDate && (
            <Row label="Return" value={`${trip.returnDate} • ${trip.returnTime}`} />
          )}
          {trip.serviceType === "chauffeur" && <Row label="Duration" value={`${trip.hours} hours`} />}
          {trip.serviceType === "chauffeur" && trip.pointsOfInterest && <Row label="Interest" value={trip.pointsOfInterest} truncate />}
          {trip.serviceType !== "chauffeur" && trip.distanceKm && <Row label="Distance" value={`${trip.distanceKm.toFixed(1)} km`} />}
          <Row label="Passengers" value={String(trip.passengers)} />
        </div>

        {(() => {
          const selectedExtras = EXTRAS.filter(e => (trip.extras[e.id] || 0) > 0);
          const hasAny = selectedExtras.length > 0 || trip.extraStop;
          if (!hasAny) return null;
          const extrasSubtotal = computeExtrasTotal(trip.extras, trip.extraStop);
          return (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-1.5 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Extras</p>
                {selectedExtras.map(e => (
                  <Row
                    key={e.id}
                    label={`${e.label}${trip.extras[e.id] > 1 ? ` ×${trip.extras[e.id]}` : ""}`}
                    value={formatZAR(e.price * trip.extras[e.id])}
                  />
                ))}
                {trip.extraStop && (
                  <Row
                    label={`Extra stop${trip.extraStopLocation ? ` (${trip.extraStopLocation})` : ""}`}
                    value={formatZAR(EXTRA_STOP_PRICE)}
                    truncate
                  />
                )}
                <Row label="Extras subtotal" value={formatZAR(extrasSubtotal)} />
              </div>
            </>
          );
        })()}
        <div className="h-px bg-border" />
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-accent">{formatZAR(totalPrice)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-accent" /> Secure Yoco payment
        </div>
      </aside>
    </div>
  );
};

const Row = ({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className={cn("font-medium text-right", truncate && "truncate max-w-[200px]")}>{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────
const BookingWizard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<ServiceTab>("airport_transfer");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [trip, setTrip] = useState<TripData>(initialTrip("airport_transfer"));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passenger, setPassenger] = useState<PassengerData>({
    fullName: "", email: "", phone: "", flightNumber: "", notes: "", acceptTerms: false,
  });

  // Switching tab resets trip but preserves entered addresses/dates if any
  const onTabChange = (v: string) => {
    const next = v as ServiceTab;
    setTab(next);
    setStep(1);
    setTrip(prev => ({ ...initialTrip(next), pickup: prev.pickup, dropoff: prev.dropoff, pickupDate: prev.pickupDate, pickupTime: prev.pickupTime, passengers: prev.passengers }));
    setSelectedVehicleId(null);
  };

  // Pre-fill passenger from auth profile
  useEffect(() => {
    if (!user) return;
    setPassenger(p => ({ ...p, email: user.email || p.email }));
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setPassenger(p => ({ ...p, fullName: data.full_name || p.fullName, phone: data.phone || p.phone }));
      });
  }, [user]);

  // Step 1 → 2: validate, compute distance, load vehicles
  const goToVehicles = async () => {
    const isChauffeur = trip.serviceType === "chauffeur";
    if (!trip.pickup || !trip.dropoff || !trip.pickupDate || !trip.pickupTime || (isChauffeur && (!trip.endTime || !trip.pointsOfInterest))) {
      toast({ title: "Missing details", description: "Please fill in all required trip details.", variant: "destructive" });
      return;
    }
    if (trip.direction === "return" && !isChauffeur && (!trip.returnDate || !trip.returnTime)) {
      toast({ title: "Return trip details", description: "Please add the return date and time.", variant: "destructive" });
      return;
    }

    // Validate 12-hour advance booking requirement
    const now = new Date();
    const pickupDateTime = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
    const hoursUntilPickup = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilPickup < 12) {
      toast({ 
        title: "Booking too soon", 
        description: "Please book at least 12 hours in advance. Please contact us for urgent bookings via WhatsApp or email.", 
        variant: "destructive" 
      });
      return;
    }

    setComputing(true);
    try {
      const hireHours = isChauffeur ? getHireHours(trip.pickupTime, trip.endTime, trip.hours) : trip.hours;
      let distanceKm = 0, durationMinutes = 0;
      if (trip.dropoff) {
        const { data, error } = await supabase.functions.invoke("compute-route", {
          body: { origin: trip.pickup, destination: trip.dropoff },
        });
        // supabase-js puts non-2xx JSON in `error.context`; try to surface a useful message
        const errMsg = (error as any)?.context
          ? await ((error as any).context.json?.().then((j: any) => j?.error).catch(() => null))
          : (error as Error | null)?.message;
        if (error || !data?.distanceKm) {
          console.warn("Route compute failed", errMsg, data);
          toast({
            title: "Couldn't compute exact distance",
            description: errMsg
              ? `${errMsg}. Showing estimated fares — pick an address from the suggestions for accuracy.`
              : "Try selecting an address from the dropdown suggestions. Showing estimated fares.",
          });
        } else {
          distanceKm = data.distanceKm;
          durationMinutes = data.durationMinutes;
        }
      }
      setTrip(t => ({ ...t, hours: hireHours, distanceKm, durationMinutes }));

      setLoadingVehicles(true);
      const { data: vData, error: vErr } = await supabase.from("vehicles").select("*").eq("is_active", true);
      if (vErr) throw vErr;
      const list = (vData as Vehicle[] || []).sort((a, b) => a.capacity - b.capacity);
      setVehicles(list);
      setStep(2);
    } catch (e) {
      toast({ title: "Something went wrong", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setComputing(false);
      setLoadingVehicles(false);
    }
  };

  const pointsOfInterest = usePointsOfInterest();
  const selectedPoi = useMemo(
    () => pointsOfInterest.find(p => p.name === trip.pointsOfInterest),
    [pointsOfInterest, trip.pointsOfInterest],
  );
  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === selectedVehicleId), [vehicles, selectedVehicleId]);
  const extrasTotal = useMemo(() => computeExtrasTotal(trip.extras, trip.extraStop), [trip.extras, trip.extraStop]);
  const poiPrice = useMemo(
    () => (trip.serviceType === "chauffeur" && selectedVehicle ? getPoiPriceForVehicle(selectedPoi, selectedVehicle) : null),
    [trip.serviceType, selectedPoi, selectedVehicle],
  );
  const totalPrice = useMemo(() => selectedVehicle ? quoteVehicle(selectedVehicle, {
    distanceKm: trip.distanceKm ?? 0, durationMinutes: trip.durationMinutes ?? 0,
    isReturn: trip.direction === "return",
    serviceType: trip.serviceType, hours: trip.hours,
    extrasTotal,
    poiPrice,
  }) : 0, [selectedVehicle, trip, extrasTotal, poiPrice]);

  const submitBooking = async () => {
    if (!passenger.fullName || !passenger.email || !passenger.phone) {
      toast({ title: "Missing details", description: "Name, email and phone are required.", variant: "destructive" }); return;
    }
    if (trip.serviceType === "airport_transfer" && trip.airportDirection === "from_airport" && !passenger.flightNumber.trim()) {
      toast({ title: "Flight number required", description: "Please enter your flight number when travelling from the airport.", variant: "destructive" }); return;
    }

    if (!passenger.acceptTerms) {
      toast({ title: "Please accept the terms", variant: "destructive" }); return;
    }
    if (!selectedVehicle) return;
    setSubmitting(true);
    try {
      // Pre-build notes for legacy display compatibility
      const noteParts: string[] = [];
      noteParts.push(`Service: ${trip.serviceType === "chauffeur" ? "Shuttle Hire" : trip.serviceType === "point_to_point" ? "Staff Service" : "Airport Transfer"}`);
      if (trip.serviceType === "airport_transfer") {
        noteParts.push(`Airport: ${trip.airportDirection === "to_airport" ? "Flying TO airport" : "Flying FROM airport"}`);
      }
      if (passenger.flightNumber) noteParts.push(`Flight: ${passenger.flightNumber}`);
      noteParts.push(`Passengers: ${trip.passengers}`);
      if (trip.luggageCheckin) noteParts.push(`${trip.serviceType === "chauffeur" ? "Large bags" : "Check-in bags"}: ${trip.luggageCheckin}`);
      if (trip.luggageCarry) noteParts.push(`Carry-on: ${trip.luggageCarry}`);
      if (trip.serviceType === "chauffeur") {
        noteParts.push(`End time: ${trip.endTime}`);
        noteParts.push(`Points of interest: ${trip.pointsOfInterest}`);
      }
      const selectedExtras = EXTRAS.filter(e => (trip.extras[e.id] || 0) > 0);
      if (selectedExtras.length) {
        noteParts.push(`Extras: ${selectedExtras.map(e => `${e.label} ×${trip.extras[e.id]}`).join(", ")}`);
      }
      if (trip.extraStop) {
        noteParts.push(`Extra stop: ${trip.extraStopLocation || "(location not specified)"} (+R${EXTRA_STOP_PRICE})`);
      }
      if (passenger.notes) noteParts.push(passenger.notes);
      if (trip.direction === "return" && trip.returnDate) {
        noteParts.push(`Return trip: ${trip.dropoff} → ${trip.pickup} on ${trip.returnDate} at ${trip.returnTime}`);
      }

      const isGuest = !user;
      const now = new Date().toISOString();
      const bookingId = (globalThis.crypto as Crypto).randomUUID();
      const insertRow = {
        id: bookingId,
        user_id: user?.id ?? null,
        is_guest: isGuest,
        guest_name: isGuest ? passenger.fullName : null,
        guest_email: isGuest ? passenger.email : null,
        guest_phone: isGuest ? passenger.phone : null,
        vehicle_id: selectedVehicle.id,
        service_type: trip.serviceType,
        booking_type: trip.serviceType === "chauffeur" ? "hourly" : "transfer",
        pickup_location: trip.pickup,
        dropoff_location: trip.dropoff,
        hours: trip.serviceType === "chauffeur" ? trip.hours : null,
        pickup_date: trip.pickupDate,
        pickup_time: trip.pickupTime,
        return_pickup_date: trip.direction === "return" ? trip.returnDate || null : null,
        return_pickup_time: trip.direction === "return" ? trip.returnTime || null : null,
        trip_direction: trip.direction,
        passengers: trip.passengers,
        baby_seats: trip.babySeats,
        luggage_checkin: trip.luggageCheckin,
        luggage_carry: trip.luggageCarry,
        trailer: trip.trailer,
        oversize_luggage: trip.oversizeLuggage,
        distance_km: trip.distanceKm,
        duration_minutes: trip.durationMinutes,
        flight_number: passenger.flightNumber || null,
        status: "pending",
        payment_status: "unpaid",
        price_estimate: totalPrice,
        extras: EXTRAS
          .filter(e => (trip.extras[e.id] || 0) > 0)
          .map(e => ({ id: e.id, label: e.label, qty: trip.extras[e.id], unit_price: e.price, subtotal: e.price * trip.extras[e.id] })),
        extras_total: extrasTotal,
        extra_stop: trip.extraStop,
        extra_stop_location: trip.extraStop ? (trip.extraStopLocation || null) : null,
        notes: noteParts.join(" | ") || null,
        is_favourite: false,
        created_at: now, updated_at: now,
      };

      // Sync logged-in user's profile name/phone
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id, full_name: passenger.fullName, phone: passenger.phone, updated_at: now,
        });
      }

      const { error } = await supabase.from("bookings").insert(insertRow);
      if (error) throw error;

      // Create Yoco checkout
      const origin = window.location.origin;
      const { data: checkout, error: chkErr } = await supabase.functions.invoke("create-yoco-checkout", {
        body: {
          bookingId, amount: totalPrice, currency: "ZAR",
          successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
          cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
        },
      });
      if (chkErr) throw chkErr;
      const checkoutUrl = checkout?.checkoutUrl || checkout?.checkout_url || checkout?.redirectUrl || checkout?.url;
      if (!checkoutUrl) throw new Error("No checkout URL returned from Yoco.");

      // Send confirmation/payment email (fire-and-forget but await for UX feedback)
      await supabase.functions.invoke("send-booking-email", {
        body: { bookingId, checkoutUrl, to: passenger.email },
      }).catch(e => console.warn("Email send failed", e));

      toast({ title: "Redirecting to payment", description: "Complete payment to confirm your booking." });
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error("Booking error", e);
      toast({ title: "Booking failed", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-3 h-auto p-0 bg-secondary/40 rounded-t-3xl rounded-b-none border-b border-border overflow-hidden">
          {TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value}
              className="h-14 sm:h-16 text-xs sm:text-sm font-semibold rounded-none data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-accent transition-all flex items-center gap-2">
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="p-5 sm:p-7">
        <div className="mb-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
            Step {step} of 3
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
            {step === 1 ? "Enter your trip details" : step === 2 ? "Book your ride & driver" : "Confirm & pay"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 1 && "Enter your pickup & drop-off, date and time to get instant pricing and availability."}
            {step === 2 && "Pick the vehicle that fits your trip. Prices are calculated live."}
            {step === 3 && "Enter the main passenger details and proceed to secure payment."}
          </p>
        </div>

        <div className="mt-5">
          <StepProgress step={step} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}>
            {step === 1 && <TripDetailsStep trip={trip} setTrip={setTrip} onNext={goToVehicles} computing={computing} />}
            {step === 2 && (
              <VehicleSelectStep trip={trip} vehicles={vehicles} selectedPoi={selectedPoi} selected={selectedVehicleId}
                onSelect={setSelectedVehicleId} onBack={() => setStep(1)}
                onNext={() => setStep(3)} loading={loadingVehicles} isGuest={!user} />
            )}
            {step === 3 && selectedVehicle && (
              <PassengerStep trip={trip} vehicle={selectedVehicle} totalPrice={totalPrice}
                passenger={passenger} setPassenger={setPassenger} isGuest={!user}
                onBack={() => setStep(2)} onSubmit={submitBooking} submitting={submitting} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingWizard;
