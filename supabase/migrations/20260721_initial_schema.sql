-- Safe Schema Migration for Repair Membership MVP
-- Note: Uses IF NOT EXISTS to guarantee non-destructive execution on shared Supabase instances

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table (maps to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories katalog
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- Subcategories katalog
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    default_annual_quota INT NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Items (Barang terdaftar member)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    subcategory_id UUID NOT NULL REFERENCES public.subcategories(id),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    estimated_value NUMERIC(12,2) DEFAULT 0,
    purchase_date DATE,
    condition_at_signup TEXT NOT NULL DEFAULT 'pending_review' CHECK (condition_at_signup IN ('pending_review', 'baru', 'layak', 'aus_berat', 'rejected')),
    condition_notes TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans (Langganan aktif per item)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL DEFAULT 'basic' CHECK (plan_tier IN ('basic', 'extended')),
    coverage_type TEXT NOT NULL DEFAULT 'repair_only' CHECK (coverage_type IN ('repair_only', 'indemnity')),
    billing_cycle TEXT NOT NULL DEFAULT 'yearly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'active', 'expired', 'cancelled')),
    plan_start_date DATE,
    plan_end_date DATE,
    waiting_period_end_date DATE,
    annual_quota INT NOT NULL DEFAULT 2,
    quota_used INT NOT NULL DEFAULT 0,
    xendit_invoice_id TEXT
);

-- Partners (Data mitra servis internal)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cobbler', 'cleaning_service', 'gadget_technician')),
    location_area TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Claims (Pengajuan klaim servis)
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    damage_type TEXT NOT NULL,
    description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'in_service', 'completed', 'delivered')),
    rejection_reason TEXT,
    assigned_partner_id UUID REFERENCES public.partners(id),
    actual_service_cost NUMERIC(12,2),
    member_rating INT CHECK (member_rating >= 1 AND member_rating <= 5),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin'))
);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Member RLS Policies (Safely created using DO blocks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view own record') THEN
        CREATE POLICY "Members can view own record" ON public.members FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can update own record') THEN
        CREATE POLICY "Members can update own record" ON public.members FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read categories') THEN
        CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read subcategories') THEN
        CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members view own items') THEN
        CREATE POLICY "Members view own items" ON public.items FOR SELECT USING (auth.uid() = member_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members insert own items') THEN
        CREATE POLICY "Members insert own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = member_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members view own plans') THEN
        CREATE POLICY "Members view own plans" ON public.plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = plans.item_id AND items.member_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members view own claims') THEN
        CREATE POLICY "Members view own claims" ON public.claims FOR SELECT USING (auth.uid() = member_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members insert own claims') THEN
        CREATE POLICY "Members insert own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = member_id);
    END IF;
END $$;
