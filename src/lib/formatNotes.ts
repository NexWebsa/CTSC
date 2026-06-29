/**
 * Format booking notes for display.
 * Handles both plain text and legacy JSON formats.
 */
export type FormattedNoteItem = {
  label: string;
  value: string;
};

const normalizeNoteText = (value: string): string =>
  value
    .replace(/\u00e2\u0086\u0092/g, "->")
    .replace(/\u2192/g, "->")
    .replace(/\s+\|\s+/g, " | ")
    .trim();

export const formatNotes = (notes: string | null): string | null => {
  if (!notes) return null;

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
          `Return: ${rt.pickupAddress || "N/A"} -> ${rt.dropoffAddress || "N/A"} on ${rt.date || "N/A"} at ${rt.time || "N/A"}`
        );
      }
      return parts.length > 0 ? normalizeNoteText(parts.join(" | ")) : null;
    }
  } catch {
    // Not JSON, so it is already plain text.
  }

  return normalizeNoteText(notes);
};

export const formatNoteItems = (notes: string | null): FormattedNoteItem[] => {
  const formatted = formatNotes(notes);
  if (!formatted) return [];

  return formatted
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^([^:]{1,42}):\s*(.+)$/);
      if (!match) return { label: "Note", value: part };

      return {
        label: match[1].trim(),
        value: match[2].trim(),
      };
    })
    .filter((item) => item.value.length > 0);
};
