import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { itemId, planTier, durationMonths, bonusMonths, bonusQuota, amount, qrisFee, paymentMethod = 'qris_bi_0.7' } = await req.json()

    if (!itemId) {
      return NextResponse.json({ message: 'itemId wajib diisi' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch item details
    const { data: item, error: itemError } = await supabaseAdmin
      .from('items')
      .select('*, subcategories(default_annual_quota)')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 })
    }

    const mockInvoiceId = `inv_qris_bi_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Dynamic quota calculation: default quota + bonus quota
    const baseQuota = item.subcategories?.default_annual_quota || 2
    const totalQuota = baseQuota + (bonusQuota || 0)

    // Dynamic dates calculation: duration_months + bonus_months
    const totalMonths = (durationMonths || 3) + (bonusMonths || 0)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + totalMonths)

    const waitingPeriodEnd = new Date()
    waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + 14) // +14 days waiting period

    // Upsert into plans table with QRIS Bank Indonesia 0.7% MDR Payment
    const { data: planData, error: planError } = await supabaseAdmin
      .from('plans')
      .upsert({
        item_id: itemId,
        plan_tier: planTier || 'basic',
        coverage_type: 'repair_only',
        billing_cycle: `${totalMonths}_months`,
        status: 'active', // Auto-Paid active status
        plan_start_date: startDate.toISOString().split('T')[0],
        plan_end_date: endDate.toISOString().split('T')[0],
        waiting_period_end_date: waitingPeriodEnd.toISOString().split('T')[0],
        annual_quota: totalQuota,
        quota_used: 0,
        xendit_invoice_id: mockInvoiceId,
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
      invoiceUrl: `https://checkout.xendit.co/web/${mockInvoiceId}`,
      invoiceId: mockInvoiceId,
    })
  } catch (error: any) {
    console.error('Checkout API exception:', error)
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 })
  }
}
