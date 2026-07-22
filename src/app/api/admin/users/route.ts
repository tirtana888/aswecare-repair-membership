import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    const supabase = createAdminClient();

    let query = supabase
      .from('members')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        created_at,
        items ( id, plans ( id, status ) ),
        claims ( id )
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: 'Gagal mengambil data anggota' }, { status: 500 });
    }

    // Process counts
    const membersWithStats = (data || []).map((member: any) => {
      const allPlans = (member.items || []).flatMap((item: any) => item.plans || []);
      const activePlans = allPlans.filter((p: any) => p.status === 'active');
      return {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        phone_number: member.phone_number,
        created_at: member.created_at,
        total_items: member.items?.length || 0,
        active_plans: activePlans.length,
        total_claims: member.claims?.length || 0,
      };
    });

    return NextResponse.json(membersWithStats);
  } catch (error) {
    console.error('Error in users route:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
