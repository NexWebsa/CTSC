import { describe, expect, it } from "vitest";
import { lookupTablePrice, quoteVehicle, type Vehicle } from "./pricing";

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
    [21, 1450],
    [28, 1450],
    [29, 1500],
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
    [21, 1700],
    [28, 1700],
    [29, 1750],
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

  it("uses corrected table pricing in quote totals stored before Yoco checkout", () => {
    const mercedesC = vehicle("Mercedes C Class", "mercedes_c");
    const blackVClass = vehicle("Mercedes V Class 300", "luxury_v_class_vip");

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
  });
});
