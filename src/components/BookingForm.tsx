import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Check,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Mail,
  Users,
  Plane,
  FileText,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  price_per_km: number;
  price_per_hour: number;
}

const BookingForm = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showReturnTrip, setShowReturnTrip] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+27",
    numPassengers: 1,
    tripType: "airport_transfers",
    pickupAddress: "",
    dropoffAddress: "",
    pickupDate: "",
    pickupTime: "",
    returnAddress: "",
    returnDropoffAddress: "",
    returnDate: "",
    returnTime: "",
    flightNumber: "",
    vehicleId: "",
    extraDetails: "",
  });

  useEffect(() => {
    fetchVehicles();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Error",
        description: "Could not load vehicles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      if (data) {
        let countryCode = "+27"; // default
        let phoneNumber = "";

        if (data.phone) {
          // Extract country code and phone number from stored format
          // e.g., "+27 74 786 2736" → countryCode: "+27", phone: "74 786 2736"
          const match = data.phone.match(/^(\+\d{1,3})\s*(.*)$/);
          if (match) {
            countryCode = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = data.phone;
          }
        }

        setFormData((prev) => ({
          ...prev,
          fullName: data.full_name || "",
          phone: phoneNumber,
          countryCode: countryCode,
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to book.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.pickupAddress ||
      !formData.dropoffAddress ||
      !formData.pickupDate ||
      !formData.pickupTime ||
      !formData.vehicleId
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.tripType === "other" && !formData.extraDetails) {
      toast({
        title: "Details required",
        description: "Please provide details about your custom trip type.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update user profile with latest info
      const phoneNumber = `${formData.countryCode}${formData.phone}`;
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName,
        phone: phoneNumber,
        updated_at: new Date().toISOString(),
      });

      // Prepare booking data
      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      const priceEstimate =
        formData.tripType === "airport_transfers"
          ? selectedVehicle?.price_per_km || 0
          : selectedVehicle?.price_per_hour || 0;

      // Build a clean, human-readable notes string
      const noteParts: string[] = [];
      if (formData.numPassengers && Number(formData.numPassengers) > 1) {
        noteParts.push(`Passengers: ${formData.numPassengers}`);
      }
      if (formData.flightNumber) {
        noteParts.push(`Flight: ${formData.flightNumber}`);
      }
      if (formData.extraDetails) {
        noteParts.push(formData.extraDetails);
      }
      if (showReturnTrip && formData.returnAddress) {
        noteParts.push(
          `Return trip: ${formData.returnAddress} → ${formData.returnDropoffAddress || "N/A"} on ${formData.returnDate || "N/A"} at ${formData.returnTime || "N/A"}`
        );
      }
      const bookingNotes = noteParts.length > 0 ? noteParts.join(" | ") : null;

      // Map trip types to service types (matching schema CHECK constraint)
      const serviceTypeMap: { [key: string]: string } = {
        airport_transfers: "airport_transfer",
        shuttle_service: "point_to_point",
        cape_town_tour: "point_to_point",
        other: "point_to_point",
      };

      const now = new Date().toISOString();
      const { data: insertedBooking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          vehicle_id: formData.vehicleId,
          service_type: serviceTypeMap[formData.tripType] || "point_to_point",
          booking_type: "transfer",
          pickup_location: formData.pickupAddress,
          dropoff_location: formData.dropoffAddress,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          status: "pending",
          price_estimate: priceEstimate,
          notes: bookingNotes,
          is_favourite: false,
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (error) throw error;

      const bookingId = insertedBooking.id;

      // 1) Create Yoco checkout (returns hosted checkout URL)
      const origin = window.location.origin;
      const { data: checkoutData, error: checkoutError } =
        await supabase.functions.invoke("create-yoco-checkout", {
          body: {
            bookingId,
            amount: priceEstimate,
            currency: "ZAR",
            successUrl: `${origin}/payment-success?booking_id=${bookingId}`,
            cancelUrl: `${origin}/payment-cancelled?booking_id=${bookingId}`,
          },
        });

      if (checkoutError) throw checkoutError;

      const checkoutUrl =
        checkoutData?.checkoutUrl ||
        checkoutData?.checkout_url ||
        checkoutData?.redirectUrl ||
        checkoutData?.url;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from Yoco.");
      }

      // 2) Send booking email with payment link (template lives in storage bucket)
      const { error: emailError } = await supabase.functions.invoke(
        "send-booking-email",
        {
          body: {
            bookingId,
            checkoutUrl,
            to: formData.email,
          },
        }
      );

      if (emailError) {
        console.error("Email send error:", emailError);
        toast({
          title: "Booking saved, email failed",
          description:
            "Your booking is created but we couldn't send the email. Please contact us.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent! 📧",
          description:
            "Check your inbox for the secure Yoco payment link to complete your booking.",
        });
      }

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        countryCode: "+27",
        numPassengers: 1,
        tripType: "airport_transfers",
        pickupAddress: "",
        dropoffAddress: "",
        pickupDate: "",
        pickupTime: "",
        returnAddress: "",
        returnDropoffAddress: "",
        returnDate: "",
        returnTime: "",
        flightNumber: "",
        vehicleId: "",
        extraDetails: "",
      });
      setShowReturnTrip(false);

      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card border border-border rounded-2xl p-8">
        {/* Personal Details Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Your Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Full Name *
              </Label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="h-11"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Email *
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your@email.com"
                className="h-11"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Phone Number *
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => handleChange("countryCode", value)}
                >
                  <SelectTrigger className="w-24 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+27">+27</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+33">+33</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="21 300 5297"
                  className="flex-1 h-11"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Number of Passengers *
              </Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={formData.numPassengers}
                onChange={(e) =>
                  handleChange("numPassengers", parseInt(e.target.value))
                }
                className="h-11"
                required
              />
            </div>
          </div>
        </div>

        {/* Trip Details Section */}
        <div className="mb-8 border-t border-border pt-8">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Trip Details
          </h3>

          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Select Trip Type *
            </Label>
            <Select
              value={formData.tripType}
              onValueChange={(value) => handleChange("tripType", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a trip type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airport_transfers">
                  Airport Transfers
                </SelectItem>
                <SelectItem value="shuttle_service">Shuttle Service</SelectItem>
                <SelectItem value="cape_town_tour">Cape Town Tour</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Pickup Address *
              </Label>
              <Input
                value={formData.pickupAddress}
                onChange={(e) => handleChange("pickupAddress", e.target.value)}
                placeholder="e.g., Cape Town International Airport"
                className="h-11"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Drop-off Address *
              </Label>
              <Input
                value={formData.dropoffAddress}
                onChange={(e) => handleChange("dropoffAddress", e.target.value)}
                placeholder="e.g., Hotel or destination"
                className="h-11"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Pickup Date *
              </Label>
              <Input
                type="date"
                value={formData.pickupDate}
                onChange={(e) => handleChange("pickupDate", e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                <Clock className="w-4 h-4 text-accent" /> Pickup Time *
              </Label>
              <Input
                type="time"
                value={formData.pickupTime}
                onChange={(e) => handleChange("pickupTime", e.target.value)}
                className="h-11"
                required
              />
            </div>
          </div>
        </div>

        {/* Return Trip Section */}
        <div className="mb-8 border-t border-border pt-8">
          <button
            type="button"
            onClick={() => setShowReturnTrip(!showReturnTrip)}
            className="flex items-center gap-2 text-accent font-medium mb-6 hover:text-accent/80 transition"
          >
            {showReturnTrip ? (
              <>
                <X className="w-4 h-4" /> Remove Return Trip
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Return Trip (Optional)
              </>
            )}
          </button>

          {showReturnTrip && (
            <div className="space-y-5 p-5 bg-background/50 rounded-lg border border-border">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> Return Pickup
                    Address
                  </Label>
                  <Input
                    value={formData.returnAddress}
                    onChange={(e) =>
                      handleChange("returnAddress", e.target.value)
                    }
                    placeholder="e.g., Hotel"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> Return Drop-off
                    Address
                  </Label>
                  <Input
                    value={formData.returnDropoffAddress}
                    onChange={(e) =>
                      handleChange("returnDropoffAddress", e.target.value)
                    }
                    placeholder="e.g., Airport"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" /> Return Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleChange("returnDate", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Return Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) => handleChange("returnTime", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flight & Vehicle Section */}
        <div className="mb-8 border-t border-border pt-8">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Additional Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
                <Plane className="w-4 h-4 text-accent" /> Flight Number
                (Optional)
              </Label>
              <Input
                value={formData.flightNumber}
                onChange={(e) => handleChange("flightNumber", e.target.value)}
                placeholder="e.g., SA123"
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Preferred Vehicle *
              </Label>
              {loadingVehicles ? (
                <div className="h-11 flex items-center justify-center bg-background rounded-lg border border-border">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => handleChange("vehicleId", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.capacity} passengers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Extra Details Section */}
        <div className="border-t border-border pt-8">
          <Label className="text-sm font-medium text-foreground mb-2 block items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Extra Details
            {formData.tripType === "other" && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Textarea
            value={formData.extraDetails}
            onChange={(e) => handleChange("extraDetails", e.target.value)}
            placeholder={
              formData.tripType === "other"
                ? "Please describe your trip type and requirements..."
                : "Flight details, special requirements, luggage info, etc."
            }
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {formData.tripType === "other"
              ? "Required - Please provide details about your custom trip type"
              : "Tell us anything else we should know about your booking"}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate("/")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={submitting || loadingVehicles}
          className="flex-1 gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Book Now
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
