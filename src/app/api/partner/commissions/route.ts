import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function GET() {
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

    const { data: commissions, error } = await supabaseAdmin
      .from('partner_commissions')
      .select(`
        *,
        members ( full_name, email ),
        items ( brand, model )
      `)
      .eq('brand_partner_id', brandPartnerId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalEarned = (commissions || []).reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);
    const totalPaidOut = (commissions || [])
      .filter((c: any) => c.payout_status === 'paid_out')
      .reduce((acc: number, c: any) => acc + parseFloat(c.partner_share || 0), 0);
    const unpaidBalance = totalEarned - totalPaidOut;

    return NextResponse.json({
      partnerName: partnerData?.name || 'Partner',
      activeRate: parseFloat(partnerData?.commission_rate || 10),
      totalEarned,
      totalPaidOut,
      unpaidBalance,
      commissions: commissions || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
