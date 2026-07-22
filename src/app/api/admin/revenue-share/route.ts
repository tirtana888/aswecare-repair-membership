import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDirectEmail, generatePartnerPayoutEmail } from '@/lib/email';
import { formatIDR } from '@/lib/utils';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch all commissions
    const { data: commissions, error } = await supabaseAdmin
      .from('partner_commissions')
      .select(`
        *,
        brand_partners ( name, commission_rate ),
        members ( full_name, email ),
        items ( brand, model )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Aggregate stats
    const totalGross = (commissions || []).reduce((acc: number, c: any) => acc + parseFloat(c.gross_amount || 0), 0);
    const totalPlatformShare = (commissions || []).reduce((acc: number, c: any) => acc + parseFloat(c.platform_share || 0), 0);
    const totalPartnerShare = (commissions || []).reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);
    const totalUnpaidShare = (commissions || [])
      .filter((c: any) => c.payout_status === 'unpaid')
      .reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);

    return NextResponse.json({
      totalGross,
      totalPlatformShare,
      totalPartnerShare,
      totalUnpaidShare,
      commissions: commissions || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { commissionId, partnerId, action } = body;

    if (action === 'mark_all_paid' && partnerId) {
      // Calculate total amount to pay
      const { data: unpaidItems } = await supabaseAdmin
        .from('partner_commissions')
        .select('partner_share')
        .eq('brand_partner_id', partnerId)
        .eq('payout_status', 'unpaid');

      const totalPayout = (unpaidItems || []).reduce((acc, i) => acc + parseFloat(i.partner_share || 0), 0);

      const { error } = await supabaseAdmin
        .from('partner_commissions')
        .update({ payout_status: 'paid_out', payout_date: new Date().toISOString() })
        .eq('brand_partner_id', partnerId)
        .eq('payout_status', 'unpaid');

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Fetch partner info to send notification
      const { data: partnerInfo } = await supabaseAdmin
        .from('brand_partners')
        .select('name, contact_email')
        .eq('id', partnerId)
        .maybeSingle();

      if (partnerInfo && partnerInfo.contact_email && totalPayout > 0) {
        const payoutHtml = generatePartnerPayoutEmail({
          partnerName: partnerInfo.name,
          payoutAmountFormatted: formatIDR(totalPayout),
          period: 'Bagi Hasil Polis Terbayar',
          paidDate: new Date().toLocaleDateString('id-ID'),
        });

        await sendDirectEmail({
          to: partnerInfo.contact_email,
          subject: `Pencairan Komisi Bagi Hasil (${formatIDR(totalPayout)}) — ${partnerInfo.name}`,
          html: payoutHtml,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (commissionId) {
      const { error } = await supabaseAdmin
        .from('partner_commissions')
        .update({ payout_status: 'paid_out', payout_date: new Date().toISOString() })
        .eq('id', commissionId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
