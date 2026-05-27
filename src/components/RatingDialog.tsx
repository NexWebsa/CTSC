import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  userId: string;
  driverId?: string | null;
  driverName?: string | null;
  onRated?: () => void;
}

const RatingDialog = ({ open, onOpenChange, bookingId, userId, driverId, driverName, onRated }: RatingDialogProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("booking_ratings").insert({
        booking_id: bookingId,
        user_id: userId,
        driver_id: driverId || null,
        rating,
        comment: comment.trim() || null,
      });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "You've already rated this trip" });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Thank you for your rating!" });
      }
      onRated?.();
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (err) {
      toast({ title: "Failed to submit rating", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate Your Trip</DialogTitle>
          <DialogDescription>
            {driverName ? `How was your ride with ${driverName}?` : "How was your ride?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                    star <= (hover || rating)
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Great"}
            {rating === 5 && "Excellent!"}
          </p>

          {/* Comment */}
          <Textarea
            placeholder="Leave a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-xl resize-none"
            rows={3}
            maxLength={500}
          />

          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            variant="accent"
            className="w-full rounded-xl gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
