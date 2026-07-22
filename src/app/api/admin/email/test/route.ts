import { NextResponse } from 'next/server';
import { sendDirectEmail, generateWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, templateType = 'welcome', recipientName = 'Test User' } = body;

    if (!toEmail) {
      return NextResponse.json({ error: 'Email tujuan wajib diisi' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const html = generateWelcomeEmail(recipientName, 'member', `${appUrl}/login`);

    const result = await sendDirectEmail({
      to: toEmail,
      subject: `[TEST EMAIL] AsWeCare Service Verification`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Email pengujian berhasil diproses ke ${toEmail}`,
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengirim email pengujian' }, { status: 500 });
  }
}
