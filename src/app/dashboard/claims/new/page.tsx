'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, AlertCircle, Wrench } from 'lucide-react'
import { Card, Button, Input, Select, Textarea, FormField } from '@/components/ui'

const DAMAGE_TYPES_MAP: Record<string, string[]> = {
  // Audio & TWS
  audio: [
    'Suara Mati Sebelah (Kiri / Kanan)',
    'Baterai TWS / Case Drop / Rusak',
    'Port Charging Case Tidak Mengisi / Longgar',
    'Koneksi Bluetooth Putus-Putus / Unpair',
    'Mikrofon Suara Kecil / Rusak',
    'Kerusakan Fisik Case / Engsel Retak',
    'Kerusakan Lain (Manual Review)',
  ],
  // Smartphone / HP
  handphone: [
    'Layar Pecah / Touchscreen Tidak Merespon',
    'Ganti Baterai (Drop Performa / Kembung)',
    'Servis Konektor Charging / Port USB-C / Lightning',
    'Kamera Belakang / Depan Blur / Mati',
    'Speaker / Receiver Suara Sember / Mati',
    'Tombol Power / Volume Tidak Berfungsi',
    'Kerusakan Lain (Manual Review)',
  ],
  // Laptop & Tablet
  laptop: [
    'Layar LCD Bergaris / Blank / Pecah',
    'Baterai Drop / Tidak Bisa Charge',
    'Keyboard / Touchpad Rusak / Tombol Lepas',
    'Engsel Body Retak / Patah',
    'Overheating / Kipas Bising / Mati Total',
    'Port USB / Type-C / HDMI Longgar',
    'Kerusakan Lain (Manual Review)',
  ],
  // Smartwatch & Wearables
  wearable: [
    'Layar Touchscreen Retak / Blank',
    'Baterai Drop / Magnet Charging Error',
    'Sensor Detak Jantung / GPS Error',
    'Strap / Tali Jam Putus / Pengait Rusak',
    'Kerusakan Lain (Manual Review)',
  ],
  // Sepatu & Sneaker
  sneaker: [
    'Sol Aus / Terkelupas / Midsole Yellowing',
    'Jahitan Upper Lepas / Sobek',
    'Cleaning Deep (Kotor Berat / Noda Bandel)',
    'Ganti Tali / Eyelet Rusak',
    'Reglue Sol / Lem Terbuka',
    'Kerusakan Lain (Manual Review)',
  ],
  // Pakaian & Fashion
  fashion: [
    'Jahitan Sobek / Lepas',
    'Resleting / Kancing Rusak / Lepas',
    'Patch / Tambal Kain',
    'Sablon / Print Pudar / Luntur',
    'Warna Luntur / Noda Permanent',
    'Kerusakan Lain (Manual Review)',
  ],
}

function getDamageOptions(item: any): string[] {
  if (!item) return DAMAGE_TYPES_MAP.sneaker

  const subcatName = (item.subcategories?.name || '').toLowerCase()
  const subcatSlug = (item.subcategories?.slug || '').toLowerCase()
  const brandModel = (item.brand + ' ' + item.model).toLowerCase()
  const categoryName = (item.subcategories?.categories?.name || '').toLowerCase()

  // 1. Check Audio / TWS / Airbud / Headphone / Earphone
  if (
    subcatName.includes('tws') || subcatName.includes('airbud') || subcatName.includes('headphone') ||
    subcatName.includes('earphone') || subcatName.includes('audio') || subcatSlug.includes('tws') ||
    subcatSlug.includes('audio') || subcatSlug.includes('accessories') || brandModel.includes('tws') ||
    brandModel.includes('airbud') || brandModel.includes('bud') || brandModel.includes('headphone')
  ) {
    return DAMAGE_TYPES_MAP.audio
  }

  // 2. Check Smartphone / Handphone
  if (
    subcatName.includes('hp') || subcatName.includes('phone') || subcatName.includes('smartphone') ||
    subcatSlug.includes('handphone') || subcatSlug.includes('phone')
  ) {
    return DAMAGE_TYPES_MAP.handphone
  }

  // 3. Check Laptop / Tablet
  if (
    subcatName.includes('laptop') || subcatName.includes('macbook') || subcatName.includes('tablet') ||
    subcatName.includes('ipad') || subcatSlug.includes('laptop') || subcatSlug.includes('tablet')
  ) {
    return DAMAGE_TYPES_MAP.laptop
  }

  // 4. Check Smartwatch / Wearable
  if (
    subcatName.includes('watch') || subcatName.includes('wearable') || subcatSlug.includes('watch')
  ) {
    return DAMAGE_TYPES_MAP.wearable
  }

  // 5. Check Fashion / Apparels
  if (
    subcatName.includes('kaos') || subcatName.includes('hoodie') || subcatName.includes('baju') ||
    subcatName.includes('pakaian') || subcatName.includes('jacket') || categoryName.includes('fashion') ||
    subcatSlug.includes('kaos') || subcatSlug.includes('hoodie')
  ) {
    return DAMAGE_TYPES_MAP.fashion
  }

  // 6. Check Sneaker / Sepatu
  if (
    subcatName.includes('sepatu') || subcatName.includes('sneaker') || subcatSlug.includes('sneaker')
  ) {
    return DAMAGE_TYPES_MAP.sneaker
  }

  // Fallback by Category Name
  if (categoryName.includes('elektronik') || categoryName.includes('electronic')) {
    return DAMAGE_TYPES_MAP.audio
  }

  return DAMAGE_TYPES_MAP.sneaker
}

function ClaimFormContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')

  const [item, setItem] = useState<any>(null)
  const [damageType, setDamageType] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
  ])
  const [photoInput, setPhotoInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (itemId) fetchItemDetails()
  }, [itemId])

  const fetchItemDetails = async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        subcategories (*, categories(name)),
        plans (*)
      `)
      .eq('id', itemId)
      .single()

    if (error || !data) {
      setError('Barang tidak ditemukan.')
    } else {
      setItem(data)
      const options = getDamageOptions(data)
      setDamageType(options[0])
    }
    setLoading(false)
  }

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotoUrls([...photoUrls, photoInput.trim()])
      setPhotoInput('')
    }
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const activePlan = item?.plans && item.plans.length > 0 ? item.plans[0] : null

    if (!activePlan || activePlan.status !== 'active') {
      setError('Barang ini belum memiliki plan membership aktif.')
      setSubmitting(false)
      return
    }

    if (activePlan.waiting_period_end_date && new Date(activePlan.waiting_period_end_date) > new Date()) {
      setError('Barang masih dalam masa tunggu 14 hari. Belum dapat mengajukan klaim.')
      setSubmitting(false)
      return
    }

    if (activePlan.quota_used >= activePlan.annual_quota) {
      setError('Kuota klaim tahunan untuk barang ini telah habis.')
      setSubmitting(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesi login berakhir.')
      setSubmitting(false)
      return
    }

    const { error: claimError } = await supabase.from('claims').insert({
      member_id: user.id,
      item_id: item.id,
      plan_id: activePlan.id,
      damage_type: damageType,
      description,
      photo_urls: photoUrls,
      status: 'submitted',
    })

    if (claimError) {
      setError(claimError.message)
      setSubmitting(false)
      return
    }

    router.push('/dashboard/claims')
    router.refresh()
  }

  if (loading) return <div className="py-16 text-center text-xs text-slate-500">Memuat data barang...</div>

  const damageOptions = getDamageOptions(item)

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Form Ajukan Klaim Servis</h1>
            <p className="text-xs text-slate-500">
              Barang: <strong>{item?.brand} {item?.model}</strong> ({item?.subcategories?.name})
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <FormField label={`Jenis Kerusakan (Predefined List - ${item?.subcategories?.name || ''})`}>
            <Select value={damageType} onChange={(e) => setDamageType(e.target.value)}>
              {damageOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Deskripsi Tambahan Kerusakan">
            <Textarea
              rows={3}
              placeholder="Jelaskan detail bagian mana yang aus/lepas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField label="Upload Foto Bukti Kerusakan">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photoUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                  <Image src={url} alt={`Bukti ${idx + 1}`} fill sizes="(max-width: 640px) 33vw, 200px" className="object-cover" />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="URL Foto Bukti Kerusakan"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddPhoto} icon={<Upload className="w-3.5 h-3.5" />}>
                Tambah
              </Button>
            </div>
          </FormField>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Mengirim Klaim...' : 'Kirim Pengajuan Klaim'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default function NewClaimPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-500">Memuat form klaim...</div>}>
      <ClaimFormContent />
    </Suspense>
  )
}
