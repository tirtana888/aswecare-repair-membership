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

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: partnerUser } = await supabaseAdmin
      .from('brand_partner_users')
      .select('brand_partner_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!partnerUser || !partnerUser.brand_partner_id) {
      return NextResponse.json({ error: 'Not associated with a brand partner' }, { status: 403 });
    }

    const brandPartnerId = partnerUser.brand_partner_id;

    // 2. Count members
    const { count: membersCount } = await supabaseAdmin
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by_partner_id', brandPartnerId);

    // 3. Count items
    const { count: itemsCount } = await supabaseAdmin
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('registered_by_partner_id', brandPartnerId);

    // 4. Count active plans
    const { data: plansData } = await supabaseAdmin
      .from('plans')
      .select('id, status, items!inner(registered_by_partner_id)')
      .eq('items.registered_by_partner_id', brandPartnerId)
      .eq('status', 'active');
      
    const activePlansCount = plansData?.length || 0;
    const totalAmount = activePlansCount * 50000;

    // 6. Get recent 10 items
    const { data: recentItems } = await supabaseAdmin
      .from('items')
      .select(`
        id,
        brand,
        model,
        created_at,
        members(full_name),
        plans(status)
      `)
      .eq('registered_by_partner_id', brandPartnerId)
      .order('created_at', { ascending: false })
      .limit(10);

    const formattedRecentItems = (recentItems || []).map((item: any) => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      customerName: item.members?.full_name || 'Unknown',
      planStatus: item.plans?.[0]?.status || 'no_plan',
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      membersCount: membersCount || 0,
      itemsCount: itemsCount || 0,
      activePlansCount,
      totalAmount,
      recentItems: formattedRecentItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
