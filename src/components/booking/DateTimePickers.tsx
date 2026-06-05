import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface DateProps { value: string; onChange: (v: string) => void; placeholder?: string; minDate?: Date; }

export const DatePicker = ({ value, onChange, placeholder = "Select date", minDate }: DateProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const min = minDate || today;
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [vY, setVY] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [vM, setVM] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const daysIn = new Date(vY, vM + 1, 0).getDate();
  const first = new Date(vY, vM, 1).getDay();
  const select = (d: number) => {
    const dt = new Date(vY, vM, d);
    onChange(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`);
    setOpen(false);
  };
  const display = parsed ? parsed.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={cn("w-full h-11 px-3 rounded-lg border text-sm flex items-center justify-between gap-2 bg-background hover:border-accent/50",
          open ? "border-accent ring-2 ring-accent/20" : "border-input", !display && "text-muted-foreground")}>
        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" />{display || placeholder}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button type="button" onClick={() => { if (vM===0){setVM(11);setVY(y=>y-1);} else setVM(m=>m-1); }} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-semibold">{MONTHS[vM]} {vY}</span>
            <button type="button" onClick={() => { if (vM===11){setVM(0);setVY(y=>y+1);} else setVM(m=>m+1); }} className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysIn }).map((_, i) => {
              const day = i + 1;
              const td = new Date(vY, vM, day); td.setHours(0,0,0,0);
              const dis = td < min;
              const sel = parsed && parsed.getFullYear()===vY && parsed.getMonth()===vM && parsed.getDate()===day;
              return (
                <button key={day} type="button" disabled={dis} onClick={() => select(day)}
                  className={cn("w-full aspect-square rounded-lg text-sm font-medium",
                    sel && "bg-accent text-white", !sel && !dis && "hover:bg-accent/10 text-foreground",
                    dis && "text-muted-foreground/30 cursor-not-allowed")}>{day}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MIN_OPTS = [0, 15, 30, 45];

interface TimeProps { value: string; onChange: (v: string) => void; placeholder?: string; }

export const TimePicker = ({ value, onChange, placeholder = "Select time" }: TimeProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  const [m, setM] = useState<number | null>(null);
  useEffect(() => { if (value) { const [hh, mm] = value.split(":").map(Number); setH(hh); setM(mm); } }, [value]);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);
  const set = (hh: number, mm: number) => { setH(hh); setM(mm); onChange(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`); };
  const fmt = () => { if (h===null||m===null) return ""; const p = h>=12?"PM":"AM"; const d = h===0?12:h>12?h-12:h; return `${d}:${String(m).padStart(2,"0")} ${p}`; };
  const display = fmt();
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={cn("w-full h-11 px-3 rounded-lg border text-sm flex items-center justify-between gap-2 bg-background hover:border-accent/50",
          open ? "border-accent ring-2 ring-accent/20" : "border-input", !display && "text-muted-foreground")}>
        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />{display || placeholder}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-card border border-border rounded-2xl shadow-xl w-64 overflow-hidden">
          <div className="flex">
            <div className="flex-1 border-r border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Hour</p>
              <div className="overflow-y-auto h-48 py-1">
                {HOURS.map(hh => { const p = hh>=12?"PM":"AM"; const d = hh===0?12:hh>12?hh-12:hh;
                  return <button key={hh} type="button" onClick={() => set(hh, m ?? 0)}
                    className={cn("w-full px-4 py-2 text-sm text-left", h===hh ? "bg-accent text-white font-semibold" : "hover:bg-accent/10")}>{d} {p}</button>;
                })}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2 border-b border-border/50">Min</p>
              <div className="overflow-y-auto h-48 py-1">
                {MIN_OPTS.map(mm => <button key={mm} type="button" onClick={() => set(h ?? 8, mm)}
                  className={cn("w-full px-4 py-2 text-sm text-left", m===mm ? "bg-accent text-white font-semibold" : "hover:bg-accent/10")}>:{String(mm).padStart(2,"0")}</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
