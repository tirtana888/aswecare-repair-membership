'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, MapPin, Phone, Building, CheckCircle, Shield, Power, PowerOff } from 'lucide-react'
import { PageHeader, Card, StatCard, Button, Modal, FormField, Input, Select, EmptyState, useToast } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Partner {
  id: string
  name: string
  type: 'cobbler' | 'cleaning_service' | 'gadget_technician'
  location_area: string
  phone_number: string
  is_active: boolean
}

const TYPE_LABELS: Record<Partner['type'], string> = {
  cobbler: 'Tukang Sepatu',
  cleaning_service: 'Jasa Cleaning',
  gadget_technician: 'Teknisi Gadget',
}

export default function PartnersPage() {
  const supabase = createClient()
  const toast = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'cobbler' as Partner['type'],
    location_area: '',
    phone_number: '',
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    const { data } = await supabase.from('partners').select('*').order('name')
    if (data) setPartners(data)
    setLoading(false)
  }

  const activePartnersCount = partners.filter((p) => p.is_active).length

  const handleCreate = async () => {
    if (!formData.name || !formData.location_area || !formData.phone_number) return
    setSaving(true)
    const { error } = await supabase.from('partners').insert([{ ...formData, is_active: true }])
    setSaving(false)
    if (!error) {
      setShowForm(false)
      setFormData({ name: '', type: 'cobbler', location_area: '', phone_number: '' })
      fetchPartners()
      toast.success('Mitra baru berhasil ditambahkan')
    } else {
      toast.error('Gagal menyimpan mitra baru')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('partners').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error('Gagal mengubah status mitra')
      return
    }
    fetchPartners()
    toast.success(currentStatus ? 'Mitra dinonaktifkan' : 'Mitra diaktifkan')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Servis"
        description="Kelola bengkel, service center, dan mitra perbaikan yang menangani klaim member."
        action={
          <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Tambah Mitra Baru
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard label="Total Mitra" value={partners.length} icon={Building} tone="primary" />
        <StatCard label="Mitra Aktif" value={activePartnersCount} icon={CheckCircle} tone="success" />
        <StatCard label="Kategori Servis" value={Object.keys(TYPE_LABELS).length} icon={Shield} tone="pro" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-card bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <Card><EmptyState title="Belum ada mitra" description="Tambahkan mitra servis pertama Anda." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <Card key={partner.id} hover className={cn('p-5', !partner.is_active && 'opacity-60')}>
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{partner.name}</h3>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {TYPE_LABELS[partner.type] || partner.type}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(partner.id, partner.is_active)}
                  className={cn(
                    'min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full transition-colors shrink-0',
                    partner.is_active ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                  )}
                  title={partner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  aria-label={partner.is_active ? `Nonaktifkan mitra ${partner.name}` : `Aktifkan mitra ${partner.name}`}
                >
                  {partner.is_active ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {partner.location_area}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {partner.phone_number}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold',
                    partner.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', partner.is_active ? 'bg-emerald-500' : 'bg-slate-400')} />
                  {partner.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Tambah Mitra Baru"
        description="Daftarkan bengkel atau teknisi servis baru ke jaringan AsWeCare."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button loading={saving} onClick={handleCreate}>Simpan Mitra</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nama Mitra" required>
            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Service Center Elektronik Jakarta" />
          </FormField>
          <FormField label="Kategori Reparasi" required>
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Partner['type'] })}>
              <option value="cobbler">Tukang Sepatu</option>
              <option value="cleaning_service">Jasa Cleaning</option>
              <option value="gadget_technician">Teknisi Gadget</option>
            </Select>
          </FormField>
          <FormField label="Lokasi / Kota" required>
            <Input required value={formData.location_area} onChange={(e) => setFormData({ ...formData, location_area: e.target.value })} placeholder="Contoh: Jakarta Selatan" />
          </FormField>
          <FormField label="Nomor Telepon" required>
            <Input required value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="08123456789" />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
