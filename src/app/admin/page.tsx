'use client'

import React, { useEffect, useState } from 'react'
import { Users, ShieldCheck, Image as ImageIcon, Wrench, Users2, AlertCircle } from 'lucide-react'
import { PageHeader, StatCard, Card, CardHeader, Table, Thead, Th, Tbody, Tr, Td, TableEmptyState, TableSkeletonRows, StatusBadge } from '@/components/ui'
import { formatDateID } from '@/lib/utils'

interface DashboardStats {
  totalMembers: number
  activePlans: number
  pendingReviews: number
  openClaims: number
  activePartners: number
  recentItems: any[]
  recentClaims: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) throw new Error('Gagal memuat data statistik')
        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 flex items-start gap-4 text-rose-700">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold text-rose-800">Gagal Memuat Dashboard</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const kpis = [
    { title: 'Total Anggota', value: stats?.totalMembers ?? 0, icon: Users, tone: 'primary' as const },
    { title: 'Paket Aktif', value: stats?.activePlans ?? 0, icon: ShieldCheck, tone: 'success' as const },
    { title: 'Ulasan Foto Menunggu', value: stats?.pendingReviews ?? 0, icon: ImageIcon, tone: 'warning' as const },
    { title: 'Klaim Terbuka', value: stats?.openClaims ?? 0, icon: Wrench, tone: 'danger' as const },
    { title: 'Mitra Aktif', value: stats?.activePartners ?? 0, icon: Users2, tone: 'pro' as const },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Ringkasan Dasbor" description="Pantau metrik utama dan aktivitas terbaru AsWeCare." />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[92px] rounded-card bg-slate-100 animate-pulse" />)
          : kpis.map((kpi, index) => <StatCard key={index} label={kpi.title} value={kpi.value} icon={kpi.icon} tone={kpi.tone} />)}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden flex flex-col">
          <CardHeader>
            <h2 className="font-bold text-slate-800 text-sm">Barang Terdaftar Terbaru</h2>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Anggota</Th>
                <Th>Barang</Th>
                <Th>Tanggal</Th>
              </tr>
            </Thead>
            <Tbody>
              {loading ? (
                <TableSkeletonRows rows={4} cols={3} />
              ) : stats?.recentItems?.length === 0 ? (
                <TableEmptyState colSpan={3} title="Belum ada barang terdaftar" />
              ) : (
                stats?.recentItems?.map((item) => (
                  <Tr key={item.id}>
                    <Td className="font-semibold text-slate-900">{item.members?.full_name || 'Tanpa Nama'}</Td>
                    <Td>
                      <div className="font-medium text-slate-700">{item.brand}</div>
                      <div className="text-xs text-slate-400">{item.model}</div>
                    </Td>
                    <Td className="whitespace-nowrap">{formatDateID(item.created_at)}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>

        <Card className="overflow-hidden flex flex-col">
          <CardHeader>
            <h2 className="font-bold text-slate-800 text-sm">Klaim Terbaru</h2>
          </CardHeader>
          <Table>
            <Thead>
              <tr>
                <Th>Anggota & Barang</Th>
                <Th>Kerusakan</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              {loading ? (
                <TableSkeletonRows rows={4} cols={3} />
              ) : stats?.recentClaims?.length === 0 ? (
                <TableEmptyState colSpan={3} title="Belum ada klaim" />
              ) : (
                stats?.recentClaims?.map((claim) => (
                  <Tr key={claim.id}>
                    <Td>
                      <div className="font-semibold text-slate-900">{claim.members?.full_name || 'Tanpa Nama'}</div>
                      <div className="text-xs text-slate-400">{claim.items?.brand} {claim.items?.model}</div>
                    </Td>
                    <Td>{claim.damage_type}</Td>
                    <Td><StatusBadge status={claim.status} /></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
