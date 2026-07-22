export interface MemberPlan {
  id: string
  item_id: string
  plan_tier: string
  status: string
  plan_end_date: string | null
  waiting_period_end_date: string | null
  annual_quota: number
  quota_used: number
}

export interface MemberItem {
  id: string
  brand: string
  model: string
  purchase_channel?: string | null
  condition_at_signup: string
  photo_urls?: string[]
  subcategories?: { name: string; category_id?: string } | null
  plans?: MemberPlan[]
}

export function getActivePlan(item: MemberItem): MemberPlan | null {
  if (!item.plans?.length) return null
  return item.plans.find((p) => p.status === 'active') || item.plans[item.plans.length - 1]
}

export function isWaitingPeriod(plan: MemberPlan | null): boolean {
  if (!plan?.waiting_period_end_date) return false
  return new Date(plan.waiting_period_end_date) > new Date()
}

export function isClaimDisabled(item: MemberItem): boolean {
  const plan = getActivePlan(item)
  if (!plan || plan.status !== 'active') return true
  return isWaitingPeriod(plan)
}

export function getItemStatusKey(item: MemberItem): string {
  const plan = getActivePlan(item)
  if (item.condition_at_signup === 'rejected') return 'rejected'
  if (!plan || plan.status === 'pending_payment') return 'pending_payment'
  if (isWaitingPeriod(plan)) return 'waiting_period'
  if (plan.plan_tier === 'extended') return 'extended'
  return 'active'
}

export function getQuotaPercent(plan: MemberPlan | null): number {
  if (!plan || plan.annual_quota <= 0) return 0
  const remaining = plan.annual_quota - plan.quota_used
  return Math.max(0, Math.min(100, (remaining / plan.annual_quota) * 100))
}
