/**
 * Pricing engine for booking quotes.
 */

export interface Vehicle {
  id: string;
  name: string;
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

export function quoteVehicle(vehicle: Vehicle, input: QuoteInput): number {
  if (input.serviceType === "chauffeur" && input.hours) {
    const perHour = vehicle.price_per_hour ?? DEFAULT_PER_HOUR;
    let total = perHour * input.hours;
    total += input.extrasTotal ?? 0;
    return roundUp(Math.max(MIN_FARE, total));
  }

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
