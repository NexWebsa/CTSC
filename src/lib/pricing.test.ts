import { describe, expect, it } from "vitest";
import {
  getReturnTripRate,
  isReturnTripVehicle,
  lookupTablePrice,
  quoteVehicle,
  TEST_VEHICLE,
  type Vehicle,
} from "./pricing";

const vehicle = (name: string, slug?: string | null): Vehicle => ({
  id: slug ?? name,
  name,
  slug,
  capacity: 4,
  price_per_km: null,
  price_per_hour: null,
});

describe("distance rate-card pricing", () => {
  it.each([
    [1, 1350],
    [20, 1350],
    [21, 1350],
    [28, 1450],
    [29, 1450],
    [34, 1500],
    [35, 1550],
    [40, 1550],
    [41, 1600],
    [49, 1600],
    [50, 1650],
    [70, 1650],
    [80, 1850],
    [100, 1850],
  ])("prices Mercedes C Class at %s km", (distanceKm, expected) => {
    expect(lookupTablePrice("Mercedes C Class", distanceKm)).toBe(expected);
    expect(lookupTablePrice("Any label", distanceKm, "mercedes_c")).toBe(expected);
  });

  it.each([
    [1, 1650],
    [20, 1650],
    [21, 1650],
    [28, 1700],
    [29, 1700],
    [34, 1750],
    [35, 1850],
    [40, 1850],
    [41, 1950],
    [49, 1950],
    [50, 2050],
    [70, 2050],
    [80, 2450],
    [100, 2450],
  ])("prices Black Mercedes V Class at %s km", (distanceKm, expected) => {
    expect(lookupTablePrice("Black Mercedes V Class", distanceKm)).toBe(expected);
    expect(lookupTablePrice("Mercedes V Class", distanceKm)).toBe(expected);
    expect(lookupTablePrice("Mercedes V Class 300", distanceKm, "luxury_v_class_vip")).toBe(expected);
  });

  it("keeps the standard Luxury Van V Class on its existing rate card", () => {
    expect(lookupTablePrice("Luxury Van (V Class)", 20, "luxury_mercedes_van")).toBe(1450);
    expect(lookupTablePrice("Luxury Van (V Class)", 80, "luxury_mercedes_van")).toBe(2150);
  });

  it.each([
    [0, 580],
    [21, 580],
    [22, 650],
    [29, 650],
    [30, 720],
    [34, 720],
    [35, 800],
    [40, 800],
    [41, 900],
    [49, 900],
    [50, 1050],
    [60, 1050],
    [61, 1150],
    [70, 1150],
    [80, 1350],
    [89, 1350],
    [90, 1650],
    [110, 1650],
  ])("prices Small MPV 1-5 airport transfers at %s km", (distanceKm, expected) => {
    const smallMpv = vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5");

    expect(quoteVehicle(smallMpv, {
      distanceKm,
      isReturn: false,
      serviceType: "airport_transfer",
      extrasTotal: 0,
    })).toBe(expected);
  });

  it("prices Small MPV point-to-point transfers on the airport/city rate card", () => {
    const smallMpv = vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5");

    expect(quoteVehicle(smallMpv, {
      distanceKm: 20,
      isReturn: false,
      serviceType: "point_to_point",
      extrasTotal: 0,
    })).toBe(580);
  });

  it("prices return City Transfers on the airport/city rate card", () => {
    const smallMpv = vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5");

    expect(quoteVehicle(smallMpv, {
      distanceKm: 20,
      isReturn: true,
      serviceType: "point_to_point",
      extrasTotal: 0,
    })).toBe(1130);
  });

  it.each([
    ["Small MPV (Suzuki Ertiga) 1-3 Pax", "small_mpv_1_3", 15.9, 450, 1030],
    ["Small MPV (Suzuki Ertiga)", "small_mpv_1_5", 16, 550, 1230],
    ["BMW 5 Series", "bmw_5", 35.9, 700, 1900],
    ["Toyota Fortuner", "fortuner", 36, 950, 2100],
    ["Luxury Van (V Class)", "luxury_mercedes_van", 60.9, 1250, 3250],
    ["Minibus / Quantum Old shape", "minibus_quantum", 61, 1950, 3950],
    ["Coaster Bus", "coaster", 130, 3000, 7240],
  ] as const)("prices return-trip %s at %s km", (name, slug, distanceKm, expectedReturnRate, expectedQuote) => {
    const returnVehicle = vehicle(name, slug);

    expect(getReturnTripRate(returnVehicle, distanceKm)).toBe(expectedReturnRate);
    expect(quoteVehicle(returnVehicle, {
      distanceKm,
      isReturn: true,
      serviceType: "airport_transfer",
      extrasTotal: 100,
    })).toBe(expectedQuote);
  });

  it("adds the return-trip rate to the normal airport-transfer fare without doubling", () => {
    const bmw = vehicle("BMW 5 Series", "bmw_5");

    expect(quoteVehicle(bmw, {
      distanceKm: 20,
      isReturn: true,
      serviceType: "airport_transfer",
      extrasTotal: 100,
    })).toBe(1750);
  });

  it("identifies only the vehicles with return-trip rates for Step 2 filtering", () => {
    expect(isReturnTripVehicle(vehicle("Small MPV (Suzuki Ertiga) 1-3 Pax", "small_mpv_1_3"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("BMW 5 Series", "bmw_5"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Toyota Fortuner", "fortuner"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Mercedes Vito"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Luxury Van (V Class)", "luxury_mercedes_van"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Minibus / Quantum Old shape", "minibus_quantum"))).toBe(true);
    expect(isReturnTripVehicle(vehicle("Coaster Bus", "coaster"))).toBe(true);

    expect(isReturnTripVehicle(vehicle("Mercedes C Class", "mercedes_c"))).toBe(false);
    expect(isReturnTripVehicle(vehicle("Hyundai Staria", "staria"))).toBe(false);
    expect(isReturnTripVehicle(vehicle("Mercedes V Class 300", "luxury_v_class_vip"))).toBe(false);
    expect(isReturnTripVehicle(vehicle("Minibus / Quantum New shape", "minibus_new_quantum"))).toBe(false);
    expect(getReturnTripRate(vehicle("Minibus / Quantum New shape", "minibus_new_quantum"), 70)).toBeNull();
  });

  it("falls back to existing pricing above the return-trip distance table", () => {
    const fortuner = vehicle("Toyota Fortuner", "fortuner");

    expect(getReturnTripRate(fortuner, 130.1)).toBeNull();
    expect(quoteVehicle(fortuner, {
      distanceKm: 130.1,
      isReturn: true,
      serviceType: "point_to_point",
      extrasTotal: 0,
    })).toBeGreaterThan(0);
  });

  it("keeps Shuttle Hire POI pricing for Small MPV 1-5", () => {
    const smallMpv = vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5");

    expect(quoteVehicle(smallMpv, {
      distanceKm: 20,
      isReturn: false,
      serviceType: "chauffeur",
      hours: 4,
      extrasTotal: 100,
      poiPrice: 2500,
    })).toBe(2600);
  });

  it("uses corrected table pricing in quote totals stored before Yoco checkout", () => {
    const mercedesC = vehicle("Mercedes C Class", "mercedes_c");
    const blackVClass = vehicle("Mercedes V Class 300", "luxury_v_class_vip");
    const smallMpv = vehicle("Small MPV (Suzuki Ertiga)", "small_mpv_1_5");

    expect(quoteVehicle(mercedesC, {
      distanceKm: 28,
      isReturn: false,
      serviceType: "airport_transfer",
      extrasTotal: 0,
    })).toBe(1450);

    expect(quoteVehicle(blackVClass, {
      distanceKm: 50,
      isReturn: true,
      serviceType: "point_to_point",
      extrasTotal: 150,
    })).toBe(4250);

    expect(quoteVehicle(smallMpv, {
      distanceKm: 50,
      isReturn: true,
      serviceType: "airport_transfer",
      extrasTotal: 100,
    })).toBe(1900);
  });

  it("keeps the hardcoded test vehicle at R2 for payment-flow testing", () => {
    expect(isReturnTripVehicle(TEST_VEHICLE)).toBe(true);
    expect(quoteVehicle(TEST_VEHICLE, {
      distanceKm: 50,
      isReturn: false,
      serviceType: "airport_transfer",
      extrasTotal: 100,
    })).toBe(2);
    expect(quoteVehicle(TEST_VEHICLE, {
      distanceKm: 50,
      isReturn: true,
      serviceType: "point_to_point",
      extrasTotal: 100,
    })).toBe(2);
    expect(quoteVehicle(TEST_VEHICLE, {
      distanceKm: 0,
      isReturn: false,
      serviceType: "chauffeur",
      hours: 4,
      extrasTotal: 100,
      poiPrice: 2500,
    })).toBe(2);
  });
});
