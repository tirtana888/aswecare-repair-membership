import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Fetch partners with count of users & members
    const [
      { data: partners, error },
      { data: commissions },
      { data: tiers },
      { data: categories },
      { data: subcategories }
    ] = await Promise.all([
      supabaseAdmin.from('brand_partners').select('*, brand_partner_users(*), members!members_referred_by_partner_id_fkey(count)').order('created_at', { ascending: false }),
      supabaseAdmin.from('partner_commissions').select('brand_partner_id, gross_amount, partner_share, platform_share, payout_status'),
      supabaseAdmin.from('membership_tiers').select('*').eq('is_active', true),
      supabaseAdmin.from('categories').select('*'),
      supabaseAdmin.from('subcategories').select('*').eq('is_active', true)
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const partnersWithFinancials = (partners || []).map((p: any) => {
      const pComms = (commissions || []).filter((c: any) => c.brand_partner_id === p.id);
      const totalGross = pComms.reduce((acc: number, c: any) => acc + parseFloat(c.gross_amount || 0), 0);
      const totalPartnerShare = pComms.reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);
      const totalPlatformShare = pComms.reduce((acc: number, c: any) => acc + parseFloat(c.platform_share || 0), 0);
      const unpaidShare = pComms.filter((c: any) => c.payout_status === 'unpaid').reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);

      return {
        ...p,
        total_gross: totalGross,
        total_partner_share: totalPartnerShare,
        total_platform_share: totalPlatformShare,
        unpaid_share: unpaidShare,
      };
    });

    return NextResponse.json({
      partners: partnersWithFinancials,
      availableTiers: tiers || [],
      availableCategories: categories || [],
      availableSubcategories: subcategories || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const {
      name,
      contactEmail,
      contactPhone,
      address,
      categoryFocus,
      commissionRate = 10,
      allowedTierIds = [],
      allowedCategoryIds = [],
      allowedSubcategoryIds = [],
      loginEmail,
      loginPassword,
      loginName
    } = body;

    if (!name || !loginEmail || !loginPassword || !loginName) {
      return NextResponse.json({ error: 'Data wajib belum lengkap' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 1. Create brand_partners record
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('brand_partners')
      .insert({
        name,
        slug,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        category_focus: categoryFocus || 'all',
        commission_rate: parseFloat(commissionRate) || 10,
        allowed_tier_ids: allowedTierIds,
        allowed_category_ids: allowedCategoryIds,
        allowed_subcategory_ids: allowedSubcategoryIds,
        is_active: true
      })
      .select()
      .single();

    if (partnerError) {
      return NextResponse.json({ error: 'Gagal membuat partner baru: ' + partnerError.message }, { status: 500 });
    }

    // 2. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: loginPassword,
      email_confirm: true,
      user_metadata: { full_name: loginName },
    });

    if (authError) {
      await supabaseAdmin.from('brand_partners').delete().eq('id', partner.id);
      return NextResponse.json({ error: 'Gagal membuat akun login: ' + authError.message }, { status: 500 });
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Gagal mendapatkan User ID' }, { status: 500 });
    }

    // 3. Create brand_partner_users record
    const { error: linkError } = await supabaseAdmin
      .from('brand_partner_users')
      .insert({
        id: userId,
        brand_partner_id: partner.id,
        role: 'owner',
        full_name: loginName,
        is_active: true
      });

    if (linkError) {
      return NextResponse.json({ error: 'Gagal menghubungkan user dengan partner', details: linkError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const {
      id,
      name,
      contact_email,
      contact_phone,
      address,
      category_focus,
      commission_rate,
      allowed_tier_ids,
      allowed_category_ids,
      allowed_subcategory_ids,
      is_active
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (contact_email !== undefined) updateFields.contact_email = contact_email;
    if (contact_phone !== undefined) updateFields.contact_phone = contact_phone;
    if (address !== undefined) updateFields.address = address;
    if (category_focus !== undefined) updateFields.category_focus = category_focus;
    if (commission_rate !== undefined) updateFields.commission_rate = parseFloat(commission_rate);
    if (allowed_tier_ids !== undefined) updateFields.allowed_tier_ids = allowed_tier_ids;
    if (allowed_category_ids !== undefined) updateFields.allowed_category_ids = allowed_category_ids;
    if (allowed_subcategory_ids !== undefined) updateFields.allowed_subcategory_ids = allowed_subcategory_ids;
    if (is_active !== undefined) updateFields.is_active = is_active;

    const { data: updated, error } = await supabaseAdmin
      .from('brand_partners')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    // 1. Delete associated partner users
    const { data: partnerUsers } = await supabaseAdmin
      .from('brand_partner_users')
      .select('id')
      .eq('brand_partner_id', id);

    if (partnerUsers && partnerUsers.length > 0) {
      for (const pu of partnerUsers) {
        await supabaseAdmin.auth.admin.deleteUser(pu.id).catch(() => null);
      }
      await supabaseAdmin.from('brand_partner_users').delete().eq('brand_partner_id', id);
    }

    // 2. Delete brand_partner record
    const { error } = await supabaseAdmin.from('brand_partners').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Brand Partner berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
