'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { PageHeader, Card, Button, Input, Textarea, EmptyState, ConfirmDialog, useToast } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Subcategory {
  id: string
  name: string
}

interface ProductTerm {
  id: string
  subcategory_id: string
  title: string
  content: string
  is_active: boolean
}

export default function TermsPage() {
  const supabase = createClient()
  const toast = useToast()
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [terms, setTerms] = useState<ProductTerm[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [newTerm, setNewTerm] = useState({ title: '', content: '' })

  useEffect(() => {
    fetchSubcategories()
  }, [])

  useEffect(() => {
    if (selectedSubcategory) {
      fetchTerms(selectedSubcategory)
    } else {
      setTerms([])
    }
  }, [selectedSubcategory])

  const fetchSubcategories = async () => {
    const { data } = await supabase.from('subcategories').select('id, name').order('name')
    if (data) setSubcategories(data)
  }

  const fetchTerms = async (subId: string) => {
    const { data } = await supabase.from('product_terms').select('*').eq('subcategory_id', subId).order('created_at')
    if (data) setTerms(data)
  }

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubcategory) return
    setSaving(true)
    const { error } = await supabase.from('product_terms').insert([{
      subcategory_id: selectedSubcategory,
      title: newTerm.title,
      content: newTerm.content,
      is_active: true,
    }])
    setSaving(false)
    if (!error) {
      setNewTerm({ title: '', content: '' })
      fetchTerms(selectedSubcategory)
      toast.success('Ketentuan baru berhasil ditambahkan')
    } else {
      toast.error('Gagal menambah syarat & ketentuan')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('product_terms').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error('Gagal mengubah status ketentuan')
      return
    }
    if (selectedSubcategory) fetchTerms(selectedSubcategory)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    setDeleting(true)
    const { error } = await supabase.from('product_terms').delete().eq('id', deletingId)
    setDeleting(false)
    setDeletingId(null)
    if (error) {
      toast.error('Gagal menghapus S&K')
      return
    }
    if (selectedSubcategory) fetchTerms(selectedSubcategory)
    toast.success('S&K berhasil dihapus')
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader title="Ketentuan Produk" description="Kelola syarat dan ketentuan spesifik per sub-kategori produk." />

      <div className="flex flex-1 gap-5 min-h-0">
        {/* Panel Kiri: Subkategori */}
        <Card className="w-72 shrink-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="font-bold text-slate-800 text-sm">Sub-Kategori</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors',
                  selectedSubcategory === sub.id
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {sub.name}
              </button>
            ))}
            {subcategories.length === 0 && <p className="text-slate-400 p-4 text-sm text-center">Memuat sub-kategori...</p>}
          </div>
        </Card>

        {/* Panel Kanan: S&K */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedSubcategory ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                <h2 className="font-bold text-slate-800 text-sm">
                  Daftar S&K: {subcategories.find((s) => s.id === selectedSubcategory)?.name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form onSubmit={handleAddTerm} className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary-600" /> Tambah Ketentuan Baru
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Poin</label>
                    <Input
                      required
                      value={newTerm.title}
                      onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
                      placeholder="Contoh: Batasan Umur Perangkat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Isi Ketentuan</label>
                    <Textarea
                      required
                      rows={3}
                      value={newTerm.content}
                      onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
                      placeholder="Penjelasan detail ketentuan..."
                    />
                  </div>
                  <Button type="submit" size="sm" loading={saving}>
                    Simpan Ketentuan
                  </Button>
                </form>

                <div className="space-y-3">
                  {terms.length === 0 ? (
                    <EmptyState title="Belum ada S&K" description="Belum ada syarat & ketentuan untuk sub-kategori ini." />
                  ) : (
                    terms.map((term) => (
                      <div
                        key={term.id}
                        className={cn(
                          'p-4 border rounded-xl flex gap-4',
                          term.is_active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm mb-1">{term.title}</h4>
                          <p className="text-slate-600 text-sm whitespace-pre-wrap">{term.content}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 items-center shrink-0">
                          <button
                            onClick={() => toggleActive(term.id, term.is_active)}
                            className={cn(
                              'min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full transition-colors',
                              term.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                            )}
                            title={term.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            aria-label={term.is_active ? `Nonaktifkan ketentuan ${term.title}` : `Aktifkan ketentuan ${term.title}`}
                          >
                            {term.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          </button>
                          <button
                            onClick={() => setDeletingId(term.id)}
                            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                            aria-label={`Hapus ketentuan ${term.title}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Pilih sub-kategori" description="Pilih sub-kategori di panel kiri untuk mengelola S&K." className="flex-1 flex flex-col items-center justify-center" />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Hapus Syarat & Ketentuan?"
        description="Poin ini akan dihapus permanen dan tidak lagi tampil ke member. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
      />
    </div>
  )
}
