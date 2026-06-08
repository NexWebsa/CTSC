ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}';