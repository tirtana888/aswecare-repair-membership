'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, FormField } from '@/components/ui';
import { cn, formatIDR } from '@/lib/utils';
import { 
  CheckCircle2, DollarSign, Send, Smartphone, Footprints, 
  Info, Plus, Trash2, ChevronRight, ChevronLeft, User, Package, Image as ImageIcon, CreditCard
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Data Customer', icon: User },
  { id: 2, title: 'Detail Produk', icon: Package },
  { id: 3, title: 'Foto Produk', icon: ImageIcon },
  { id: 4, title: 'Pembayaran', icon: CreditCard },
];

export default function PartnerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // Wizard state
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentModeUsed, setPaymentModeUsed] = useState<'partner_pay' | 'send_link' | null>(null);

  // Step 1: Customer
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Step 2: Product
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // Step 3: Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Step 4: Tier & Payment
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<any>(null);

  // Fetch initial data & partner custom protection mapping
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let partnerCustomTiers: string[] = []
      let partnerCustomSubcats: string[] = []

      if (user) {
        const { data: partnerUser } = await supabase
          .from('brand_partner_users')
          .select('brand_partners(allowed_tier_ids, allowed_subcategory_ids)')
          .eq('id', user.id)
          .maybeSingle()

        if (partnerUser?.brand_partners) {
          partnerCustomTiers = Array.isArray(partnerUser.brand_partners.allowed_tier_ids) ? partnerUser.brand_partners.allowed_tier_ids : []
          partnerCustomSubcats = Array.isArray(partnerUser.brand_partners.allowed_subcategory_ids) ? partnerUser.brand_partners.allowed_subcategory_ids : []
        }
      }

      const [{ data: cats }, { data: subcats }, { data: tierData }] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('subcategories').select('*').eq('is_active', true),
        supabase.from('membership_tiers').select('*').eq('is_active', true).order('duration_months')
      ])

      let filteredSubcats = subcats || []
      if (partnerCustomSubcats.length > 0 && subcats) {
        filteredSubcats = subcats.filter(sc => partnerCustomSubcats.includes(sc.id))
      }
      setSubcategories(filteredSubcats)

      // Filter categories to ONLY show categories that contain active subcategories for this partner
      if (cats && filteredSubcats.length > 0) {
        const activeCategoryIds = new Set(filteredSubcats.map(sc => sc.category_id))
        const activeCats = cats.filter(c => activeCategoryIds.has(c.id))
        setCategories(activeCats)

        // If only 1 category is active for this partner, auto-select it!
        if (activeCats.length === 1) {
          setSelectedCategory(activeCats[0].id)
        }
      } else if (cats) {
        setCategories(cats)
      }

      if (tierData) {
        const filteredTiers = partnerCustomTiers.length > 0
          ? tierData.filter(t => partnerCustomTiers.includes(t.id))
          : tierData
        setTiers(filteredTiers)
        if (filteredTiers.length > 0) setSelectedTier(filteredTiers[0])
      }
    }
    fetchData()
  }, [supabase])

  const addPhoto = () => {
    if (newPhotoUrl) {
      setPhotoUrls([...photoUrls, newPhotoUrl]);
      setNewPhotoUrl('');
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const totalPrice = (selectedTier?.price || 0) + 2500; // Fake admin fee for demo

  const handleSubmit = async (paymentMode: 'partner_pay' | 'send_link') => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, customerEmail, customerPhone,
          subcategoryId: selectedSubcategory,
          brand, model, estimatedValue: parseFloat(estimatedValue) || 0,
          purchaseDate: purchaseDate || null,
          photoUrls,
          tierId: selectedTier?.id,
          planTier: selectedTier?.plan_tier || 'basic',
          durationMonths: selectedTier?.duration_months || 3,
          bonusMonths: selectedTier?.bonus_months || 0,
          bonusQuota: selectedTier?.bonus_quota || 0,
          amount: totalPrice,
          paymentMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan saat registrasi.');
      
      setPaymentModeUsed(paymentMode);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSuccess(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setBrand('');
    setModel('');
    setEstimatedValue('');
    setPurchaseDate('');
    setPhotoUrls([
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80'
    ]);
    setSelectedTier(null);
    setPaymentModeUsed(null);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="p-8 text-center bg-green-50/50 border-green-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-600 mb-8">
            {paymentModeUsed === 'partner_pay' 
              ? `Pembayaran berhasil! Customer ${customerName} telah terdaftar dengan proteksi ${selectedTier?.name}.`
              : `Link pembayaran telah dikirim ke ${customerEmail}. Customer akan mendapat proteksi setelah pembayaran selesai.`}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={resetForm}>
              Daftarkan Customer Lain
            </Button>
            <Button onClick={() => router.push('/partner/customers')}>
              Lihat Daftar Customer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Registrasi Proteksi Baru</h1>
        <p className="text-gray-500">Daftarkan customer dan aktifkan asuransi produk.</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        
        <div className="flex justify-between">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const Icon = s.icon;
            
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors",
                    isCompleted ? "border-brand-600 text-brand-600" : 
                    isCurrent ? "border-brand-600 bg-brand-50 text-brand-600" : 
                    "border-gray-200 text-gray-400"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium hidden sm:block",
                  isCurrent || isCompleted ? "text-gray-900" : "text-gray-500"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Customer</h2>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Jika email sudah terdaftar sebagai member AsWeCare, data akan otomatis terhubung ke akun mereka.
              </p>
            </div>

            <div className="space-y-4">
              <FormField label="Nama Lengkap" required>
                <Input 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Masukkan nama lengkap customer"
                />
              </FormField>
              <FormField label="Email" required>
                <Input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  placeholder="email@example.com"
                />
              </FormField>
              <FormField label="Nomor HP/WhatsApp" required>
                <Input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="08xxxxxxxxxx"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Kategori & Detail Produk</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kategori Kategori Utama</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(null);
                      }}
                      className={cn(
                        "p-4 rounded-xl border text-left flex items-center gap-3 transition-all",
                        selectedCategory === cat.id 
                          ? "border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {cat.slug?.includes('electronic') || cat.name?.toLowerCase().includes('elektronik') ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Footprints className="w-5 h-5" />
                      )}
                      <span className="font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Kategori</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subcategories.filter(sc => sc.category_id === selectedCategory).map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => setSelectedSubcategory(subcat.id)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg border text-center transition-colors",
                          selectedSubcategory === subcat.id
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <FormField label="Merek/Brand" required>
                <Input 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  placeholder="Misal: Samsung, Nike"
                />
              </FormField>
              
              <FormField label="Model/Tipe" required>
                <Input 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)} 
                  placeholder="Misal: Galaxy S23 Ultra"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Perkiraan Nilai Barang (Rp)">
                  <Input 
                    type="number" 
                    value={estimatedValue} 
                    onChange={(e) => setEstimatedValue(e.target.value)} 
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Tanggal Pembelian">
                  <Input 
                    type="date" 
                    value={purchaseDate} 
                    onChange={(e) => setPurchaseDate(e.target.value)} 
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Foto Produk</h2>
            <p className="text-sm text-gray-500">Unggah Foto Produk (Minimal 3 Sudut Berbeda).</p>
            
            <div className="flex gap-2">
              <Input 
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" onClick={addPhoto} variant="secondary">
                <Plus className="w-4 h-4 mr-2" /> Tambah
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border">
                  <Image
                    src={url}
                    alt={`Foto ${i+1}`}
                    fill
                    className="object-cover"
                  />
                  <button 
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                    Foto {i+1}
                  </div>
                </div>
              ))}
              {photoUrls.length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Belum ada foto yang ditambahkan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pilih Paket & Metode Pembayaran</h2>
            
            <div className="space-y-3">
              {tiers.map((tier) => (
                <label 
                  key={tier.id}
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl cursor-pointer transition-all",
                    selectedTier?.id === tier.id 
                      ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="tier" 
                      value={tier.id}
                      checked={selectedTier?.id === tier.id}
                      onChange={() => setSelectedTier(tier)}
                      className="text-brand-600 focus:ring-brand-600 h-4 w-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                      <p className="text-sm text-gray-500">{tier.duration_months} Bulan Proteksi</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-left sm:text-right ml-7 sm:ml-0">
                    <span className="font-bold text-gray-900">{formatIDR(tier.price)}</span>
                  </div>
                </label>
              ))}
            </div>

            {selectedTier && (
              <>
                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Harga Paket</span>
                    <span>{formatIDR(selectedTier.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Admin</span>
                    <span>{formatIDR(2500)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatIDR(totalPrice)}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <button
                    disabled={processing}
                    onClick={() => handleSubmit('partner_pay')}
                    className="p-5 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors flex items-start gap-4 disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Bayar Langsung</h3>
                      <p className="text-sm text-blue-700/80 mt-1">Saldo partner akan dipotong dan proteksi langsung aktif.</p>
                    </div>
                  </button>

                  <button
                    disabled={processing}
                    onClick={() => handleSubmit('send_link')}
                    className="p-5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left transition-colors flex items-start gap-4 disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      QRIS
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900">QRIS / Link Pembayaran Customer</h3>
                      <p className="text-sm text-emerald-700/80 mt-1">Tunjukkan kode QRIS ke customer di kasir atau kirimkan link bayar via WhatsApp/email.</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || processing}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!customerName || !customerEmail || !customerPhone)) ||
                (step === 2 && (!selectedCategory || !selectedSubcategory || !brand || !model)) ||
                (step === 3 && photoUrls.length < 3)
              }
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-sm text-gray-500">
              Pilih metode pembayaran di atas untuk menyelesaikan.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
