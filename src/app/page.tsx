'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Shield, ShieldCheck, Zap, PackageCheck, Wrench, Store, ArrowRight, Check, X as XIcon,
  ChevronDown, Search, Smartphone, Laptop, Headphones, Footprints, Truck, RefreshCw,
  Star, FileText, Lock, Users, HelpCircle, CheckCircle2, Clock, DollarSign, Building2
} from 'lucide-react'
import BrandPartnerModal from '@/components/BrandPartnerModal'
import ServicePartnerModal from '@/components/ServicePartnerModal'
import { formatIDR } from '@/lib/utils'

export default function SquareTradeLandingPage() {
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)

  // Claim Simulator State
  const [claimTab, setClaimTab] = useState<'submit' | 'track'>('submit')
  const [claimBrand, setClaimBrand] = useState('Apple')
  const [claimCategory, setClaimCategory] = useState('Smartphone')
  const [claimDamage, setClaimDamage] = useState('screen')
  const [claimSuccess, setClaimSuccess] = useState(false)

  // Tracker State
  const [trackId, setTrackId] = useState('')
  const [trackResult, setTrackResult] = useState<any>(null)

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSimulateClaim = (e: React.FormEvent) => {
    e.preventDefault()
    setClaimSuccess(true)
  }

  const handleTrackClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackId) return
    setTrackResult({
      id: trackId,
      status: 'Pengerjaan Servis oleh Service Center Resmi',
      item: `${claimBrand} (${claimDamage === 'screen' ? 'Layar Pecah' : 'Aus Baterai/Komponen'})`,
      date: '22 Juli 2026',
      estimatedCompletion: '24 Juli 2026',
      partner: 'iFixit / Authorized Repair Partner',
    })
  }

  const faqs = [
    {
      q: 'Bagaimana cara mengajukan klaim perbaikan barang?',
      a: 'Proses klaim dapat dilakukan secara online 24/7 dalam 2 menit. Cukup masuk ke akun Anda atau klik "Ajukan Klaim" di halaman ini, pilih jenis kerusakan, dan kurir kami akan menjemput barang Anda secara gratis untuk diperbaiki oleh mitra servis resmi.'
    },
    {
      q: 'Berapa biaya tambahan (deductible) saat mengajukan klaim?',
      a: 'Rp 0. Tidak ada biaya tersembunyi. Seluruh biaya jasa perbaikan dan penggantian sparepart original ditanggung penuh sesuai kuota keanggotaan Anda (2x perbaikan per tahun).'
    },
    {
      q: 'Berapa lama masa tunggu polis keanggotaan baru?',
      a: 'Masa tunggu standar adalah 14 hari kerja sejak polis dikonfirmasi untuk memverifikasi kondisi awal barang.'
    },
    {
      q: 'Bagaimana jika toko atau brand saya ingin menjadi mitra resmi AsWeCare?',
      a: 'Toko retail dan brand mitra dapat bergabung melalui tombol "Join sebagai Brand". Anda mendapatkan akses portal khusus (/partner) untuk mendaftarkan proteksi produk pelanggan Anda secara langsung sekaligus menerima komisi bagi hasil.'
    }
  ]

  const categories = [
    {
      title: 'Smartphones & Tablet',
      desc: 'Proteksi layar retak, liquid spills, battery decay, dan kerusakan komponen fisik.',
      price: 'Rp 15.000',
      period: 'bulan',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      icon: Smartphone,
      features: ['Layar Pecah & Retak', 'Komponen Aus / Mati', 'Jemput-Antar Gratis', '2x Servis / Tahun'],
    },
    {
      title: 'Laptops & Computers',
      desc: 'Perbaikan motherboard, keyboard, liquid damage, dan layar laptop.',
      price: 'Rp 25.000',
      period: 'bulan',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      icon: Laptop,
      features: ['Kerusakan Hardware', 'Layar & Keyboard', 'Sparepart OEM Original', 'SLA 3-5 Hari Kerja'],
    },
    {
      title: 'Sneakers & High-End Fashion',
      desc: 'Restorasi sepatu mahal, reglue, jahit sol, repaint, dan perbaikan tas branded.',
      price: 'Rp 10.000',
      period: 'bulan',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      icon: Footprints,
      features: ['Restorasi Lem & Sol', 'Jahit & Repaint Fisik', 'Kurir Door-to-Door', 'Garansi Pengerjaan'],
    },
    {
      title: 'Headphones & Wearables',
      desc: 'Proteksi smartwatches, audio headphones, dan kabel charger dari aus fisik.',
      price: 'Rp 8.000',
      period: 'bulan',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      icon: Headphones,
      features: ['Driver Audio & Bluetooth', 'Baterai & Port Charging', 'Perbaikan Cepat', '0 Deductible'],
    },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* 1. SQUARETRADE HERO SECTION (Deep Navy Theme) */}
      <section className="bg-slate-950 text-white relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>ALLSTATE PROTECTION PLATFORM PARTNER</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Fast, hassle-free protection for the things you love.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                Perlindungan garansi resmi untuk Gadget Elektronik &amp; Produk Fashion. Bebas biaya tersembunyi dengan penjemputan kurir gratis dan perbaikan teknisi berpengalaman.
              </p>

              {/* Action Box: Direct Claim / Register */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 max-w-xl mx-auto lg:mx-0 shadow-2xl">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider text-left">Pilih Layanan Cepat</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href="#claim-section" className="w-full">
                    <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                      <FileText className="w-4 h-4" />
                      <span>Ajukan Klaim Online</span>
                    </button>
                  </a>
                  <Link href="/signup" className="w-full">
                    <button className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Beli Membership Baru</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Trust Indicators Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.8 / 5</span>
                  <span>(120.000+ Ulasan Member)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>10+ Juta Barang Terproteksi</span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <Image
                  src="/images/hero-banner.jpg"
                  alt="AsWeCare Protection Showcase"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
                
                {/* Floating Status Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-bold text-white">Status Proteksi: Aktif</p>
                      <p className="text-[11px] text-slate-400">iPhone 15 Pro Max &bull; 2x Kuota Servis Utuh</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-full">
                    Official Guarantee
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. RETAIL & BRAND PARTNERS BAR */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
            Dipercaya Oleh Peritel &amp; Brand Resmi Terkemuka
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80 font-black text-slate-800 text-lg">
            {['iBox Official', 'Sneakerhead', 'Digimap', 'Erafone', 'Electronic City', 'Nike Store', 'Walmart Retail'].map((brand, idx) => (
              <div key={idx} className="flex items-center gap-2 hover:text-blue-600 transition">
                <Store className="w-5 h-5 text-blue-600" />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOP PROTECTION PLANS BY CATEGORY (Real Product Cards) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Kategori Proteksi</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Perlindungan Resmi Berdasarkan Kategori</h2>
            <p className="text-sm text-slate-500">Pilih jenis produk Anda untuk melihat perlindungan menyeluruh tanpa biaya tersembunyi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  {/* Category Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-xs text-blue-600">
                      <cat.icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition">{cat.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700">
                      {cat.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Mulai dari</span>
                    <span className="text-base font-extrabold text-slate-900">{cat.price} <span className="text-xs font-normal text-slate-500">/{cat.period}</span></span>
                  </div>
                  <Link href="/signup">
                    <button className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition">
                      Pilih Paket
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (SquareTrade 3-Step Process) */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Cara Kerja Proteksi</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Klaim Garansi Cepat dalam 3 Langkah</h2>
            <p className="text-sm text-slate-400">Proses serba online tanpa prosedur klaim yang rumit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Beli atau Daftarkan Barang',
                desc: 'Daftarkan barang Anda saat membeli di toko mitra resmi atau secara mandiri online dalam waktu kurang dari 2 menit.',
                icon: PackageCheck,
              },
              {
                num: '2',
                title: 'Barang Rusak? Klaim Online 24/7',
                desc: 'Masuk ke akun Anda, jelaskan kerusakan fisik yang terjadi, dan dapatkan persetujuan klaim instan tanpa syarat berbelit.',
                icon: FileText,
              },
              {
                num: '3',
                title: 'Perbaikan Cepat & Gratis Kurir',
                desc: 'Pilih perbaikan di Service Center resmi terdekat atau gunakan kurir antar-jemput gratis. Barang kembali mulus seperti baru.',
                icon: Truck,
              },
            ].map((step, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-800/90 border border-slate-700/80 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-blue-500/30">0{step.num}</span>
                  <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE CLAIM CENTER (#claim-section) */}
      <section id="claim-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Layanan Mandiri Klaim</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pusat Pengajuan &amp; Pelacakan Klaim</h2>
            <p className="text-sm text-slate-500">Cek simulasi perbaikan barang Anda atau lacak status servis secara realtime.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setClaimTab('submit')}
                className={`flex-1 py-4 text-xs font-bold transition flex items-center justify-center gap-2 ${
                  claimTab === 'submit' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Simulasi / Ajukan Klaim Baru</span>
              </button>

              <button
                onClick={() => setClaimTab('track')}
                className={`flex-1 py-4 text-xs font-bold transition flex items-center justify-center gap-2 ${
                  claimTab === 'track' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Lacak Status Klaim Realtime</span>
              </button>
            </div>

            {/* Tab 1 Content */}
            {claimTab === 'submit' && (
              <div className="p-8">
                {claimSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900">Simulasi Klaim Disetujui!</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Kerusakan <strong>{claimDamage === 'screen' ? 'Layar Pecah' : 'Aus Baterai/Komponen'}</strong> pada <strong>{claimBrand} {claimCategory}</strong> tercover penuh oleh garansi AsWeCare dengan estimasi selesai 3 hari kerja.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-3">
                      <Link href="/login">
                        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition">
                          Masuk &amp; Ajukan Klaim Resmi
                        </button>
                      </Link>
                      <button
                        onClick={() => setClaimSuccess(false)}
                        className="px-6 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                      >
                        Coba Simulasi Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSimulateClaim} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Merek Barang</label>
                        <select
                          value={claimBrand}
                          onChange={(e) => setClaimBrand(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Nike">Nike</option>
                          <option value="Adidas">Adidas</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori Barang</label>
                        <select
                          value={claimCategory}
                          onChange={(e) => setClaimCategory(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Smartphone">Smartphone / Phone</option>
                          <option value="Laptop">Laptop / Computer</option>
                          <option value="Sneakers">Sneakers / Fashion</option>
                          <option value="Wearables">Headphones / Smartwatch</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kerusakan Fisik</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'screen', label: 'Layar Pecah / Retak' },
                          { id: 'wear', label: 'Aus Baterai / Lem Sol' },
                          { id: 'hardware', label: 'Tombol / Port Rusak' },
                          { id: 'total', label: 'Mati Total' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setClaimDamage(d.id)}
                            className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                              claimDamage === d.id
                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Cek Simulasi Kelayakan Klaim</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Tab 2 Content */}
            {claimTab === 'track' && (
              <div className="p-8 space-y-6">
                <form onSubmit={handleTrackClaim} className="flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan Nomor WhatsApp atau ID Klaim"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Lacak
                  </button>
                </form>

                {trackResult && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ID Klaim: {trackResult.id}</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{trackResult.item}</h4>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-200">
                        {trackResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Service Center:</span>
                        <span className="font-semibold text-slate-800">{trackResult.partner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Estimasi Selesai:</span>
                        <span className="font-semibold text-emerald-700">{trackResult.estimatedCompletion}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. FOR BUSINESSES: RETAILERS & SERVICE PARTNERS (SquareTrade B2B) */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Kemitraan Bisnis B2B</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Kembangkan Bisnis Anda Bersama AsWeCare</h2>
            <p className="text-sm text-slate-400">Solusi terintegrasi untuk peritel, brand resmi, dan penyedia layanan servis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Retailers & Brands Card */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-500/20 text-blue-400 rounded-2xl w-fit">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Join sebagai Brand Partner</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sediakan opsi garansi proteksi AsWeCare di kasir atau e-commerce toko Anda. Tingkatkan angka penjualan produk dan dapatkan komisi bagi hasil per polis.
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Portal khusus Brand Partner (`/partner`)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Komisi bagi hasil hingga 15% per polis</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <span>Daftar Brand Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* For Service Partners Card */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl w-fit">
                  <Wrench className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Join Partner Servis Resmi</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jadikan workshop atau service center Anda sebagai Service Partner Resmi AsWeCare. Terima pesanan perbaikan rutin setiap hari dengan jaminan pengerjaan cepat.
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Pasokan pesanan perbaikan rutin dari platform</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Sistem klaim invoice &amp; pencairan dana cepat</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Daftar Partner Servis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY ASWECARE VS TRADITIONAL WARRANTY / INSURANCE */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Perbandingan Keanggotaan</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mengapa AsWeCare Lebih Unggul?</h2>
            <p className="text-sm text-slate-500">Bandingkan perlindungan AsWeCare dengan garansi pabrik atau asuransi konvensional.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 sm:p-5 font-bold text-slate-700 uppercase">Fasilitas Proteksi</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400 uppercase text-center">Garansi Pabrik Toko</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400 uppercase text-center">Asuransi Umum</th>
                  <th className="p-4 sm:p-5 font-bold text-blue-600 uppercase text-center bg-blue-50/50">AsWeCare Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feature: 'Cover Kerusakan Fisik & Aus Pemakaian', store: false, insurance: false, aswecare: true },
                  { feature: 'Rp 0 Biaya Tambahan saat Klaim', store: false, insurance: false, aswecare: true },
                  { feature: 'Penjemputan & Pengantaran Kurir Gratis', store: false, insurance: false, aswecare: true },
                  { feature: 'SLA Perbaikan 3-5 Hari Kerja', store: false, insurance: false, aswecare: true },
                  { feature: 'Sparepart Original Bergaransi', store: true, insurance: false, aswecare: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4 sm:p-5 font-semibold text-slate-900">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-center">
                      {row.store ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <XIcon className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {row.insurance ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <XIcon className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-blue-50/30">
                      <Check className="w-6 h-6 text-blue-600 font-bold mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tanya Jawab</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. COMPREHENSIVE FOOTER (SquareTrade Standard) */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>AsWeCare</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Platform keanggotaan perbaikan fisik &amp; perawatan garansi resmi terpercaya di Indonesia.
              </p>
            </div>

            {/* System Portal Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Akses Portal Sistem</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-white transition flex items-center gap-1.5">
                    <span>Portal Member Login</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </Link>
                </li>
                <li>
                  <Link href="/partner/login" className="hover:text-white transition flex items-center gap-1.5">
                    <span>Portal Brand Partner (`/partner`)</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white transition flex items-center gap-1.5">
                    <span>Admin Console (`/admin`)</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kemitraan */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Program Kemitraan</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setIsBrandModalOpen(true)} className="hover:text-white transition text-left">
                    Join sebagai Brand Partner
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsServiceModalOpen(true)} className="hover:text-white transition text-left">
                    Join Partner Servis Resmi
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Bantuan &amp; Kontak</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dukungan Pelanggan &amp; Pengajuan Klaim Garansi Online 24/7.
              </p>
              <p className="text-xs text-blue-400 font-semibold">support@aswecare.com</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
            &copy; 2026 AsWeCare. All rights reserved. Repair Membership Platform.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BrandPartnerModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />
      <ServicePartnerModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} />
    </div>
  )
}
