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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

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

    let query = supabaseAdmin
      .from('members')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        created_at,
        items(
          id,
          brand,
          model,
          plans(status)
        )
      `)
      .eq('referred_by_partner_id', brandPartnerId);

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    const { data: customers, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }

    const formattedCustomers = (customers || []).map((c: any) => {
      const items = c.items || [];
      return {
        id: c.id,
        fullName: c.full_name,
        email: c.email,
        phoneNumber: c.phone_number,
        createdAt: c.created_at,
        itemsCount: items.length,
        items: items,
      };
    });

    return NextResponse.json(formattedCustomers);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
