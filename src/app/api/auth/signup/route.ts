import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDirectEmail, generateWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { full_name, email, password, phone_number } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Create auth user with confirmed email via admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone_number,
      },
    });

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Gagal membuat pengguna' }, { status: 500 });
    }

    // 2. Insert into members table
    const { error: memberError } = await supabaseAdmin
      .from('members')
      .upsert({
        id: userId,
        full_name,
        email: email.toLowerCase(),
        phone_number,
      });

    if (memberError) {
      console.error('Member insert error:', memberError);
    }

    // 3. Send Direct Email Notification (Welcome Email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/login`;
    const welcomeHtml = generateWelcomeEmail(full_name, 'member', loginUrl);

    await sendDirectEmail({
      to: email,
      subject: 'Selamat Datang di AsWeCare — Keanggotaan Garansi Terproteksi',
      html: welcomeHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil. Silakan login ke akun Anda.',
      user: { id: userId, email, full_name },
    });
  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json({ message: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
