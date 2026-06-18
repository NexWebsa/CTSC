ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_confirmation_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_confirmation_email_ids jsonb;
