'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, FormField, Select, Table, Thead, Th, Tbody, Tr, Td, StatCard, Modal } from '@/components/ui';
import { Plus, Users, Building2, ChevronDown, ChevronUp, DollarSign, Percent, CheckCircle2, TrendingUp, Wallet, ShieldCheck, Layers, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function BrandPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [availableTiers, setAvailableTiers] = useState<any[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Delete State
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);

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

  const toggleTierSelection = (tierId: string, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev: any) => {
        const list = prev.allowed_tier_ids || [];
        const exists = list.includes(tierId);
        return {
          ...prev,
          allowed_tier_ids: exists ? list.filter((id: string) => id !== tierId) : [...list, tierId]
        };
      });
    } else {
      setFormData(prev => {
        const exists = prev.allowedTierIds.includes(tierId);
        return {
          ...prev,
          allowedTierIds: exists ? prev.allowedTierIds.filter(id => id !== tierId) : [...prev.allowedTierIds, tierId]
        };
      });
    }
  };

  const toggleSubcategorySelection = (subcatId: string, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev: any) => {
        const list = prev.allowed_subcategory_ids || [];
        const exists = list.includes(subcatId);
        return {
          ...prev,
          allowed_subcategory_ids: exists ? list.filter((id: string) => id !== subcatId) : [...list, subcatId]
        };
      });
    } else {
      setFormData(prev => {
        const exists = prev.allowedSubcategoryIds.includes(subcatId);
        return {
          ...prev,
          allowedSubcategoryIds: exists ? prev.allowedSubcategoryIds.filter(id => id !== subcatId) : [...prev.allowedSubcategoryIds, subcatId]
        };
      });
    }
  };

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/brand-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateForm(false);
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

  // UPDATE (EDIT)
  const openEditModal = (partner: any) => {
    setEditingPartner(partner);
    setEditFormData({
      id: partner.id,
      name: partner.name,
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      address: partner.address || '',
      category_focus: partner.category_focus || 'Semua',
      commission_rate: partner.commission_rate || 10,
      allowed_tier_ids: Array.isArray(partner.allowed_tier_ids) ? partner.allowed_tier_ids : [],
      allowed_subcategory_ids: Array.isArray(partner.allowed_subcategory_ids) ? partner.allowed_subcategory_ids : [],
      is_active: partner.is_active
    });
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/brand-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setEditingPartner(null);
        setEditFormData(null);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || 'Gagal memperbarui partner');
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const toggleActiveStatus = async (partner: any) => {
    try {
      const res = await fetch('/api/admin/brand-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partner.id, is_active: !partner.is_active }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Apakah Anda yakin ingin MENGHAPUS Brand Partner ini beserta seluruh akun loginnya? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`/api/admin/brand-partners?id=${partnerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menghapus partner');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CRUD Manajemen Brand Partner &amp; Bagi Hasil</h1>
          <p className="text-slate-500 mt-1">Tambah, edit, nonaktifkan, atau hapus brand partner serta pemetaan proteksi khusus.</p>
        </div>

        <Button onClick={() => setShowCreateForm(!showCreateForm)} icon={<Plus className="w-4 h-4" />}>
          {showCreateForm ? 'Tutup Form' : 'Tambah Brand Partner'}
        </Button>
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

      {/* CREATE FORM */}
      {showCreateForm && (
        <Card className="overflow-hidden border border-slate-200 shadow-lg rounded-2xl">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tambah Brand Partner Baru</h2>
              <p className="text-xs text-slate-500 mt-0.5">Daftarkan partner, atur % bagi hasil, pemetaan proteksi, dan kredensial login</p>
            </div>
            <button onClick={() => setShowCreateForm(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Tutup ✕</button>
          </div>

          <div className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Nama Pengguna Login *">
                  <Input name="loginName" value={formData.loginName} onChange={handleInputChange} required placeholder="Admin iBox" />
                </FormField>
                <FormField label="Email Login *">
                  <Input type="email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} required placeholder="ibox@aswecare.com" />
                </FormField>
                <FormField label="Password Login *">
                  <Input type="password" name="loginPassword" value={formData.loginPassword} onChange={handleInputChange} required placeholder="••••••••" />
                </FormField>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Batal</Button>
                <Button type="submit" loading={submitting} icon={<Plus className="w-4 h-4" />}>
                  {submitting ? 'Menyimpan Partner...' : 'Simpan Partner Baru'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* READ: TABEL PARTNER */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Daftar Partner &amp; Aksi Kelola CRUD</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Nama Bisnis &amp; Kontak</Th>
                <Th>Proteksi &amp; Subkategori</Th>
                <Th>Bagi Hasil (%)</Th>
                <Th>Omset Polis</Th>
                <Th>Komisi Partner</Th>
                <Th>Status</Th>
                <Th className="text-right">Aksi CRUD</Th>
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
                        <div className="text-[11px] text-slate-400 font-normal">{partner.contact_email || partner.contact_phone || '-'}</div>
                      </Td>

                      {/* Info Proteksi Khusus */}
                      <Td>
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            {customTiersCount > 0 ? `${customTiersCount} Paket Khusus` : 'Semua Paket'}
                          </span>
                          {customSubcatsCount > 0 && (
                            <span className="block text-[10px] text-slate-500 font-medium">
                              {customSubcatsCount} Subkategori
                            </span>
                          )}
                        </div>
                      </Td>

                      <Td className="font-bold text-indigo-600">{partner.commission_rate || 10}%</Td>
                      <Td className="font-bold text-slate-800">{formatIDR(partner.total_gross || 0)}</Td>
                      <Td className="font-bold text-amber-700">{formatIDR(partner.total_partner_share || 0)}</Td>

                      <Td>
                        <button
                          onClick={() => toggleActiveStatus(partner)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            partner.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {partner.is_active ? <Power className="w-3 h-3 text-emerald-600" /> : <PowerOff className="w-3 h-3 text-slate-400" />}
                          {partner.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </Td>

                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(partner)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                            title="Edit Partner"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Hapus Partner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {partner.unpaid_share > 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handlePayoutPartner(partner.id)}
                              icon={<DollarSign className="w-3.5 h-3.5" />}
                            >
                              Cairkan
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </div>
      </Card>

      {/* EDIT PARTNER MODAL */}
      {editingPartner && editFormData && (
        <Modal isOpen={!!editingPartner} onClose={() => setEditingPartner(null)} title={`Edit Brand Partner: ${editingPartner.name}`}>
          <form onSubmit={handleUpdatePartner} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nama Brand Partner *">
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Persentase Bagi Hasil (%) *">
                <Input
                  type="number"
                  value={editFormData.commission_rate}
                  onChange={(e) => setEditFormData({ ...editFormData, commission_rate: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Email Kontak">
                <Input
                  type="email"
                  value={editFormData.contact_email}
                  onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                />
              </FormField>
              <FormField label="Telepon Kontak">
                <Input
                  value={editFormData.contact_phone}
                  onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                />
              </FormField>
              <FormField label="Alamat Toko" className="col-span-full">
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </FormField>
            </div>

            {/* Custom Tiers Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">Paket Proteksi Khusus Partner (Custom Tiers):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {availableTiers.map((tier) => {
                  const isChecked = (editFormData.allowed_tier_ids || []).includes(tier.id);
                  return (
                    <label key={tier.id} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTierSelection(tier.id, true)}
                          className="text-indigo-600 rounded"
                        />
                        <span>{tier.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{formatIDR(tier.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom Subcategories Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">Subkategori Produk Diizinkan:</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {availableSubcategories.map((subcat) => {
                  const isChecked = (editFormData.allowed_subcategory_ids || []).includes(subcat.id);
                  return (
                    <label key={subcat.id} className="flex items-center gap-2 text-xs p-2 bg-white rounded-lg border">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubcategorySelection(subcat.id, true)}
                        className="text-blue-600 rounded"
                      />
                      <span className="truncate">{subcat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEditingPartner(null)}>Batal</Button>
              <Button type="submit" loading={submitting}>Simpan Perubahan</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
