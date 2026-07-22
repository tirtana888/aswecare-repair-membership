'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Receipt, 
  Building2, 
  Store, 
  Menu, 
  X, 
  LogOut, 
  ChevronRight,
  UserCircle,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface PartnerShellProps {
  children: React.ReactNode;
  partnerName: string;
  userName: string;
  userRole: string;
}

export default function PartnerShell({
  children,
  partnerName,
  userName,
  userRole
}: PartnerShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/partner', icon: LayoutDashboard },
    { name: 'Daftar Customer', href: '/partner/customers', icon: Users },
    { name: 'Daftarkan Baru', href: '/partner/register', icon: UserPlus },
    { name: 'Riwayat Transaksi', href: '/partner/transactions', icon: Receipt },
    { name: 'Bagi Hasil & Komisi', href: '/partner/commissions', icon: Percent },
    { name: 'Profil Partner', href: '/partner/profile', icon: Building2 },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getBreadcrumb = () => {
    const currentNavItem = navigation.find(item => item.href === pathname);
    return currentNavItem ? currentNavItem.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white transition-all duration-300 ease-in-out lg:static lg:flex",
          isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72 lg:translate-x-0",
          isCollapsed && "lg:w-20"
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 shrink-0">
          <Link href="/partner" className={cn("flex items-center gap-3 overflow-hidden transition-all", isCollapsed && "lg:justify-center")}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap">AsWeCare Partner</span>}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-white/15 text-white font-medium" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors", 
                  isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                )} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 shrink-0">
          {!isCollapsed ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-white">{userName}</span>
                  <span className="text-xs text-blue-200 truncate capitalize">{userRole}</span>
                  <span className="text-[10px] text-blue-300 truncate bg-white/10 rounded px-1.5 py-0.5 mt-0.5 inline-block w-fit max-w-full">
                    {partnerName}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold" title={userName}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center text-sm">
              <span className="text-slate-500 hidden sm:inline-block">Partner Portal</span>
              <ChevronRight className="w-4 h-4 text-slate-400 mx-1 hidden sm:inline-block" />
              <span className="font-medium text-slate-900">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{partnerName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
