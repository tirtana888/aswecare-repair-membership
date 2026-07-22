import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { type, name, contactName, email, phone, address, category, note } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Nama, Email, dan Telepon wajib diisi' }, { status: 400 });
    }

    if (type === 'brand') {
      // Store lead application in database or brand_partners table as pending
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
      const { data, error } = await supabaseAdmin.from('brand_partners').insert({
        name,
        slug,
        contact_email: email,
        contact_phone: phone,
        address: address || '',
        category_focus: category || 'all',
        commission_rate: 10.00,
        is_active: false, // Pending admin approval
      }).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Pendaftaran Brand Partner berhasil dikirim!', data });
    }

    if (type === 'service_partner') {
      // Store lead application in partners table as pending
      const { data, error } = await supabaseAdmin.from('partners').insert({
        name,
        contact_person: contactName || name,
        email,
        phone,
        address: address || '',
        specialties: [category || 'General Repair'],
        rating: 5.0,
        is_active: false, // Pending admin approval
      }).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Pendaftaran Partner Servis berhasil dikirim!', data });
    }

    return NextResponse.json({ error: 'Tipe pendaftaran tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
