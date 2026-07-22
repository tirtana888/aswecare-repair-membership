import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/components/ui'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AsWeCare - Repair Membership MVP',
  description: 'Layanan berlangganan perawatan dan perbaikan barang premium di Indonesia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#f6f8fb] text-slate-900 antialiased font-sans">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
              &copy; 2026 AsWeCare. Repair Membership Platform MVP v2.0
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  )
}
