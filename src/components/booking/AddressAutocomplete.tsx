/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

let mapsPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as any;
  if (w.google?.maps?.places) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  if (!key) {
    console.warn("Google Maps browser key not configured");
    return Promise.reject(new Error("Maps key missing"));
  }

  mapsPromise = new Promise<void>((resolve, reject) => {
    w.__lovableInitMaps = () => resolve();

    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=__lovableInitMaps${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.onerror = () => reject(new Error("Maps script failed to load"));
    document.head.appendChild(s);
  });

  return mapsPromise;
}

export function useGoogleMaps() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMaps()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  return ready;
}

interface Suggestion {
  placeId: string;
  text: string;
  secondary: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  region?: string;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = "Address, airport, hotel…",
  className = "",
  region = "ZA",
}: AddressAutocompleteProps) => {
  const ready = useGoogleMaps();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const tokenRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const updateDropdownPos = () => {
    if (!inputRef.current || typeof window === "undefined") return;

    const r = inputRef.current.getBoundingClientRect();
    const visualViewport = window.visualViewport;
    const viewportLeft = visualViewport?.offsetLeft ?? 0;
    const viewportWidth = visualViewport?.width ?? window.innerWidth;
    const padding = 12;
    const availableWidth = Math.max(0, viewportWidth - padding * 2);
    const width = Math.min(r.width, availableWidth);
    const minLeft = viewportLeft + padding;
    const maxLeft = viewportLeft + viewportWidth - width - padding;

    setDropdownStyle({
      position: "fixed",
      top: r.bottom + 6,
      left: Math.min(Math.max(r.left, minLeft), Math.max(minLeft, maxLeft)),
      width,
      maxWidth: availableWidth,
      boxSizing: "border-box",
      zIndex: 99999,
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedInput = wrapRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedInput && !clickedDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateDropdownPos();

    const update = () => updateDropdownPos();

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [open]);

  const fetchSuggestions = async (input: string) => {
    if (!ready || input.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    try {
      const g = (window as any).google;

      const { AutocompleteSuggestion, AutocompleteSessionToken } =
        await g.maps.importLibrary("places");

      if (!tokenRef.current) {
        tokenRef.current = new AutocompleteSessionToken();
      }

      const { suggestions: out } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: tokenRef.current,
          includedRegionCodes: [region],
        });

      const mapped: Suggestion[] = (out || [])
        .slice(0, 6)
        .map((s: any) => {
          const p = s.placePrediction;

          return {
            placeId: p?.placeId ?? "",
            text: p?.text?.text ?? p?.mainText?.text ?? "",
            secondary: p?.secondaryText?.text ?? "",
          };
        })
        .filter((s: Suggestion) => s.text);

      setSuggestions(mapped);
      setOpen(mapped.length > 0);
      setHighlight(0);

      if (mapped.length > 0) {
        window.requestAnimationFrame(updateDropdownPos);
      }
    } catch (e) {
      console.error("Autocomplete failed", e);
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleChange = (v: string) => {
    onChange(v);
    updateDropdownPos();

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => fetchSuggestions(v), 220);
  };

  const pick = (s: Suggestion) => {
    const full = s.secondary ? `${s.text}, ${s.secondary}` : s.text;

    onChange(full);
    inputRef.current?.blur();
    setOpen(false);
    setSuggestions([]);
    tokenRef.current = null;
  };

  const dropdown =
    open && suggestions.length > 0 && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/10"
          >
            <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {suggestions.map((s, i) => (
              <button
                key={s.placeId + i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                  i === highlight ? "bg-accent/10" : "hover:bg-accent/5"
                }`}
              >
                <MapPin className="mt-0.5 shrink-0 w-4 h-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="break-words font-medium leading-snug text-foreground">
                    {s.text}
                  </div>
                  {s.secondary && (
                    <div className="truncate text-xs text-muted-foreground">
                      {s.secondary}
                    </div>
                  )}
                </div>
              </button>
            ))}

            <div className="px-3 py-1.5 border-t border-border bg-muted/30 flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-muted-foreground">
                Powered by Google
              </span>
            </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={wrapRef} className="relative w-full min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          updateDropdownPos();
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && suggestions[highlight]) {
            e.preventDefault();
            pick(suggestions[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`block h-11 w-full min-w-0 max-w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:text-sm ${className}`}
      />

      {dropdown}
    </div>
  );
};
