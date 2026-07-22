import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id: invoiceId, status } = body

    if (status === 'PAID' || status === 'SETTLED') {
      const supabaseAdmin = createAdminClient()

      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1)

      const waitingPeriodEnd = new Date()
      waitingPeriodEnd.setDate(waitingPeriodEnd.getDate() + 14) // +14 days PRD §4.1 Flow 1 step 10

      // Update plan status to active
      await supabaseAdmin
        .from('plans')
        .update({
          status: 'active',
          plan_start_date: startDate.toISOString().split('T')[0],
          plan_end_date: endDate.toISOString().split('T')[0],
          waiting_period_end_date: waitingPeriodEnd.toISOString().split('T')[0],
        })
        .eq('xendit_invoice_id', invoiceId)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Webhook error' }, { status: 500 })
  }
}
