'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, FormField, Select, Table, Thead, Th, Tbody, Tr, Td, StatusBadge, StatCard } from '@/components/ui';
import { Plus, Users, Building2, ChevronDown, ChevronUp, DollarSign, Percent, CheckCircle2, TrendingUp, Wallet, ShieldCheck, Layers, Settings } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function BrandPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [availableTiers, setAvailableTiers] = useState<any[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    categoryFocus: 'Semua',
    commissionRate: '10',
    allowedTierIds: [] as string[],
    allowedSubcategoryIds: [] as string[],
    loginEmail: '',
    loginPassword: '',
    loginName: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPartners, resRev] = await Promise.all([
        fetch('/api/admin/brand-partners'),
        fetch('/api/admin/revenue-share'),
      ]);

      if (resPartners.ok) {
        const json = await resPartners.json();
        if (json.partners) {
          setPartners(json.partners);
          setAvailableTiers(json.availableTiers || []);
          setAvailableSubcategories(json.availableSubcategories || []);
        } else if (Array.isArray(json)) {
          setPartners(json);
        }
      }

      if (resRev.ok) {
        const dataR = await resRev.json();
        setRevenueData(dataR);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTierSelection = (tierId: string) => {
    setFormData(prev => {
      const exists = prev.allowedTierIds.includes(tierId);
      return {
        ...prev,
        allowedTierIds: exists
          ? prev.allowedTierIds.filter(id => id !== tierId)
          : [...prev.allowedTierIds, tierId]
      };
    });
  };

  const toggleSubcategorySelection = (subcatId: string) => {
    setFormData(prev => {
      const exists = prev.allowedSubcategoryIds.includes(subcatId);
      return {
        ...prev,
        allowedSubcategoryIds: exists
          ? prev.allowedSubcategoryIds.filter(id => id !== subcatId)
          : [...prev.allowedSubcategoryIds, subcatId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/brand-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: '',
          contactEmail: '',
          contactPhone: '',
          address: '',
          categoryFocus: 'Semua',
          commissionRate: '10',
          allowedTierIds: [],
          allowedSubcategoryIds: [],
          loginEmail: '',
          loginPassword: '',
          loginName: ''
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || 'Terjadi kesalahan saat menambahkan partner');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
    setSubmitting(false);
  };

  const handleUpdateCommissionRate = async (partnerId: string, rate: number) => {
    try {
      const res = await fetch('/api/admin/brand-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partnerId, commission_rate: rate }),
      });
      if (res.ok) {
        setEditingRateId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayoutPartner = async (partnerId: string) => {
    if (!confirm('Apakah Anda yakin ingin menandai semua komisi pending partner ini sebagai Terbayar / Cair?')) return;
    try {
      const res = await fetch('/api/admin/revenue-share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_paid', partnerId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.is_active).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Brand Partner &amp; Bagi Hasil Custom</h1>
        <p className="text-slate-500 mt-1">Kelola mitra bisnis, persentase bagi hasil polis, serta paket proteksi &amp; subkategori khusus setiap brand.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Partner"
          value={totalPartners.toString()}
          icon={Building2}
        />
        <StatCard
          label="Partner Aktif"
          value={activePartners.toString()}
          icon={Users}
        />
        <StatCard
          label="Pendapatan Platform (AsWeCare)"
          value={formatIDR(revenueData?.totalPlatformShare || 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Komisi Belum Dicairkan"
          value={formatIDR(revenueData?.totalUnpaidShare || 0)}
          icon={Wallet}
        />
      </div>

      {/* Form Tambah Partner Baru */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
        <div className="p-6 border-b border-slate-100 cursor-pointer flex items-center justify-between" onClick={() => setShowForm(!showForm)}>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tambah Brand Partner Baru &amp; Pemetaan Proteksi Khusus</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftarkan partner baru, atur paket garansi khusus brand, serta subkategori produk yang diizinkan.</p>
          </div>
          {showForm ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>

        {showForm && (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Nama Bisnis / Brand *">
                  <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Contoh: iBox Official" />
                </FormField>
                <FormField label="Email Kontak Bisnis">
                  <Input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="partner@store.com" />
                </FormField>
                <FormField label="Telepon Bisnis">
                  <Input name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="08123456789" />
                </FormField>
                <FormField label="Fokus Kategori">
                  <Select name="categoryFocus" value={formData.categoryFocus} onChange={handleInputChange}>
                    <option value="Semua">Semua Kategori</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Fashion">Fashion</option>
                  </Select>
                </FormField>
                <FormField label="Persentase Bagi Hasil Partner (%) *">
                  <Input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleInputChange} required placeholder="10" min="0" max="100" />
                </FormField>
                <FormField label="Alamat Toko">
                  <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Jl. Jend. Sudirman No. 1, Jakarta" />
                </FormField>
              </div>

              {/* Pemetaan Proteksi Khusus Brand (Custom Tiers) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Pilih Paket Proteksi Khusus Brand Ini (Custom Tiers)</span>
                </div>
                <p className="text-[11px] text-slate-500">Centang paket harga yang hanya dapat digunakan oleh customer dari Brand Partner ini. (Jika tidak ada yang dicentang, semua paket aktif akan tersedia).</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {availableTiers.map((tier) => {
                    const isChecked = formData.allowedTierIds.includes(tier.id);
                    return (
                      <label
                        key={tier.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition ${
                          isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTierSelection(tier.id)}
                            className="text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span>{tier.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{formatIDR(tier.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pemetaan Subkategori Aktif Partner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Pilih Subkategori Produk Aktif Partner</span>
                </div>
                <p className="text-[11px] text-slate-500">Centang subkategori barang yang diizinkan didaftarkan oleh partner ini (misal: Smartphone &amp; Laptop saja).</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                  {availableSubcategories.map((subcat) => {
                    const isChecked = formData.allowedSubcategoryIds.includes(subcat.id);
                    return (
                      <label
                        key={subcat.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition ${
                          isChecked ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubcategorySelection(subcat.id)}
                          className="text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="truncate">{subcat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-200" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Akun Login Partner Portal</h3>
                <p className="text-xs text-slate-500">Kredensial ini digunakan partner untuk masuk ke portal `/partner`</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Nama Pengguna *">
                  <Input name="loginName" value={formData.loginName} onChange={handleInputChange} required placeholder="Admin iBox" />
                </FormField>
                <FormField label="Email Login *">
                  <Input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} required placeholder="ibox@aswecare.com" />
                </FormField>
                <FormField label="Password Login *">
                  <Input type="password" name="loginPassword" value={formData.loginPassword} onChange={handleInputChange} required placeholder="••••••••" />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={submitting} icon={<Plus className="w-4 h-4" />}>
                  {submitting ? 'Menyimpan Partner...' : 'Simpan Partner &amp; Pemetaan Proteksi'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* Tabel Partner & Bagi Hasil */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Daftar Partner &amp; Pemetaan Proteksi Khusus</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Nama Bisnis</Th>
                <Th>Proteksi Khusus (Custom Tiers)</Th>
                <Th>Bagi Hasil (%)</Th>
                <Th>Omset Polis (Gross)</Th>
                <Th>Komisi Partner</Th>
                <Th>Hak Platform</Th>
                <Th className="text-right">Aksi &amp; Payout</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-slate-400">Memuat data partner...</Td>
                </Tr>
              ) : partners.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-slate-400">Belum ada partner terdaftar</Td>
                </Tr>
              ) : (
                partners.map(partner => {
                  const customTiersCount = Array.isArray(partner.allowed_tier_ids) ? partner.allowed_tier_ids.length : 0;
                  const customSubcatsCount = Array.isArray(partner.allowed_subcategory_ids) ? partner.allowed_subcategory_ids.length : 0;

                  return (
                    <Tr key={partner.id}>
                      <Td className="font-semibold text-slate-900">
                        <div>{partner.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{partner.contact_email || '-'}</div>
                      </Td>

                      {/* Info Proteksi Khusus Brand */}
                      <Td>
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            {customTiersCount > 0 ? `${customTiersCount} Paket Khusus` : 'Semua Paket Aktif'}
                          </span>
                          {customSubcatsCount > 0 && (
                            <span className="block text-[10px] text-slate-500 font-medium">
                              {customSubcatsCount} Subkategori Diizinkan
                            </span>
                          )}
                        </div>
                      </Td>

                      {/* Setting Persentase Bagi Hasil */}
                      <Td>
                        {editingRateId === partner.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={tempRate}
                              onChange={(e) => setTempRate(e.target.value)}
                              className="w-16 px-2 py-1 border border-blue-400 rounded text-xs font-bold"
                            />
                            <button
                              onClick={() => handleUpdateCommissionRate(partner.id, parseFloat(tempRate))}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRateId(partner.id);
                              setTempRate((partner.commission_rate || 10).toString());
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                          >
                            <Percent className="w-3 h-3" />
                            {partner.commission_rate || 10}%
                          </button>
                        )}
                      </Td>

                      <Td className="font-bold text-slate-800">{formatIDR(partner.total_gross || 0)}</Td>
                      <Td className="font-bold text-amber-700">{formatIDR(partner.total_partner_share || 0)}</Td>
                      <Td className="font-bold text-emerald-700">{formatIDR(partner.total_platform_share || 0)}</Td>

                      <Td className="text-right space-x-2">
                        {partner.unpaid_share > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePayoutPartner(partner.id)}
                            icon={<DollarSign className="w-3.5 h-3.5" />}
                          >
                            Cairkan Komisi
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
