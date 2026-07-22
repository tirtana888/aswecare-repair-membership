import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient()

    const { data: items, error } = await supabaseAdmin
      .from('items')
      .select('*, members(full_name, email, phone_number), subcategories(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { itemId, condition_at_signup, condition_notes } = await req.json()
    if (!itemId) {
      return NextResponse.json({ message: 'itemId wajib diisi' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
      .from('items')
      .update({
        condition_at_signup,
        condition_notes,
      })
      .eq('id', itemId)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 })
  }
}
