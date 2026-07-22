import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendDirectEmail, generatePolicyConfirmationEmail, generateWelcomeEmail } from '@/lib/email';

async function getSessionUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: partnerUser } = await supabaseAdmin
      .from('brand_partner_users')
      .select('brand_partner_id, brand_partners(name, commission_rate)')
      .eq('id', user.id)
      .maybeSingle();

    if (!partnerUser || !partnerUser.brand_partner_id) {
      return NextResponse.json({ error: 'Not associated with a brand partner' }, { status: 403 });
    }

    const brandPartnerId = partnerUser.brand_partner_id;
    const partnerData: any = partnerUser.brand_partners;
    const partnerName = partnerData?.name || 'Partner';
    const commissionRate = parseFloat(partnerData?.commission_rate || 10);

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      subcategoryId,
      brand,
      model,
      photoUrls = [],
      tierId,
      paymentMode,
      estimatedValue,
      purchaseDate,
      planTier,
      durationMonths = 3,
      bonusMonths = 0,
      bonusQuota = 0,
      amount = 0,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !brand || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let memberId: string | undefined;

    const { data: existingMember } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('email', customerEmail.toLowerCase())
      .maybeSingle();

    memberId = existingMember?.id;

    if (!memberId) {
      const tempPassword = 'Welcome' + Math.random().toString(36).substring(2, 8) + '!';
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: customerName, phone_number: customerPhone },
      });

      if (authError) {
        return NextResponse.json({ error: 'Failed to create user', details: authError.message }, { status: 500 });
      }

      memberId = authData?.user?.id;
      if (!memberId) {
        return NextResponse.json({ error: 'Failed to retrieve created user ID' }, { status: 500 });
      }

      await supabaseAdmin.from('members').upsert({
        id: memberId,
        full_name: customerName,
        phone_number: customerPhone,
        email: customerEmail.toLowerCase(),
        referred_by_partner_id: brandPartnerId,
      });

      // Send welcome email to new member
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const welcomeHtml = generateWelcomeEmail(customerName, 'member', `${appUrl}/login`);
      await sendDirectEmail({
        to: customerEmail,
        subject: `Selamat Datang di AsWeCare — Pendaftaran via ${partnerName}`,
        html: welcomeHtml,
      });
    }

    const { data: newItem, error: itemError } = await supabaseAdmin
      .from('items')
      .insert({
        member_id: memberId,
        subcategory_id: subcategoryId,
        brand,
        model,
        estimated_value: estimatedValue || 0,
        purchase_date: purchaseDate || null,
        purchase_channel: partnerName,
        condition_at_signup: 'pending_review',
        photo_urls: photoUrls,
        registered_by_partner_id: brandPartnerId,
      })
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: 'Failed to create item', details: itemError.message }, { status: 500 });
    }

    let planData = null;

    if (paymentMode === 'partner_pay') {
      const startDate = new Date();
      const totalMonths = durationMonths + bonusMonths;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + totalMonths);
      
      const waitEnd = new Date();
      waitEnd.setDate(waitEnd.getDate() + 14);
      
      const baseQuota = 2 + bonusQuota;

      const { data: createdPlan } = await supabaseAdmin.from('plans').upsert(
        {
          item_id: newItem.id,
          plan_tier: planTier || 'basic',
          coverage_type: 'repair_only',
          billing_cycle: totalMonths + '_months',
          status: 'active',
          plan_start_date: startDate.toISOString().split('T')[0],
          plan_end_date: endDate.toISOString().split('T')[0],
          waiting_period_end_date: waitEnd.toISOString().split('T')[0],
          annual_quota: baseQuota,
          quota_used: 0,
          xendit_invoice_id: 'inv_partner_' + Date.now(),
        },
        { onConflict: 'item_id' }
      ).select().single();

      planData = createdPlan;

      // Calculate Bagi Hasil / Revenue Sharing
      const grossAmount = amount || 125000;
      const partnerShare = (grossAmount * commissionRate) / 100;
      const platformShare = grossAmount - partnerShare;

      await supabaseAdmin.from('partner_commissions').insert({
        brand_partner_id: brandPartnerId,
        plan_id: createdPlan.id,
        item_id: newItem.id,
        member_id: memberId,
        gross_amount: grossAmount,
        commission_rate: commissionRate,
        partner_share: partnerShare,
        platform_share: platformShare,
        payout_status: 'unpaid',
      });

      // Send Policy Confirmation Email
      const policyHtml = generatePolicyConfirmationEmail({
        recipientName: customerName,
        itemBrand: brand,
        itemModel: model,
        planTier: planTier || 'basic',
        quota: baseQuota,
        startDate: startDate.toLocaleDateString('id-ID'),
        endDate: endDate.toLocaleDateString('id-ID'),
        invoiceId: createdPlan.xendit_invoice_id,
      });

      await sendDirectEmail({
        to: customerEmail,
        subject: `Polis Proteksi Aktif: ${brand} ${model} (${partnerName})`,
        html: policyHtml,
      });

    } else if (paymentMode === 'send_link') {
      const { data: createdPlan } = await supabaseAdmin.from('plans').upsert(
        {
          item_id: newItem.id,
          plan_tier: planTier || 'basic',
          coverage_type: 'repair_only',
          billing_cycle: 'monthly',
          status: 'pending_payment',
          xendit_invoice_url: 'https://checkout.xendit.co/mock/' + Date.now(),
          xendit_invoice_id: 'inv_partner_link_' + Date.now(),
        },
        { onConflict: 'item_id' }
      ).select().single();
      planData = createdPlan;
    }

    return NextResponse.json({ success: true, item: newItem, plan: planData, memberId });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
