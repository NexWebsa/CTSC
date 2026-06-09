
-- 1. Vehicle slug
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

UPDATE public.vehicles SET slug = 'small_mpv_1_5' WHERE name = 'Small MPV (Suzuki Ertiga)';
UPDATE public.vehicles SET slug = 'bmw_5'              WHERE name = 'BMW 5 Series';
UPDATE public.vehicles SET slug = 'mercedes_c'         WHERE name = 'Mercedes C Class';
UPDATE public.vehicles SET slug = 'fortuner'           WHERE name = 'Toyota Fortuner';
UPDATE public.vehicles SET slug = 'luxury_mercedes_van' WHERE name = 'Luxury Van (V Class)';
UPDATE public.vehicles SET slug = 'luxury_v_class_vip' WHERE name = 'Mercedes V Class 300';
UPDATE public.vehicles SET slug = 'staria'             WHERE name = 'Hyundai Staria';
UPDATE public.vehicles SET slug = 'minibus_quantum'    WHERE name = 'Minibus / Quantum Old shape';
UPDATE public.vehicles SET slug = 'minibus_new_quantum' WHERE name = 'Minibus / Quantum New shape';
UPDATE public.vehicles SET slug = 'coaster'            WHERE name = 'Coaster Bus';

-- Add the missing 1–3 Pax variant (only if not present)
INSERT INTO public.vehicles (name, slug, capacity, is_active, description)
SELECT 'Small MPV (Suzuki Ertiga) 1–3 Pax', 'small_mpv_1_3', 3, true, 'Compact MPV for 1–3 passengers.'
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE slug = 'small_mpv_1_3');

-- 2. POI prices
ALTER TABLE public.points_of_interest ADD COLUMN IF NOT EXISTS vehicle_prices JSONB DEFAULT '{}'::jsonb;

-- Clear & reseed POI list
DELETE FROM public.points_of_interest;

INSERT INTO public.points_of_interest (name, category, sort_order, is_active, vehicle_prices) VALUES
('City / Waterfront / Bo-Kaap / Table Mountain', 'City', 10, true, '{"small_mpv_1_3":2000,"small_mpv_1_5":2500,"bmw_5":2500,"mercedes_c":3500,"fortuner":3000,"luxury_mercedes_van":3000,"luxury_v_class_vip":6500,"staria":2850,"minibus_quantum":3250,"minibus_new_quantum":3500,"coaster":5000}'),
('Cape Point / Boulders Beach / Chapmans Peak', 'Peninsula', 20, true, '{"small_mpv_1_3":2500,"small_mpv_1_5":2850,"bmw_5":3000,"mercedes_c":4000,"fortuner":3500,"luxury_mercedes_van":3850,"luxury_v_class_vip":6500,"staria":3250,"minibus_quantum":3500,"minibus_new_quantum":3850,"coaster":5500}'),
('Stellenbosch / Somerset Winelands', 'Winelands', 30, true, '{"small_mpv_1_3":2500,"small_mpv_1_5":2850,"bmw_5":3000,"mercedes_c":4000,"fortuner":4000,"luxury_mercedes_van":3500,"luxury_v_class_vip":6500,"staria":3250,"minibus_quantum":3500,"minibus_new_quantum":3850,"coaster":5500}'),
('Franschhoek / Paarl Winelands', 'Winelands', 40, true, '{"small_mpv_1_3":2750,"small_mpv_1_5":2950,"bmw_5":3250,"mercedes_c":4250,"fortuner":4250,"luxury_mercedes_van":3850,"luxury_v_class_vip":6500,"staria":3500,"minibus_quantum":3750,"minibus_new_quantum":3950,"coaster":5850}'),
('Constantia Winelands', 'Winelands', 50, true, '{"small_mpv_1_3":2000,"small_mpv_1_5":2500,"bmw_5":2500,"mercedes_c":2500,"fortuner":3500,"luxury_mercedes_van":3000,"luxury_v_class_vip":6500,"staria":3500,"minibus_quantum":3000,"minibus_new_quantum":3500,"coaster":5000}'),
('Durbanville Winelands', 'Winelands', 60, true, '{"small_mpv_1_3":2250,"small_mpv_1_5":2750,"bmw_5":2750,"mercedes_c":3250,"fortuner":3750,"luxury_mercedes_van":3500,"luxury_v_class_vip":6500,"staria":3000,"minibus_quantum":3500,"minibus_new_quantum":3750,"coaster":5500}'),
('Riebeek Kasteel Winelands', 'Winelands', 70, true, '{"small_mpv_1_3":3000,"small_mpv_1_5":3500,"bmw_5":3850,"mercedes_c":4500,"fortuner":3850,"luxury_mercedes_van":4000,"luxury_v_class_vip":6500,"staria":3850,"minibus_quantum":4000,"minibus_new_quantum":4250,"coaster":6000}'),
('Wellington Winelands', 'Winelands', 80, true, '{"small_mpv_1_3":2500,"small_mpv_1_5":2850,"bmw_5":3000,"mercedes_c":4000,"fortuner":3500,"luxury_mercedes_van":3850,"luxury_v_class_vip":6500,"staria":3250,"minibus_quantum":3500,"minibus_new_quantum":3850,"coaster":5500}'),
('Robertson Winelands', 'Winelands', 90, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":4000,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Atlantis Sand Dunes / Quad Biking', 'Adventure', 100, true, '{"small_mpv_1_3":2000,"small_mpv_1_5":2500,"bmw_5":2500,"mercedes_c":3500,"fortuner":3000,"luxury_mercedes_van":3000,"luxury_v_class_vip":6500,"staria":3000,"minibus_quantum":3250,"minibus_new_quantum":3500,"coaster":5000}'),
('Langebaan', 'West Coast', 110, true, '{"small_mpv_1_3":3000,"small_mpv_1_5":3500,"bmw_5":3850,"mercedes_c":4500,"fortuner":3850,"luxury_mercedes_van":4000,"luxury_v_class_vip":6500,"staria":3850,"minibus_quantum":4000,"minibus_new_quantum":4250,"coaster":6000}'),
('Hermanus Whale Watching', 'Coast', 120, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Hermanus Hemel en Aarde', 'Coast', 130, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('West Coast Nature Reserve', 'West Coast', 140, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Gansbaai Shark Cage Diving', 'Adventure', 150, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Aquila Safari & Spa Game Reserve', 'Safari', 160, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Ceres Nature Reserve', 'Nature', 170, true, '{"small_mpv_1_3":3250,"small_mpv_1_5":3750,"bmw_5":3850,"mercedes_c":4750,"fortuner":4000,"luxury_mercedes_van":4500,"luxury_v_class_vip":6750,"staria":4000,"minibus_quantum":4250,"minibus_new_quantum":4500,"coaster":6500}'),
('Cape Agulhas / L''Agulhas', 'Coast', 180, true, '{"small_mpv_1_3":3500,"small_mpv_1_5":4000,"bmw_5":4250,"mercedes_c":5000,"fortuner":4500,"luxury_mercedes_van":4750,"luxury_v_class_vip":7000,"staria":4500,"minibus_quantum":4850,"minibus_new_quantum":5000,"coaster":7000}'),
('Garden Route / Knysna / Plettenberg Bay / Wilderness', 'Get Quote', 190, true, '{}'),
('Oudtshoorn / Cango Caves / Ostrich Farm', 'Get Quote', 200, true, '{}'),
('Weddings', 'Get Quote', 210, true, '{}'),
('Bachelorette Parties', 'Get Quote', 220, true, '{}'),
('Funerals', 'Get Quote', 230, true, '{}');
