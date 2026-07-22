import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { itemId, planTier, durationMonths, bonusMonths, bonusQuota, amount, qrisFee, paymentMethod = 'qris_bi_0.7' } = await req.json()

    if (!itemId) {
      return NextResponse.json({ message: 'itemId wajib diisi' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch item & member details
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('*, subcategories(default_annual_quota), members(full_name, email, phone_number)')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 })
    }

    const externalId = `aswecare_inv_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const calculatedAmount = Math.round(amount || 120840)

    let invoiceUrl = `https://checkout.xendit.co/web/${externalId}`
    let xenditInvoiceId = externalId

    // 2. Call Xendit Live API if Secret Key is configured
    const xenditSecretKey = process.env.XENDIT_SECRET_KEY
    if (xenditSecretKey && xenditSecretKey !== 'xnd_development_mock_key_12345') {
      try {
        const authHeader = 'Basic ' + Buffer.from(xenditSecretKey + ':').toString('base64')
        const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            external_id: externalId,
            amount: calculatedAmount,
            description: `Proteksi Garansi AsWeCare (${item.brand} ${item.model}) - QRIS Standar BI (MDR 0,7%)`,
            payer_email: item.members?.email || 'customer@aswecare.com',
            customer: {
              given_names: item.members?.full_name || 'Customer AsWeCare',
              email: item.members?.email || 'customer@aswecare.com',
              mobile_number: item.members?.phone_number || undefined,
            },
            payment_methods: ['QRIS'],
            success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?status=paid`,
            failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/checkout?itemId=${itemId}&status=failed`,
            currency: 'IDR',
          }),
        })

        if (xenditRes.ok) {
          const xenditData = await xenditRes.json()
          invoiceUrl = xenditData.invoice_url
          xenditInvoiceId = xenditData.id
          console.log('Xendit Production Invoice Created:', xenditInvoiceId, invoiceUrl)
        } else {
          console.warn('Xendit API returned error, falling back to instant mode:', await xenditRes.text())
        }
      } catch (err: any) {
        console.error('Failed to communicate with Xendit API:', err.message)
      }
    }

    // Dynamic quota & dates calculation
    const { tierId, waitingPeriodDays } = await req.json().catch(() => ({}))
    
    let daysToWait = typeof waitingPeriodDays === 'number' ? waitingPeriodDays : 14

    if (tierId && daysToWait === 14) {
      const { data: tierData } = await supabaseAdmin
        .from('membership_tiers')
        .select('waiting_period_days')
        .eq('id', tierId)
        .maybeSingle()

      if (tierData && typeof tierData.waiting_period_days === 'number') {
        daysToWait = tierData.waiting_period_days
      }
    }

    const baseQuota = item.subcategories?.default_annual_quota || 2
    const totalQuota = baseQuota + (bonusQuota || 0)
    const totalMonths = (durationMonths || 3) + (bonusMonths || 0)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + totalMonths)

    const waitingPeriodEnd = new Date()
    waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + daysToWait)

    // Upsert into plans table with status PENDING_PAYMENT (No auto-approve until Xendit webhook callback)
    const { data: planData, error: planError } = await supabaseAdmin
      .from('plans')
      .upsert({
        item_id: itemId,
        plan_tier: planTier || 'basic',
        coverage_type: 'repair_only',
        billing_cycle: `${totalMonths}_months`,
        status: 'pending_payment',
        plan_start_date: startDate.toISOString().split('T')[0],
        plan_end_date: endDate.toISOString().split('T')[0],
        waiting_period_end_date: waitingPeriodEnd.toISOString().split('T')[0],
        annual_quota: totalQuota,
        quota_used: 0,
        xendit_invoice_id: xenditInvoiceId,
        xendit_invoice_url: invoiceUrl,
      }, { onConflict: 'item_id' })
      .select()
      .single()

    if (planError) {
      console.error('Plan upsert error:', planError)
      return NextResponse.json({ message: planError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      plan: planData,
      paymentMethod: 'qris_bi_0.7',
      mdrRate: '0.7%',
      calculatedMdrFee: qrisFee || Math.round((amount || 120000) * 0.007),
      invoiceUrl,
      invoiceId: xenditInvoiceId,
    })
  } catch (error: any) {
    console.error('Checkout API exception:', error)
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 })
  }
}
