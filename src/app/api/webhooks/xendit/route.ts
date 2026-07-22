import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendDirectEmail, generatePolicyConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const callbackToken = req.headers.get('x-callback-token')
    const expectedToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN

    // Security Verification: Validate Xendit Callback Token
    if (expectedToken && expectedToken !== 'xnd_webhook_token_mock_12345' && callbackToken !== expectedToken) {
      console.warn('Xendit webhook unauthorized callback token:', callbackToken)
      return NextResponse.json({ message: 'Invalid callback token' }, { status: 401 })
    }

    const body = await req.json()
    const { id: invoiceId, external_id, status, paid_amount, amount } = body

    if (status === 'PAID' || status === 'SETTLED') {
      const supabaseAdmin = createAdminClient()
      const targetInvoiceId = invoiceId || external_id

      // 1. Fetch target plan details
      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('*, items(*, members(full_name, email), brand_partners(id, commission_rate))')
        .eq('xendit_invoice_id', targetInvoiceId)
        .maybeSingle()

      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 12)

      const waitingPeriodEnd = new Date()
      waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + 14) // 14 days waiting period

      // 2. Update plan status to active
      await supabaseAdmin
        .from('plans')
        .update({
          status: 'active',
          plan_start_date: startDate.toISOString().split('T')[0],
          plan_end_date: endDate.toISOString().split('T')[0],
          waiting_period_end_date: waitingPeriodEnd.toISOString().split('T')[0],
        })
        .or(`xendit_invoice_id.eq.${targetInvoiceId},xendit_invoice_id.eq.${external_id}`)

      // 3. Record Partner Bagi Hasil Commission if referred by Brand Partner
      if (plan?.items?.registered_by_partner_id || plan?.items?.brand_partners?.id) {
        const partnerId = plan.items.registered_by_partner_id || plan.items.brand_partners.id
        const rate = plan.items.brand_partners?.commission_rate || 10
        const gross = paid_amount || amount || 120000
        const partnerShare = Math.round((gross * rate) / 100)
        const platformShare = gross - partnerShare

        await supabaseAdmin.from('partner_commissions').insert({
          partner_id: partnerId,
          item_id: plan.item_id,
          gross_amount: gross,
          commission_rate: rate,
          partner_share: partnerShare,
          platform_share: platformShare,
          payout_status: 'unpaid',
        })
      }

      // 4. Dispatch Email Confirmation to Member
      if (plan?.items?.members?.email) {
        const emailHtml = generatePolicyConfirmationEmail({
          recipientName: plan.items.members.full_name || 'Member AsWeCare',
          itemBrand: plan.items.brand,
          itemModel: plan.items.model,
          planTier: plan.plan_tier === 'extended' ? 'Extended Plan' : 'Basic Plan',
          quota: plan.annual_quota || 2,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          invoiceId: targetInvoiceId,
        })

        await sendDirectEmail({
          to: plan.items.members.email,
          subject: `Polis Proteksi Garansi Aktif: ${plan.items.brand} ${plan.items.model} — AsWeCare`,
          html: emailHtml,
          text: `Selamat, polis garansi AsWeCare untuk ${plan.items.brand} ${plan.items.model} kini resmi aktif!`,
        })
      }
    }

    return NextResponse.json({ received: true, status: 'processed' })
  } catch (error: any) {
    console.error('Xendit webhook processing error:', error)
    return NextResponse.json({ message: error.message || 'Webhook error' }, { status: 500 })
  }
}
