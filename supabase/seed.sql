-- Seed Initial Categories & Subcategories for Soft Launch
-- Non-destructive insertion with ON CONFLICT DO NOTHING

INSERT INTO public.categories (id, name, slug) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Fashion', 'fashion'),
    ('22222222-2222-2222-2222-222222222222', 'Electronic', 'electronic')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.subcategories (id, category_id, name, slug, default_annual_quota, is_active) VALUES
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sneaker', 'sneaker', 2, true),
    ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Kaos', 'kaos', 2, false),
    ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Hoodie', 'hoodie', 2, false),
    ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Sepatu Formal', 'sepatu-formal', 2, false),
    ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Accessories', 'accessories', 2, true),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Handphone', 'handphone', 2, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.partners (id, name, type, location_area, phone_number, is_active) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Shoe Doctor South Jakarta', 'cobbler', 'Jakarta Selatan', '081299001122', true),
    ('c2222222-2222-2222-2222-222222222222', 'Kicks Care Studio', 'cleaning_service', 'Jakarta Barat', '081288112233', true),
    ('c3333333-3333-3333-3333-333333333333', 'Gadget Fix Specialist', 'gadget_technician', 'Jakarta Pusat', '081277223344', true)
ON CONFLICT (id) DO NOTHING;
