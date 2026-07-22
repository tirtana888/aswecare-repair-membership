'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Upload, Footprints, Smartphone, AlertCircle, ShoppingBag, CreditCard, FileText, Hash } from 'lucide-react'
import { Card, Button, Input, FormField } from '@/components/ui'
import { cn, formatIDR } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Kategori' },
  { id: 2, label: 'Foto Barang' },
  { id: 3, label: 'Detail Specs' },
  { id: 4, label: 'Konfirmasi' },
]

export default function AddItemWizard() {
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseChannel, setPurchaseChannel] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
  ])
  const [photoInput, setPhotoInput] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCatalog()
  }, [])

  const fetchCatalog = async () => {
    const { data: cats } = await supabase.from('categories').select('*')
    const { data: subs } = await supabase.from('subcategories').select('*').eq('is_active', true)
    if (cats) setCategories(cats)
    if (subs) setSubcategories(subs)
  }

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotoUrls([...photoUrls, photoInput.trim()])
      setPhotoInput('')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesi login berakhir. Silakan login kembali.')
      setLoading(false)
      return
    }

    const { data: newItem, error: itemError } = await supabase.from('items').insert({
      member_id: user.id,
      subcategory_id: selectedSubcategory,
      brand,
      model,
      serial_number: serialNumber || null,
      receipt_url: receiptUrl || null,
      estimated_value: parseFloat(estimatedValue) || 0,
      purchase_date: purchaseDate || null,
      purchase_channel: purchaseChannel || 'Toko Resmi / Direct',
      condition_at_signup: 'pending_review',
      photo_urls: photoUrls,
    }).select().single()

    if (itemError) {
      setError(itemError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/protection-select?itemId=${newItem.id}`)
    router.refresh()
  }

  const filteredSubcategories = subcategories.filter((sub) => sub.category_id === selectedCategory)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      <Card className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Form Tambah Barang</h1>
          <p className="text-xs text-slate-500 mt-0.5">Daftarkan barang Anda untuk diajukan proteksi membership</p>
        </div>

        {/* Step progress indicator */}
        <div className="flex items-center border-b border-slate-100 pb-5">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition',
                    step > s.id
                      ? 'bg-indigo-600 text-white'
                      : step === s.id
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className={cn('text-[10px] font-semibold whitespace-nowrap', step >= s.id ? 'text-indigo-700' : 'text-slate-400')}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-1.5 mb-4 rounded-full', step > s.id ? 'bg-indigo-600' : 'bg-slate-100')} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">1. Pilih Kategori</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id)
                      setSelectedSubcategory('')
                    }}
                    className={cn(
                      'p-4 rounded-xl border text-left transition flex items-center gap-3',
                      selectedCategory === cat.id
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    {cat.name.toLowerCase().includes('fashion') ? (
                      <Footprints className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-purple-600" />
                    )}
                    <div>
                      <span className="block text-sm">{cat.name}</span>
                      <span className="text-[10px] text-slate-500">Kategori Utama</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">2. Pilih Sub-Kategori</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={cn(
                        'p-3 rounded-xl border text-center transition text-xs',
                        selectedSubcategory === sub.id
                          ? 'border-indigo-600 bg-indigo-600 text-white font-semibold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button disabled={!selectedCategory || !selectedSubcategory} onClick={() => setStep(2)} icon={<ArrowRight className="w-4 h-4" />}>
                Lanjut Ke Foto
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Foto Barang (Minimal 3 Sudut Berbeda)
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Foto wajib menampilkan bagian atas, samping, dan bawah sol/bodi untuk assessment kondisi.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <Image src={url} alt={`Foto ${idx + 1}`} fill sizes="(max-width: 640px) 33vw, 200px" className="object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Sudut {idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="URL Foto Tambahan (Supabase Storage/Image URL)"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddPhoto} icon={<Upload className="w-3.5 h-3.5" />}>
                  Tambah
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>Kembali</Button>
              <Button disabled={photoUrls.length < 3} onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
                Lanjut Ke Specs
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <FormField label="Merek / Brand">
              <Input required placeholder="Contoh: Nike, Adidas, Apple" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </FormField>

            <FormField label="Model / Tipe">
              <Input required placeholder="Contoh: Air Jordan 1 High, iPhone 14 Pro" value={model} onChange={(e) => setModel(e.target.value)} />
            </FormField>

            <FormField
              label={
                <span className="flex items-center gap-1 text-slate-700">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" /> Nomor Seri / S/N / IMEI (Opsional)
                </span>
              }
            >
              <Input
                placeholder="Contoh: SN-90234812398 atau IMEI 35489028..."
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </FormField>

            <FormField
              label={
                <span className="flex items-center gap-1 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Unggah Struk / Nota Pembelian (Opsional)
                </span>
              }
            >
              <Input
                type="url"
                placeholder="https://example.com/struk-nota.jpg (URL Nota Pembelian)"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
              />
            </FormField>

            <FormField
              label={
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" /> Toko Pembelian / Channel Pembelian
                </span>
              }
            >
              <Input
                required
                placeholder="Contoh: iBox Senayan City, Tokopedia Official, Sneakerhead Jakarta"
                value={purchaseChannel}
                onChange={(e) => setPurchaseChannel(e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Perkiraan Nilai (Rp)">
                <Input type="number" placeholder="2500000" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
              </FormField>
              <FormField label="Tanggal Pembelian">
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </FormField>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Kembali</Button>
              <Button disabled={!brand || !model || !purchaseChannel} onClick={() => setStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                Review Konfirmasi
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Merek &amp; Model:</span>
                <span className="font-bold text-slate-900">{brand} {model}</span>
              </div>
              {serialNumber && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Nomor Seri / IMEI:</span>
                  <span className="font-semibold text-indigo-600">{serialNumber}</span>
                </div>
              )}
              {receiptUrl && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Struk / Nota Pembelian:</span>
                  <span className="font-semibold text-emerald-600 truncate max-w-[200px]">Struk Terlampir ✓</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Toko Pembelian:</span>
                <span className="font-semibold text-indigo-800">{purchaseChannel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Nilai:</span>
                <span className="font-semibold text-slate-900">{formatIDR(estimatedValue)}</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Setelah menekan tombol simpan, Anda akan langsung diarahkan ke halaman Pilihan Paket Membership &amp; Pembayaran.</span>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>Kembali</Button>
              <Button variant="primary" loading={loading} onClick={handleSubmit} icon={<CreditCard className="w-4 h-4" />}>
                {loading ? 'Mengirim Data...' : 'Lanjut Ke Pilihan Paket & Bayar'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
