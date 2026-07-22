'use client'

import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, ArrowUpDown, Package, ShieldCheck, Wrench } from 'lucide-react'
import { PageHeader, Input, Button, Table, Thead, Th, Tbody, Tr, Td, TableEmptyState, TableSkeletonRows } from '@/components/ui'
import { formatDateID } from '@/lib/utils'

interface User {
  id: string
  full_name: string
  email: string
  phone_number: string
  created_at: string
  total_items: number
  active_plans: number
  total_claims: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        } else {
          setUsers([])
        }
      } catch (error) {
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users
    .filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone_number.includes(search)
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Pantau seluruh anggota terdaftar beserta aktivitas barang, paket, dan klaim mereka."
      />

      <div className="bg-white rounded-card shadow-card border border-slate-200 overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-slate-100">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Cari nama, email, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          >
            Tanggal Daftar {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
          </Button>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Nama Lengkap</Th>
              <Th>Kontak</Th>
              <Th>Tanggal Daftar</Th>
              <Th>Barang</Th>
              <Th>Paket Aktif</Th>
              <Th>Klaim</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <TableSkeletonRows rows={5} cols={7} />
            ) : filteredUsers.length === 0 ? (
              <TableEmptyState colSpan={7} title="Belum ada anggota" description="Tidak ada anggota yang cocok dengan pencarian ini." />
            ) : (
              filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <Tr clickable onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)}>
                    <Td className="font-semibold text-slate-900">{user.full_name}</Td>
                    <Td>
                      <div className="text-slate-700">{user.email}</div>
                      <div className="text-xs text-slate-400">{user.phone_number}</div>
                    </Td>
                    <Td>{formatDateID(user.created_at)}</Td>
                    <Td>{user.total_items}</Td>
                    <Td>{user.active_plans}</Td>
                    <Td>{user.total_claims}</Td>
                    <Td className="text-slate-400">
                      {expandedRow === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Td>
                  </Tr>
                  {expandedRow === user.id && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={7} className="px-5 py-5">
                        <div className="grid grid-cols-3 gap-4 max-w-lg">
                          <div className="flex items-center gap-2.5 bg-white rounded-lg border border-slate-200 p-3">
                            <Package className="w-4 h-4 text-primary-500" />
                            <div>
                              <p className="text-[11px] text-slate-400">Total Barang</p>
                              <p className="font-bold text-slate-900 text-sm">{user.total_items}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 bg-white rounded-lg border border-slate-200 p-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-[11px] text-slate-400">Paket Aktif</p>
                              <p className="font-bold text-slate-900 text-sm">{user.active_plans}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 bg-white rounded-lg border border-slate-200 p-3">
                            <Wrench className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="text-[11px] text-slate-400">Total Klaim</p>
                              <p className="font-bold text-slate-900 text-sm">{user.total_claims}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
