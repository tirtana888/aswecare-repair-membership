'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronRight, Save, ShieldAlert, Loader2, Info } from 'lucide-react'
import { PageHeader, Card, Button, FormField, Input, Textarea, EmptyState, useToast } from '@/components/ui'

interface Category {
  id: string
  name: string
  description: string
}

interface Subcategory {
  id: string
  category_id: string
  name: string
  default_annual_quota: number
  waiting_period_days: number
  max_item_value: number
  coverage_description: string
  is_active: boolean
}

export default function CategoriesPage() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Subcategory>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [{ data: cats }, { data: subcats }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name'),
      ])
      if (cats) setCategories(cats)
      if (subcats) setSubcategories(subcats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (sub: Subcategory) => {
    if (editingSubcategory === sub.id) {
      setEditingSubcategory(null)
    } else {
      setEditingSubcategory(sub.id)
      setEditForm({ ...sub, waiting_period_days: sub.waiting_period_days ?? 14 })
    }
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('subcategories')
        .update({
          default_annual_quota: editForm.default_annual_quota,
          waiting_period_days: editForm.waiting_period_days,
          max_item_value: editForm.max_item_value,
          coverage_description: editForm.coverage_description,
          is_active: editForm.is_active,
        })
        .eq('id', id)

      if (error) throw error

      setSubcategories((prev) => prev.map((s) => (s.id === id ? ({ ...s, ...editForm } as Subcategory) : s)))
      setEditingSubcategory(null)
      toast.success('Kebijakan berhasil diperbarui')
    } catch (error) {
      console.error('Error saving subcategory:', error)
      toast.error('Gagal menyimpan perubahan kebijakan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Kategori & Kebijakan"
        description="Atur kategori barang dan kebijakan garansi per subkategori."
      />

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-50/70 transition"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900">{category.name}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{category.description || 'Tidak ada deskripsi'}</p>
              </div>
              {expandedCategory === category.id ? (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {expandedCategory === category.id && (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {subcategories.filter((s) => s.category_id === category.id).map((sub) => (
                  <div key={sub.id} className="p-4">
                    <div
                      className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-slate-50 transition"
                      onClick={() => handleEditClick(sub)}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 text-primary-600" />
                        <span className="font-semibold text-slate-800 text-sm">{sub.name}</span>
                        {!sub.is_active && (
                          <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                        {editingSubcategory === sub.id ? 'Tutup Editor' : 'Edit Kebijakan'}
                      </span>
                    </div>

                    {editingSubcategory === sub.id && (
                      <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/40 p-5">
                        <h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 text-sm">
                          <Info className="h-4 w-4 text-primary-600" />
                          Editor Kebijakan: {sub.name}
                        </h4>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField label="Kuota Tahunan Default">
                            <Input
                              type="number"
                              value={editForm.default_annual_quota || 0}
                              onChange={(e) => setEditForm({ ...editForm, default_annual_quota: parseInt(e.target.value) })}
                            />
                          </FormField>
                          <FormField label="Masa Tunggu (Hari)">
                            <Input
                              type="number"
                              value={editForm.waiting_period_days || 14}
                              onChange={(e) => setEditForm({ ...editForm, waiting_period_days: parseInt(e.target.value) })}
                            />
                          </FormField>
                          <FormField label="Maksimal Nilai Barang (Rp)">
                            <Input
                              type="number"
                              value={editForm.max_item_value || 0}
                              onChange={(e) => setEditForm({ ...editForm, max_item_value: parseInt(e.target.value) })}
                            />
                          </FormField>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer mt-5">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                checked={editForm.is_active || false}
                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                              />
                              <span className="text-sm font-medium text-slate-700">Status Aktif</span>
                            </label>
                          </div>
                          <FormField label="Deskripsi Cakupan Garansi" className="md:col-span-2">
                            <Textarea
                              rows={3}
                              value={editForm.coverage_description || ''}
                              onChange={(e) => setEditForm({ ...editForm, coverage_description: e.target.value })}
                            />
                          </FormField>
                        </div>

                        <div className="mt-5 flex justify-end">
                          <Button onClick={() => handleSave(sub.id)} loading={saving} icon={<Save className="h-4 w-4" />}>
                            Simpan Perubahan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {subcategories.filter((s) => s.category_id === category.id).length === 0 && (
                  <p className="p-4 text-center text-sm text-slate-500">Belum ada subkategori.</p>
                )}
              </div>
            )}
          </Card>
        ))}
        {categories.length === 0 && !loading && (
          <Card>
            <EmptyState title="Belum ada data kategori" />
          </Card>
        )}
      </div>
    </div>
  )
}
