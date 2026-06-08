import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface VehicleDetail {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  image_url: string | null;
  features?: string[] | null;
  gallery_images?: string[] | null;
}

interface Props {
  vehicle: VehicleDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailModal = ({ vehicle, open, onOpenChange }: Props) => {
  const [index, setIndex] = useState(0);

  if (!vehicle) return null;

  const images = [
    ...(vehicle.image_url ? [vehicle.image_url] : []),
    ...((vehicle.gallery_images || []).filter(Boolean)),
  ];
  const hasImages = images.length > 0;
  const current = hasImages ? images[index % images.length] : null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  const features = (vehicle.features || []).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setIndex(0); }}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-card border-border">
        <DialogTitle className="sr-only">{vehicle.name}</DialogTitle>
        <DialogDescription className="sr-only">{vehicle.description || ""}</DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
          {/* Image slideshow */}
          <div className="relative bg-secondary aspect-[4/3] md:aspect-auto md:h-[600px]">
            {current ? (
              <img src={current} alt={vehicle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index % images.length ? "w-6 bg-white" : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details */}
          <ScrollArea className="md:h-[600px]">
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-xs font-medium text-foreground mb-3">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  {vehicle.capacity} Seater
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{vehicle.name}</h2>
                {vehicle.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{vehicle.description}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-accent mb-3">
                  Features & Specifications
                </h3>
                {features.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specifications listed.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2"
                      >
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-2">
                <Link to="/book" onClick={() => onOpenChange(false)}>
                  <Button variant="accent" className="w-full">Book This Vehicle</Button>
                </Link>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailModal;
