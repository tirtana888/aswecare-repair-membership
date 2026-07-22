import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Total members count
    const { count: membersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // 2. Active plans count
    const { count: plansCount } = await supabase
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 3. Pending photo reviews count
    const { count: reviewsCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('condition_at_signup', 'pending_review');

    // 4. Open claims count
    const { count: claimsCount } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'approved', 'in_service']);

    // 5. Active partners count
    const { count: partnersCount } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 6. Recent 10 items (with members name, subcategories name)
    const { data: recentItems } = await supabase
      .from('items')
      .select(`
        id,
        brand,
        model,
        created_at,
        condition_at_signup,
        members ( full_name ),
        subcategories ( name )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // 7. Recent 5 claims (with members name, items brand+model)
    const { data: recentClaims } = await supabase
      .from('claims')
      .select(`
        id,
        damage_type,
        status,
        submitted_at,
        members ( full_name ),
        items ( brand, model )
      `)
      .order('submitted_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      totalMembers: membersCount || 0,
      activePlans: plansCount || 0,
      pendingReviews: reviewsCount || 0,
      openClaims: claimsCount || 0,
      activePartners: partnersCount || 0,
      recentItems: recentItems || [],
      recentClaims: recentClaims || []
    });

  } catch (error) {
    console.error('Error in stats route:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
