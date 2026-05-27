/**
 * Format booking notes for display.
 * Handles both plain text (new format) and legacy JSON (old format).
 */
export const formatNotes = (notes: string | null): string | null => {
  if (!notes) return null;

  // If it's already plain text, return as-is
  try {
    const parsed = JSON.parse(notes);
    if (typeof parsed === "object" && parsed !== null) {
      const parts: string[] = [];
      if (parsed.numPassengers && Number(parsed.numPassengers) > 1) {
        parts.push(`Passengers: ${parsed.numPassengers}`);
      }
      if (parsed.flightNumber) parts.push(`Flight: ${parsed.flightNumber}`);
      if (parsed.extraDetails) parts.push(parsed.extraDetails);
      if (parsed.returnTrip) {
        const rt = parsed.returnTrip;
        parts.push(
          `Return: ${rt.pickupAddress || "N/A"} → ${rt.dropoffAddress || "N/A"} on ${rt.date || "N/A"} at ${rt.time || "N/A"}`
        );
      }
      return parts.length > 0 ? parts.join(" | ") : null;
    }
  } catch {
    // Not JSON — plain text
  }

  return notes;
};
