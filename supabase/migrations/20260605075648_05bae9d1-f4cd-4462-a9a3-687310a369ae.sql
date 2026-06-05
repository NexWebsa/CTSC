ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS extras jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extras_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_stop boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_stop_location text;