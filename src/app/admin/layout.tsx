import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isSuperAdminEmail = user?.email?.toLowerCase() === 'superclaim@globalbeli.com'

  let isAdmin = isSuperAdminEmail
  if (!isAdmin && user) {
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = !!adminRecord
  }

  // If not admin (e.g. unauthenticated on /admin/login), render children without AdminShell
  if (!isAdmin) {
    return <>{children}</>
  }

  return <AdminShell userEmail={user?.email || ''}>{children}</AdminShell>
}
