import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient()
    const [
      { data: tiers, error: tiersError },
      { data: categories },
      { data: subcategories }
    ] = await Promise.all([
      supabaseAdmin.from('membership_tiers').select('*, categories(name), subcategories(name)').order('created_at', { ascending: false }),
      supabaseAdmin.from('categories').select('*'),
      supabaseAdmin.from('subcategories').select('*').eq('is_active', true)
    ])

    if (tiersError) {
      return NextResponse.json({ message: tiersError.message }, { status: 500 })
    }

    return NextResponse.json({
      tiers: tiers || [],
      categories: categories || [],
      subcategories: subcategories || []
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from('membership_tiers')
      .insert([{
        name: body.name,
        plan_tier: body.plan_tier || 'basic',
        category_id: body.category_id || null,
        subcategory_id: body.subcategory_id || null,
        duration_months: body.duration_months || 12,
        bonus_months: body.bonus_months || 0,
        bonus_quota: body.bonus_quota || 0,
        waiting_period_days: body.waiting_period_days !== undefined ? body.waiting_period_days : 14,
        original_price: body.original_price || 0,
        price: body.price || 0,
        discount_percentage: body.discount_percentage || 0,
        admin_fee: body.admin_fee || 0,
        is_active: true,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, is_active, ...updates } = await req.json()
    if (!id) {
      return NextResponse.json({ message: 'id required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const payload: any = {}
    if (typeof is_active === 'boolean') payload.is_active = is_active
    Object.assign(payload, updates)

    const { data, error } = await supabaseAdmin
      .from('membership_tiers')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ message: 'ID required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('membership_tiers').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Paket berhasil dihapus' })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
