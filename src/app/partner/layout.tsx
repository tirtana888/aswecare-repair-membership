import { createClient } from '@/lib/supabase/server'
import PartnerShell from '@/components/PartnerShell'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let partnerUser = null
  if (user) {
    const { data } = await supabase
      .from('brand_partner_users')
      .select('*, brand_partners(*)')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    partnerUser = data
  }

  // If not partner user (e.g. unauthenticated on /partner/login), render children without PartnerShell
  if (!partnerUser) {
    return <>{children}</>
  }

  return (
    <PartnerShell
      partnerName={partnerUser.brand_partners?.name || 'Partner'}
      userName={partnerUser.full_name || user?.email || 'Partner User'}
      userRole={partnerUser.role || 'owner'}
    >
      {children}
    </PartnerShell>
  )
}
