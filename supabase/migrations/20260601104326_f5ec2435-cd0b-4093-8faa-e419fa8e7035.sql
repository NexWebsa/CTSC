
-- Guest bookings + extra trip-detail columns
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS passengers INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS baby_seats INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS luggage_checkin INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS luggage_carry INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trailer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS oversize_luggage BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trip_direction TEXT DEFAULT 'one_way',
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS flight_number TEXT,
  ADD COLUMN IF NOT EXISTS return_pickup_date DATE,
  ADD COLUMN IF NOT EXISTS return_pickup_time TIME;

-- Sanity constraint: either logged-in user_id OR guest with contact email
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_user_or_guest;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_user_or_guest
  CHECK ( (user_id IS NOT NULL) OR (is_guest = true AND guest_email IS NOT NULL) );

-- Update existing INSERT policy to support guests
DROP POLICY IF EXISTS "Users create bookings" ON public.bookings;
CREATE POLICY "Users or guests create bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND is_guest = false)
    OR
    (user_id IS NULL AND is_guest = true AND guest_email IS NOT NULL)
  );

-- Grant anon role INSERT access for guest checkout
GRANT INSERT ON public.bookings TO anon;
