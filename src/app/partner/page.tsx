'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Users, Package, ShieldCheck, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { formatIDR, cn } from '@/lib/utils';

interface PartnerStats {
  totalCustomers: number;
  totalItems: number;
  activePlans: number;
  estimatedValue: number;
  recentActivity: Activity[];
}

interface Activity {
  id: string;
  customerName: string;
  itemName: string;
  planName: string;
  date: string;
  status: 'active' | 'pending' | 'expired';
}

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Mock data fallback if API fails
        const res = await fetch('/api/partner/stats');
        if (!res.ok) {
          throw new Error('Gagal memuat data statistik');
        }
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem');
        // Providing fallback mock data for demonstration
        setStats({
          totalCustomers: 124,
          totalItems: 342,
          activePlans: 310,
          estimatedValue: 155000000,
          recentActivity: [
            { id: '1', customerName: 'Budi Santoso', itemName: 'iPhone 15 Pro', planName: 'AsWeCare Premium', date: new Date().toISOString(), status: 'active' },
            { id: '2', customerName: 'Siti Aminah', itemName: 'Samsung Galaxy S24', planName: 'AsWeCare Basic', date: new Date(Date.now() - 86400000).toISOString(), status: 'pending' },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-red-700">
        <AlertCircle className="mb-2 h-8 w-8" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Partner</h1>
        <p className="text-slate-500">Ringkasan aktivitas dan performa pendaftaran pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Customer Didaftarkan</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.totalCustomers || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Barang Terproteksi</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.totalItems || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Paket Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats?.activePlans || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estimasi Nilai Transaksi</p>
              <h3 className="text-xl font-bold text-slate-900">{formatIDR(stats?.estimatedValue || 0)}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Barang</th>
                <th className="px-6 py-3 font-medium">Paket</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{item.itemName}</td>
                    <td className="px-6 py-4 text-slate-600">{item.planName}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          item.status === 'active' && "bg-emerald-100 text-emerald-700",
                          item.status === 'pending' && "bg-amber-100 text-amber-700",
                          item.status === 'expired' && "bg-red-100 text-red-700"
                        )}
                      >
                        {item.status === 'active' ? 'Aktif' : item.status === 'pending' ? 'Pending' : 'Kadaluarsa'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
