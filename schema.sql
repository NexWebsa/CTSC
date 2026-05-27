-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles / Fleet
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  price_per_km DECIMAL(10,2),
  price_per_hour DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings (core table)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES drivers(id),
  service_type TEXT CHECK (service_type IN ('airport_transfer','chauffeur','point_to_point')) NOT NULL,
  booking_type TEXT CHECK (booking_type IN ('transfer','hourly')) DEFAULT 'transfer',
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT,
  hours INTEGER,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')) DEFAULT 'pending',
  price_estimate DECIMAL(10,2),
  is_favourite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings
CREATE TABLE booking_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, user_id)
);

-- Roles (never on profiles table)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Role-check helper (security definer, avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view active vehicles" ON vehicles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage vehicles" ON vehicles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view drivers" ON drivers FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage drivers" ON drivers FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all bookings" ON bookings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users rate own bookings" ON booking_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own ratings" ON booking_ratings FOR SELECT USING (auth.uid() = user_id);

-- Enable Realtime on bookings for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

CREATE POLICY "Users can read own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- create two storage buckets

-- Create storage buckets for vehicle images and driver photos
-- Run this in Supabase SQL Editor

-- Create vehicle-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- Create driver-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-photos', 'driver-photos', true);

-- Create RLS Policies for vehicle-images bucket
CREATE POLICY "Public Read Access to vehicle-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admin Upload to vehicle-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Delete from vehicle-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'vehicle-images' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Create RLS Policies for driver-photos bucket
CREATE POLICY "Admin Read Access to driver-photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Upload to driver-photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Delete from driver-photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));


-- Trip Types & Sample Bookings

-- Create trip_types table for managing booking types
CREATE TABLE trip_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('airport_transfer','chauffeur','point_to_point')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Trip Types
INSERT INTO trip_types (name, description, service_type, is_active, created_at)
VALUES
  ('Airport Transfers', 'Door-to-door service to/from the airport with flight tracking', 'airport_transfer', true, NOW()),
  ('Shuttle Service', 'Point-to-point transportation for individuals or small groups', 'point_to_point', true, NOW()),
  ('Cape Town Tour', 'Guided or self-drive tours around Cape Town''s iconic locations', 'point_to_point', true, NOW()),
  ('Chauffeur Service', 'Premium chauffeur-driven transportation for executives and VIPs', 'chauffeur', true, NOW()),
  ('Custom Booking', 'Customized transportation solutions for specific needs', 'point_to_point', true, NOW()),
  ('Employee Transportation', 'Get your team to work safely, on time, and ready to perform.', 'point_to_point', true, NOW()),
  ('Staff Shuttle Service', 'Move your team efficiently with our dedicated staff shuttle service.', 'point_to_point', true, NOW());
-- Enable RLS on trip_types
ALTER TABLE trip_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_types
CREATE POLICY "Anyone can view active trip types" ON trip_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage trip types" ON trip_types FOR ALL USING ((SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));


-- Allow admins to read all profiles (needed for admin dashboard)
CREATE POLICY "Admins read all profiles" ON profiles 
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Allow authenticated users to read basic driver info (for seeing assigned driver)
CREATE POLICY "Users can view assigned drivers" ON drivers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.driver_id = drivers.id 
      AND bookings.user_id = auth.uid()
    )
  );


ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending','approved','driver_assigned','on_the_way','arrived','in_progress','completed','cancelled'));
UPDATE bookings SET status = 'approved' WHERE status = 'confirmed';


-- Allow drivers to read their own driver record (matched by auth email)
CREATE POLICY "Drivers can view own record" ON drivers
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow drivers to read their assigned bookings
CREATE POLICY "Drivers read assigned bookings" ON bookings
  FOR SELECT USING (
    driver_id IN (
      SELECT id FROM drivers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Allow drivers to update status on their assigned bookings
CREATE POLICY "Drivers update assigned bookings" ON bookings
  FOR UPDATE USING (
    driver_id IN (
      SELECT id FROM drivers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Allow drivers to read profiles (for customer names)
CREATE POLICY "Drivers read profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers 
      WHERE drivers.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
  
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';



BEGIN;

CREATE OR REPLACE FUNCTION public.get_current_driver_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.drivers
  WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_user_view_driver(_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.driver_id = _driver_id
      AND bookings.user_id = auth.uid()
  )
$$;

DROP POLICY IF EXISTS "Users can view assigned drivers" ON public.drivers;
CREATE POLICY "Users can view assigned drivers"
ON public.drivers
FOR SELECT
USING (public.can_user_view_driver(id));

DROP POLICY IF EXISTS "Drivers read own record" ON public.drivers;
CREATE POLICY "Drivers read own record"
ON public.drivers
FOR SELECT
USING (id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers view assigned bookings" ON public.bookings;
CREATE POLICY "Drivers view assigned bookings"
ON public.bookings
FOR SELECT
USING (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers update assigned bookings" ON public.bookings;
CREATE POLICY "Drivers update assigned bookings"
ON public.bookings
FOR UPDATE
USING (driver_id = public.get_current_driver_id())
WITH CHECK (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers read customer profiles for assigned bookings" ON public.profiles;
CREATE POLICY "Drivers read customer profiles for assigned bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.user_id = profiles.id
      AND bookings.driver_id = public.get_current_driver_id()
  )
);

COMMIT;


DROP POLICY IF EXISTS "Drivers can view own record" ON drivers;
DROP POLICY IF EXISTS "Drivers read assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Drivers read profiles" ON profiles;


-- Verify these policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'bookings' AND policyname LIKE 'Drivers%';


BEGIN;

CREATE OR REPLACE FUNCTION public.get_current_driver_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.drivers
  WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_user_view_driver(_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.driver_id = _driver_id
      AND bookings.user_id = auth.uid()
  )
$$;

DROP POLICY IF EXISTS "Users can view assigned drivers" ON public.drivers;
CREATE POLICY "Users can view assigned drivers"
ON public.drivers
FOR SELECT
USING (public.can_user_view_driver(id));

DROP POLICY IF EXISTS "Drivers read own record" ON public.drivers;
CREATE POLICY "Drivers read own record"
ON public.drivers
FOR SELECT
USING (id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers view assigned bookings" ON public.bookings;
CREATE POLICY "Drivers view assigned bookings"
ON public.bookings
FOR SELECT
USING (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers update assigned bookings" ON public.bookings;
CREATE POLICY "Drivers update assigned bookings"
ON public.bookings
FOR UPDATE
USING (driver_id = public.get_current_driver_id())
WITH CHECK (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers read customer profiles for assigned bookings" ON public.profiles;
CREATE POLICY "Drivers read customer profiles for assigned bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.user_id = profiles.id
      AND bookings.driver_id = public.get_current_driver_id()
  )
);

COMMIT;


-- Create user-photos bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true);

-- Anyone can view user photos (public avatars build trust)
CREATE POLICY "Public Read Access to user-photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-photos');

-- Authenticated users can upload their own avatar (path must start with their user ID)
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' 
    AND auth.uid() IS NOT NULL 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/replace their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage all user photos
CREATE POLICY "Admin manage user-photos" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-photos' 
    AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );


ALTER TABLE booking_ratings ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id);

UPDATE booking_ratings br
SET driver_id = b.driver_id
FROM bookings b
WHERE br.booking_id = b.id AND br.driver_id IS NULL;

CREATE POLICY "Drivers read own ratings" ON booking_ratings
  FOR SELECT USING (driver_id = public.get_current_driver_id());

CREATE POLICY "Drivers update own record" ON drivers
  FOR UPDATE USING (id = public.get_current_driver_id())
  WITH CHECK (id = public.get_current_driver_id());


-- Allow drivers to upload their own avatar
CREATE POLICY "Drivers upload own avatar to driver-photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-photos' AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Drivers update own avatar in driver-photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'driver-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Make driver photos publicly viewable
DROP POLICY IF EXISTS "Admin Read Access to driver-photos" ON storage.objects;
CREATE POLICY "Public Read Access to driver-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'driver-photos');


-- payments

-- Add payment columns to bookings table

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'failed')) DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS yoco_checkout_id TEXT;

-- Update existing bookings to have 'unpaid' payment_status
UPDATE bookings SET payment_status = 'unpaid' WHERE payment_status IS NULL;


-- ============================================================
-- CHATBOT KB SCHEMA
-- OPTIMIZED FOR OPENAI text-embedding-3-small (1536)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- CLEANUP
-- ============================================================

DROP FUNCTION IF EXISTS match_kb_documents(TEXT, INTEGER);
DROP TABLE IF EXISTS kb_documents CASCADE;

-- ============================================================
-- KNOWLEDGE BASE TABLE
-- ============================================================

CREATE TABLE kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VECTOR INDEX
-- ============================================================

CREATE INDEX kb_documents_embedding_idx
ON kb_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================
-- RAG MATCH FUNCTION
-- IMPORTANT:
-- TEXT input -> cast to vector internally
-- avoids Supabase RPC vector issues
-- ============================================================

CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    kb_documents.id,
    kb_documents.title,
    kb_documents.content,
    kb_documents.category,
    1 - (
      kb_documents.embedding <=> query_embedding::vector
    ) AS similarity
  FROM kb_documents
  WHERE kb_documents.embedding IS NOT NULL
  ORDER BY kb_documents.embedding <=> query_embedding::vector
  LIMIT match_count;
$$;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb public read" ON kb_documents;

CREATE POLICY "kb public read"
ON kb_documents
FOR SELECT
USING (true);

-- ============================================================
-- CLEAR DATA
-- ============================================================

TRUNCATE kb_documents;

-- ============================================================
-- KNOWLEDGE BASE DATA
-- OPTIMIZED FOR SEMANTIC SEARCH
-- ============================================================

INSERT INTO kb_documents (title, category, content)
VALUES

(
'How to book a shuttle',
'booking',
'To book a shuttle, reserve a ride, create a booking, or schedule transport on Cape Town Shuttle Services:

1. Click "Book Now" in the navigation menu or visit /book.
2. Choose a service type such as:
   - Airport Transfers
   - Chauffeur Services
   - Point-to-Point Transfers
   - Staff Shuttle Service
   - Employee Transportation
   - Custom Trips
3. Select your preferred vehicle from the fleet.
4. Enter pickup and drop-off locations.
5. Select the travel date and pickup time.
6. Enter passenger details and trip information.
7. Add extra notes if needed.
8. Submit the booking form.

After submission, admins review the booking and assign a driver and vehicle.

Users can track their booking from the Dashboard.'
),

(
'Custom Trip bookings',
'booking',
'If your transport needs do not match a standard trip category, choose the "Custom Trip" option in the booking form.

Custom Trips allow users to describe special travel requirements, routes, or schedules inside the Extra Details section so the team can prepare a custom quote and transport plan.'
),

(
'Booking lifecycle and statuses',
'booking',
'Bookings move through multiple statuses:

pending = booking created and awaiting admin review.
confirmed = booking approved by admin.
assigned = driver and vehicle assigned.
in_progress = trip currently active.
completed = trip finished successfully.
cancelled = booking cancelled.

Users can monitor booking progress and trip status in real time from the Dashboard.'
),

(
'Driver assignment',
'driver',
'After a user submits a shuttle booking, admins review the request and assign an available driver and vehicle.

Assigned drivers receive trips in the Driver Dashboard. Users can view assigned driver and vehicle details directly from their Dashboard booking information.'
),

(
'Yoco payments',
'payments',
'Cape Town Shuttle Services uses Yoco for secure online card payments.

After a booking is confirmed, users can pay directly from the Dashboard by clicking the Pay button. Users are redirected to Yoco hosted checkout to complete payment securely.

Payment statuses include:
paid,
unpaid,
and failed.

Payment updates happen automatically through Yoco webhooks.

Card information is securely handled by Yoco and never stored on the platform servers.'
),

(
'Payment status meanings',
'payments',
'Payment statuses work as follows:

unpaid = booking exists but payment not completed.
paid = Yoco successfully confirmed payment.
failed = payment attempt failed and can be retried from the Dashboard.'
),

(
'Rating drivers',
'ratings',
'After a trip is completed, users can rate their assigned driver from 1 to 5 stars inside the Dashboard.

Ratings are connected to both the booking and the driver profile to help maintain service quality.'
),

(
'User accounts and profiles',
'account',
'Users can create accounts or log in using email/password authentication or Google login.

Profiles include:
full name,
phone number,
and avatar image.

After login:
regular users access the Dashboard,
drivers access the Driver Dashboard,
admins access the Admin Panel.'
),

(
'Fleet and vehicles',
'fleet',
'The Fleet page displays available shuttle vehicles including:
vehicle name,
capacity,
description,
vehicle image,
and pricing per kilometre.

Admins manage fleet information from the Admin Fleet section.'
),

(
'Services offered',
'services',
'Cape Town Shuttle Services offers:
Airport Transfers,
Chauffeur Services,
Point-to-Point Transfers,
Employee Transportation,
Staff Shuttle Services,
and Custom Trips.'
),

(
'Realtime updates',
'system',
'The platform uses Supabase Realtime features to instantly update:
booking statuses,
payment confirmations,
and driver assignments

without requiring users to refresh the page.'
),

(
'Contact and support',
'support',
'Users can visit the Contact page at /contact to contact the Cape Town Shuttle Services support team for additional help and assistance.'
);

-- ============================================================
-- VERIFY DATA
-- ============================================================

SELECT COUNT(*) FROM kb_documents;

-- ============================================================
-- DONE
-- ============================================================

SELECT
  title,
  embedding IS NOT NULL AS has_embedding
FROM kb_documents;

SELECT COUNT(*) FROM kb_documents;


SELECT *
FROM match_kb_documents(
  (
    SELECT embedding
    FROM kb_documents
    LIMIT 1
  ),
  5
);

UPDATE kb_documents
SET embedding = NULL;


SELECT *
FROM match_kb_documents(
  (
    SELECT embedding
    FROM kb_documents
    LIMIT 1
  ),
  5
);

SELECT
  title,
  vector_dims(embedding)
FROM kb_documents;

SELECT title, embedding IS NULL
FROM kb_documents;



DROP FUNCTION IF EXISTS match_kb_documents(vector, integer);

CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    kb_documents.id,
    kb_documents.title,
    kb_documents.content,
    kb_documents.category,
    1 - (
      kb_documents.embedding <=> query_embedding::vector
    ) AS similarity
  FROM kb_documents
  WHERE kb_documents.embedding IS NOT NULL
  ORDER BY kb_documents.embedding <=> query_embedding::vector
  LIMIT match_count;
$$;


-- ============================================================
-- CHATBOT IMPROVEMENTS
-- 1) Auto-invalidate embeddings when KB content changes
-- 2) Chat logs table for observability
-- Run this once in the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Auto-invalidate embeddings on content change
-- ------------------------------------------------------------
-- Add a content hash column so we can detect changes.
ALTER TABLE kb_documents
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

-- Trigger: whenever title/content changes, null out embedding
-- and refresh the hash. The embed-knowledge-base function will
-- pick it up next time it runs.
CREATE OR REPLACE FUNCTION kb_documents_invalidate_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_hash TEXT;
BEGIN
  new_hash := md5(coalesce(NEW.title,'') || '||' || coalesce(NEW.content,''));

  IF TG_OP = 'INSERT' THEN
    NEW.content_hash := new_hash;
    NEW.embedding := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.content_hash IS DISTINCT FROM new_hash
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.content IS DISTINCT FROM OLD.content THEN
      NEW.content_hash := new_hash;
      NEW.embedding := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kb_documents_invalidate_embedding_trg ON kb_documents;
CREATE TRIGGER kb_documents_invalidate_embedding_trg
BEFORE INSERT OR UPDATE ON kb_documents
FOR EACH ROW EXECUTE FUNCTION kb_documents_invalidate_embedding();

-- Backfill hash for existing rows (without nulling existing embeddings).
UPDATE kb_documents
SET content_hash = md5(coalesce(title,'') || '||' || coalesce(content,''))
WHERE content_hash IS NULL;

-- ------------------------------------------------------------
-- 2) Chat logs table (observability)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  query TEXT,
  reply TEXT,
  top_similarity FLOAT,
  match_count INT,
  used_fallback BOOLEAN DEFAULT FALSE,
  latency_ms INT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS chat_logs_created_at_idx
  ON chat_logs (created_at DESC);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so no INSERT policy needed.
-- Only admins should read. Adjust below to your admin check.
DROP POLICY IF EXISTS "chat_logs admin read" ON chat_logs;
CREATE POLICY "chat_logs admin read"
ON chat_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- ============================================================
-- DONE
-- ============================================================