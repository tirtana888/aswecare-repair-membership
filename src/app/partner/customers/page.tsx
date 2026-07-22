'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input } from '@/components/ui';
import { Search, ChevronDown, ChevronUp, Package, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'active' | 'inactive';
  items: CustomerItem[];
}

interface CustomerItem {
  id: string;
  brand: string;
  model: string;
  planStatus: 'active' | 'expired' | 'pending';
  planName: string;
}

export default function PartnerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/partner/customers');
        if (!res.ok) {
          throw new Error('Gagal memuat data pelanggan');
        }
        const data = await res.json();
        setCustomers(data.sort((a: Customer, b: Customer) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()));
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
        
        // Mock data fallback for demonstration
        const mockData: Customer[] = [
          {
            id: 'c1',
            name: 'Budi Santoso',
            email: 'budi@example.com',
            phone: '081234567890',
            registeredAt: new Date().toISOString(),
            status: 'active',
            items: [
              { id: 'i1', brand: 'Apple', model: 'iPhone 15 Pro Max', planStatus: 'active', planName: 'Premium Care' }
            ]
          },
          {
            id: 'c2',
            name: 'Siti Aminah',
            email: 'siti.a@example.com',
            phone: '08987654321',
            registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'active',
            items: [
              { id: 'i2', brand: 'Samsung', model: 'Galaxy S24 Ultra', planStatus: 'pending', planName: 'Basic Protect' },
              { id: 'i3', brand: 'Sony', model: 'PlayStation 5', planStatus: 'active', planName: 'Premium Care' }
            ]
          }
        ];
        setCustomers(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = customers.filter(
        c => 
          c.name.toLowerCase().includes(lowerQuery) || 
          c.email.toLowerCase().includes(lowerQuery) || 
          c.phone.includes(lowerQuery)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daftar Customer</h1>
          <p className="text-slate-500">Kelola dan pantau customer yang Anda daftarkan.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
          <span className="text-sm font-medium">Total Customer:</span>
          <span className="text-lg font-bold">{customers.length}</span>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Cari nama, email, atau no telepon..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium w-8"></th>
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Telepon</th>
                <th className="px-6 py-3 font-medium">Tanggal Daftar</th>
                <th className="px-6 py-3 font-medium">Barang</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <tr 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleRow(customer.id)}
                    >
                      <td className="px-6 py-4 text-slate-400">
                        {expandedRows.has(customer.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                      <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                      <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(customer.registeredAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span>{customer.items.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          customer.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {customer.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(customer.id) && (
                      <tr className="bg-slate-50 border-t-0">
                        <td colSpan={7} className="px-14 py-4">
                          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-100/50 text-slate-500">
                                <tr>
                                  <th className="px-4 py-2 font-medium">Brand & Model</th>
                                  <th className="px-4 py-2 font-medium">Paket Proteksi</th>
                                  <th className="px-4 py-2 font-medium">Status Paket</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {customer.items.map(item => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                      {item.brand} {item.model}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{item.planName}</td>
                                    <td className="px-4 py-3">
                                      <span className={cn(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                        item.planStatus === 'active' && "bg-emerald-100 text-emerald-700",
                                        item.planStatus === 'pending' && "bg-amber-100 text-amber-700",
                                        item.planStatus === 'expired' && "bg-red-100 text-red-700"
                                      )}>
                                        {item.planStatus === 'active' ? 'Aktif' : item.planStatus === 'pending' ? 'Pending' : 'Kadaluarsa'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                {customer.items.length === 0 && (
                                  <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-slate-500 text-sm">
                                      Belum ada barang terdaftar
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Search className="mb-2 h-8 w-8 text-slate-400" />
                      <p className="text-base font-medium text-slate-900">Data tidak ditemukan</p>
                      <p className="text-sm">Tidak ada customer yang sesuai dengan pencarian Anda.</p>
                    </div>
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
