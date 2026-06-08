
CREATE TABLE public.points_of_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.points_of_interest TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.points_of_interest TO authenticated;
GRANT ALL ON public.points_of_interest TO service_role;

ALTER TABLE public.points_of_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active points of interest"
  ON public.points_of_interest FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage points of interest"
  ON public.points_of_interest FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.points_of_interest (name, category, sort_order) VALUES
  ('City - Waterfront/Bo-Kaap/Table Mountain', 'City', 10),
  ('Cape Point/Boulders Beach/Chapmans Peak', 'Peninsula', 20),
  ('Stellenbosch/Somerset West - Winelands', 'Winelands', 30),
  ('Franschhoek/Paarl - Winelands', 'Winelands', 40),
  ('Constantia - Winelands', 'Winelands', 50),
  ('Durbanville - Winelands', 'Winelands', 60),
  ('Riebeek Kasteel - Winelands', 'Winelands', 70),
  ('Wellington - Winelands', 'Winelands', 80),
  ('Robertson - Winelands', 'Winelands', 90),
  ('Atlantis Sand Dunes/Quad Biking', 'Adventure', 100),
  ('Langebaan', 'West Coast', 110),
  ('Hermanus - Whale Watching', 'Overberg', 120),
  ('Hermanus - Hemel en Aarde', 'Overberg', 130),
  ('West Coast Nature Reserve', 'Nature', 140),
  ('Gansbaai - Shark Cage Diving', 'Adventure', 150),
  ('Aquila Safari & Spa Game Reserve', 'Safari', 160),
  ('Ceres Nature Reserve', 'Nature', 170),
  ('Cape Agulhas/La'' Agulhas', 'Overberg', 180),
  ('Garden Route - Knysna/Plettenberg/Wilderness', 'Garden Route', 190),
  ('Oudtshoorn - Cango Caves/Ostrich Farm', 'Karoo', 200);
