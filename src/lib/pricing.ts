/**
 * Pricing engine for booking quotes.
 */

export interface Vehicle {
  id: string;
  name: string;
  slug?: string | null;
  capacity: number;
  price_per_km: number | null;
  price_per_hour: number | null;
  image_url?: string | null;
  description?: string | null;
}

export interface QuoteInput {
  distanceKm: number;
  durationMinutes?: number;
  isReturn: boolean;
  babySeats?: number;
  trailer?: boolean;
  oversizeLuggage?: boolean;
  serviceType: "airport_transfer" | "point_to_point" | "chauffeur";
  hours?: number;
  extrasTotal?: number; // sum of selected add-ons (incl. extra-stop fee)
  /** Per-vehicle POI rate-card price (Shuttle Hire). When set, base = poiPrice. */
  poiPrice?: number | null;
}

// --- Base rates -------------------------------------------------------------
const MIN_FARE = 250;
const BASE_FARE = 80;
const RETURN_MULTIPLIER = 1.85;
const AIRPORT_SURCHARGE = 50;
const DEFAULT_PER_KM = 18;
const DEFAULT_PER_HOUR = 450;

// --- Extras (single source of truth) ---------------------------------------
export const EXTRAS: { id: string; label: string; price: number; max: number }[] = [
  { id: "infant_seat_0_12m", label: "Infant Car Seat (0–12 months)", price: 50, max: 3 },
  { id: "infant_seat_1_4y", label: "Infant Car Seat (1–4 years)", price: 100, max: 3 },
  { id: "booster_seat_3_7y", label: "Booster Seat (3–7 years)", price: 150, max: 3 },
  { id: "small_trailer", label: "Small Trailer", price: 150, max: 1 },
  { id: "big_trailer", label: "Big Trailer", price: 250, max: 1 },
  { id: "bottled_water", label: "Bottled Water", price: 10, max: 20 },
];

export const EXTRA_STOP_PRICE = 100; // includes 15 min waiting time

export function computeExtrasTotal(
  extras: Record<string, number>,
  extraStop: boolean,
): number {
  let total = 0;
  for (const item of EXTRAS) {
    const qty = extras[item.id] || 0;
    if (qty > 0) total += qty * item.price;
  }
  if (extraStop) total += EXTRA_STOP_PRICE;
  return total;
}

// --- Distance-band pricing table (rate card) --------------------------------
// Bands are inclusive upper bounds in km.
const DISTANCE_BANDS = [21, 29, 34, 40, 49, 60, 70, 89, 110] as const;

type VehicleKey =
  | "small_mpv"
  | "bmw_5"
  | "mercedes_c"
  | "fortuner"
  | "luxury_van"
  | "luxury_v_class_vip"
  | "staria"
  | "minibus_old"
  | "minibus_new"
  | "coaster";

const PRICE_TABLE: Record<VehicleKey, number[]> = {
  small_mpv:   [480, 540, 600, 650, 700, 750, 850, 950, 1350],
  bmw_5:       [950, 1000, 1050, 1100, 1200, 1250, 1350, 1450, 1500],
  mercedes_c:  [1350, 1450, 1500, 1550, 1600, 1650, 1650, 1850, 1850],
  fortuner:    [850, 950, 1000, 1050, 1100, 1150, 1250, 1350, 1400],
  luxury_van:  [1450, 1650, 1700, 1750, 1800, 1850, 1900, 2150, 2250],
  luxury_v_class_vip: [1650, 1700, 1750, 1850, 1950, 2050, 2050, 2450, 2450],
  staria:      [1350, 1500, 1550, 1650, 1750, 1800, 1850, 1950, 2000],
  minibus_old: [1450, 1650, 1700, 1750, 1800, 1850, 1900, 2000, 2250],
  minibus_new: [1650, 1750, 1800, 1850, 1900, 1950, 2000, 2250, 2500],
  coaster:     [2350, 2500, 2600, 2600, 2700, 2800, 2900, 3250, 3500],
};

function matchVehicleKey(name: string, slug?: string | null): VehicleKey | null {
  const s = (slug || "").toLowerCase();
  if (s === "small_mpv_1_3" || s === "small_mpv_1_5") return "small_mpv";
  if (s === "bmw_5") return "bmw_5";
  if (s === "mercedes_c") return "mercedes_c";
  if (s === "fortuner") return "fortuner";
  if (s === "luxury_mercedes_van") return "luxury_van";
  if (s === "luxury_v_class_vip") return "luxury_v_class_vip";
  if (s === "staria") return "staria";
  if (s === "minibus_quantum") return "minibus_old";
  if (s === "minibus_new_quantum") return "minibus_new";
  if (s === "coaster") return "coaster";

  const n = (name || "").toLowerCase();
  if (n.includes("coaster")) return "coaster";
  if (n.includes("staria")) return "staria";
  if (n.includes("fortuner")) return "fortuner";
  if (n.includes("bmw")) return "bmw_5";
  if (n.includes("mercedes") && n.includes("c class")) return "mercedes_c";
  const isVClass = n.includes("v class") || n.includes("v-class") || n.includes("vclass");
  if (
    (n.includes("black") && isVClass) ||
    (n.includes("mercedes") && isVClass) ||
    n.includes("v class 300") ||
    n.includes("v-class 300") ||
    n.includes("vclass 300") ||
    n.includes("vip")
  ) {
    return "luxury_v_class_vip";
  }
  if (isVClass || n.includes("luxury van")) return "luxury_van";
  if (n.includes("minibus") || n.includes("qtm") || n.includes("quantum")) {
    return n.includes("new") ? "minibus_new" : "minibus_old";
  }
  if (n.includes("suzuki") || n.includes("mpv")) return "small_mpv";
  return null;
}

/** Look up base price from the rate card. Returns null when no mapping. */
export function lookupTablePrice(vehicleName: string, distanceKm: number, vehicleSlug?: string | null): number | null {
  const key = matchVehicleKey(vehicleName, vehicleSlug);
  if (!key) return null;
  const row = PRICE_TABLE[key];
  const d = Math.max(0, distanceKm);
  if (d <= 0) return row[0];
  for (let i = 0; i < DISTANCE_BANDS.length; i++) {
    if (d <= DISTANCE_BANDS[i]) return row[i];
  }
  // Beyond the table — extend using the last band's effective per-km rate
  const last = row[row.length - 1];
  const perKm = last / DISTANCE_BANDS[DISTANCE_BANDS.length - 1];
  return Math.ceil((last + (d - 110) * perKm) / 10) * 10;
}

export function quoteVehicle(vehicle: Vehicle, input: QuoteInput): number {
  // Chauffeur / Shuttle Hire: prefer POI rate-card price for this vehicle.
  if (input.serviceType === "chauffeur") {
    if (input.poiPrice && input.poiPrice > 0) {
      return roundUp((input.poiPrice ?? 0) + (input.extrasTotal ?? 0));
    }
    if (input.hours) {
      const perHour = vehicle.price_per_hour ?? DEFAULT_PER_HOUR;
      let total = perHour * input.hours;
      total += input.extrasTotal ?? 0;
      return roundUp(Math.max(MIN_FARE, total));
    }
  }

  // Distance-based pricing — use the rate-card table whenever vehicle maps
  const tablePrice = lookupTablePrice(vehicle.name, input.distanceKm, vehicle.slug);
  if (tablePrice != null) {
    let total = tablePrice;
    if (input.isReturn) total *= 2; // simple return = double the one-way table price
    total += input.extrasTotal ?? 0;
    return roundUp(total);
  }

  // Fallback for any vehicle not in the rate card
  const perKm = vehicle.price_per_km ?? DEFAULT_PER_KM;
  let total = BASE_FARE + perKm * input.distanceKm;
  if (input.serviceType === "airport_transfer") total += AIRPORT_SURCHARGE;
  if (input.isReturn) total *= RETURN_MULTIPLIER;
  total += input.extrasTotal ?? 0;


  return roundUp(Math.max(MIN_FARE, total));
}

function roundUp(n: number): number {
  return Math.ceil(n / 10) * 10;
}

export const formatZAR = (n: number) =>
  `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
