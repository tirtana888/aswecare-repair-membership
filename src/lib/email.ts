import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Direct Email Service Handler
 * Supports SMTP (Gmail, SendGrid, Mailtrap, Resend, Supabase Custom SMTP)
 * Automatically falls back to clean dev console logging if SMTP environment variables are missing.
 */
export async function sendDirectEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; devMode?: boolean; error?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM || 'AsWeCare Protection <noreply@aswecare.com>';

  // If SMTP credentials exist, send via Nodemailer
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

      console.log(`[Email Service] Sent email to ${options.to} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[Email Service Error] Failed to send email via SMTP:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Dev mode fallback logging
  console.log(`\n======================================================`);
  console.log(`📬 [DEV EMAIL SERVICE NOTIFICATION]`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Status: SMTP not configured in .env.local - Email simulated successfully`);
  console.log(`======================================================\n`);

  return { success: true, devMode: true, messageId: `dev_mock_${Date.now()}` };
}

/* ============================================================================
   BRANDED HTML EMAIL TEMPLATES (Enterprise Stripe & SquareTrade Style)
============================================================================ */

const EMAIL_HEADER_BG = '#0a1936';
const BRAND_BLUE = '#2563eb';

function getEmailLayout(title: string, contentHtml: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color:${EMAIL_HEADER_BG}; padding: 24px 32px; text-align: left;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="color:#ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">AsWeCare</span>
                      <span style="color:#93c5fd; font-size: 11px; font-weight: 600; display: block; margin-top: 2px;">REPAIR MEMBERSHIP PLATFORM</span>
                    </td>
                    <td align="right">
                      <span style="background-color:rgba(37,99,235,0.2); color:#93c5fd; border:1px solid rgba(147,197,253,0.3); font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Official Protection</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 32px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                ${contentHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
                <p style="margin: 0 0 6px 0;">&copy; 2026 AsWeCare Protection Platform. All rights reserved.</p>
                <p style="margin: 0; color: #94a3b8;">Email ini dikirim secara otomatis oleh sistem AsWeCare. Layanan Pelanggan: support@aswecare.com</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Template 1: Welcome Email (User / Partner Sign-Up)
 */
export function generateWelcomeEmail(recipientName: string, portalRole: 'member' | 'partner' | 'admin', loginUrl: string): string {
  const title = `Selamat Datang di AsWeCare — Portal ${portalRole === 'partner' ? 'Brand Partner' : portalRole === 'admin' ? 'Superadmin' : 'Member'}`;
  
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Halo, ${recipientName}! 👋</h2>
    <p style="margin-bottom: 16px;">Selamat datang di platform keanggotaan perbaikan fisik &amp; perawatan resmi <strong>AsWeCare</strong>.</p>
    <p style="margin-bottom: 24px;">Akun Anda telah berhasil terdaftar dan siap digunakan untuk mengelola keanggotaan garansi, pendaftaran barang, dan pengajuan klaim perbaikan.</p>

    <div style="background-color: #f8fafc; border-left: 4px solid ${BRAND_BLUE}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Peran Akun:</strong> ${portalRole === 'partner' ? 'Brand Partner (Mitra Toko/Retailer)' : portalRole === 'admin' ? 'Superadmin Console' : 'Member Terproteksi'}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155;"><strong>Link Portal Login:</strong> <a href="${loginUrl}" style="color:${BRAND_BLUE}; font-weight:600; text-decoration:none;">${loginUrl}</a></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background-color:${BRAND_BLUE}; color:#ffffff; font-weight:700; font-size:14px; text-decoration:none; padding: 12px 28px; border-radius: 10px; display: inline-block;">Masuk ke Portal Saya</a>
    </div>

    <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Jika Anda memiliki pertanyaan seputar keanggotaan, silakan hubungi tim dukungan kami melalui portal bantuan.</p>
  `;

  return getEmailLayout(title, content);
}

/**
 * Template 2: Policy Activation / Product Protection Confirmation Email
 */
export function generatePolicyConfirmationEmail(params: {
  recipientName: string;
  itemBrand: string;
  itemModel: string;
  planTier: string;
  quota: number;
  startDate: string;
  endDate: string;
  invoiceId?: string;
}): string {
  const title = `Polis Proteksi Aktif: ${params.itemBrand} ${params.itemModel}`;

  const content = `
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
      <span style="color: #047857; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">✓ STATUS POLIS: AKTIF TERPROTEKSI</span>
      <h3 style="margin: 4px 0 0 0; color: #065f46; font-size: 18px; font-weight: 800;">${params.itemBrand} ${params.itemModel}</h3>
    </div>

    <p style="margin-bottom: 16px;">Halo, <strong>${params.recipientName}</strong>,</p>
    <p style="margin-bottom: 20px;">Selamat! Barang kesayangan Anda telah resmi terdaftar dan terproteksi dalam program keanggotaan perbaikan fisik AsWeCare.</p>

    <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 10px; font-size: 13px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="color: #64748b; width: 40%;"><strong>Nama Barang:</strong></td>
        <td style="color: #0f172a; font-weight: 700;">${params.itemBrand} ${params.itemModel}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Paket Proteksi:</strong></td>
        <td style="color: #2563eb; font-weight: 700; text-transform: uppercase;">Paket ${params.planTier}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Kuota Perbaikan:</strong></td>
        <td style="color: #0f172a; font-weight: 700;">${params.quota}x Perbaikan / Tahun ($0 Deductible)</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Masa Berlaku Polis:</strong></td>
        <td style="color: #0f172a;">${params.startDate} s/d ${params.endDate}</td>
      </tr>
      ${params.invoiceId ? `
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>ID Transaksi:</strong></td>
        <td style="color: #64748b; font-family: monospace;">${params.invoiceId}</td>
      </tr>
      ` : ''}
    </table>

    <p style="font-size: 13px; color: #475569; margin-bottom: 0;">Sesuai ketentuan, masa tunggu klaim berlaku selama 14 hari sejak pengaktifan polis. Apabila terjadi kerusakan fisik setelahnya, Anda dapat langsung mengajukan klaim online 24/7 melalui dashboard member.</p>
  `;

  return getEmailLayout(title, content);
}

/**
 * Template 3: Claim Status Update Notification Email
 */
export function generateClaimStatusEmail(params: {
  recipientName: string;
  claimId: string;
  itemBrand: string;
  itemModel: string;
  status: string;
  notes?: string;
  partnerName?: string;
}): string {
  const title = `Update Status Klaim #${params.claimId.substring(0, 8)} — ${params.status}`;

  const content = `
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Update Status Klaim Perbaikan 🛠️</h2>
    <p style="margin-bottom: 16px;">Halo, <strong>${params.recipientName}</strong>,</p>
    <p style="margin-bottom: 20px;">Terdapat pembaruan status pada pengajuan klaim perbaikan untuk barang Anda:</p>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <span style="color: #1d4ed8; font-size: 11px; font-weight: 800; text-transform: uppercase;">STATUS SAAT INI:</span>
      <h3 style="margin: 4px 0 0 0; color: #1e40af; font-size: 17px; font-weight: 800; text-transform: uppercase;">${params.status}</h3>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #1e3a8a;">ID Klaim: <code style="background:#dbeafe; padding: 2px 6px; border-radius:4px;">${params.claimId}</code></p>
    </div>

    <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 10px; font-size: 13px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="color: #64748b; width: 35%;"><strong>Barang:</strong></td>
        <td style="color: #0f172a; font-weight: 700;">${params.itemBrand} ${params.itemModel}</td>
      </tr>
      ${params.partnerName ? `
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Service Center:</strong></td>
        <td style="color: #0f172a;">${params.partnerName}</td>
      </tr>
      ` : ''}
      ${params.notes ? `
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Catatan Teknisi:</strong></td>
        <td style="color: #334155;">${params.notes}</td>
      </tr>
      ` : ''}
    </table>

    <p style="font-size: 13px; color: #475569; margin-bottom: 0;">Anda dapat melacak perkembangan pengerjaan perbaikan secara berkala melalui menu <strong>Klaim Saya</strong> di dashboard member AsWeCare.</p>
  `;

  return getEmailLayout(title, content);
}

/**
 * Template 4: Brand Partner Payout Notification Email
 */
export function generatePartnerPayoutEmail(params: {
  partnerName: string;
  payoutAmountFormatted: string;
  period: string;
  paidDate: string;
}): string {
  const title = `Notifikasi Pencairan Komisi Bagi Hasil — ${params.partnerName}`;

  const content = `
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
      <span style="color: #15803d; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">✓ KOMISI BAGI HASIL DICAIRKAN</span>
      <h3 style="margin: 4px 0 0 0; color: #166534; font-size: 22px; font-weight: 800;">${params.payoutAmountFormatted}</h3>
    </div>

    <p style="margin-bottom: 16px;">Halo, Tim <strong>${params.partnerName}</strong>,</p>
    <p style="margin-bottom: 20px;">Kami mengonfirmasi bahwa pencairan komisi bagi hasil polis terbayar Anda telah berhasil diproses oleh tim Superadmin AsWeCare.</p>

    <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 10px; font-size: 13px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="color: #64748b; width: 40%;"><strong>Nama Partner:</strong></td>
        <td style="color: #0f172a; font-weight: 700;">${params.partnerName}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Total Komisi Dicairkan:</strong></td>
        <td style="color: #16a34a; font-weight: 800; font-size: 15px;">${params.payoutAmountFormatted}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="color: #64748b;"><strong>Tanggal Diproses:</strong></td>
        <td style="color: #0f172a;">${params.paidDate}</td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #475569; margin-bottom: 0;">Rincian histori transaksi pencairan ini dapat Anda periksa kapan saja di menu Bagi Hasil &amp; Komisi pada Portal Brand Partner (/partner/commissions).</p>
  `;

  return getEmailLayout(title, content);
}
