import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient()

    const { data: claims, error } = await supabaseAdmin
      .from('claims')
      .select('*, members(full_name, email, phone_number), items(brand, model), partners(id, name)')
      .order('submitted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    const { data: partners, error: partnersError } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (partnersError) {
      return NextResponse.json({ message: partnersError.message }, { status: 500 })
    }

    return NextResponse.json({ claims, partners })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { claimId, status, assigned_partner_id, actual_service_cost, rejection_reason } = await req.json()

    if (!claimId) {
      return NextResponse.json({ message: 'claimId wajib diisi' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const updatePayload: Record<string, any> = {}
    if (status !== undefined) updatePayload.status = status
    if (assigned_partner_id !== undefined) updatePayload.assigned_partner_id = assigned_partner_id
    if (actual_service_cost !== undefined) updatePayload.actual_service_cost = actual_service_cost
    if (rejection_reason !== undefined) updatePayload.rejection_reason = rejection_reason
    if (status === 'completed' || status === 'delivered' || status === 'rejected') {
      updatePayload.resolved_at = new Date().toISOString()
    }

    const { data: updatedClaim, error } = await supabaseAdmin
      .from('claims')
      .update(updatePayload)
      .eq('id', claimId)
      .select('plan_id')
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Automatically sync quota_used on the plan table
    if (updatedClaim?.plan_id) {
      const { count } = await supabaseAdmin
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', updatedClaim.plan_id)
        .in('status', ['submitted', 'approved', 'in_service', 'completed', 'delivered'])

      await supabaseAdmin
        .from('plans')
        .update({ quota_used: count || 0 })
        .eq('id', updatedClaim.plan_id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 })
  }
}
