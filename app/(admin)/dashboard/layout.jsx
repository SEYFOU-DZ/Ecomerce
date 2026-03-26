'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsHouseDoor,
  BsBoxSeam,
  BsGear,
  BsBoxArrowRight,
  BsList,
  BsX,
  BsCart3,
  BsArrowUpRightCircle,
  BsPersonBadge,
} from 'react-icons/bs';
import { useAuth } from '@/app/providers/AuthProvider';
import { LocaleProvider } from '@/app/providers/LocaleProvider';
import { useState } from 'react';
import LogoutConfirmModal from './LogoutConfirmModal';

const navItems = [
  { href: '/dashboard', icon: BsHouseDoor, label: 'Dashboard' },
  { href: '/dashboard/products', icon: BsBoxSeam, label: 'Products' },
  { href: '/dashboard/orders', icon: BsCart3, label: 'Orders' },
  { href: '/dashboard/settings', icon: BsGear, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center px-4 border-b border-slate-700/80 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 ring-1 ring-teal-500/30">
            <BsPersonBadge className="text-sm" />
          </div>
          <span className="text-sm font-semibold text-slate-100 tracking-tight">
            AdminPanel
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
              isActive(href)
                ? 'bg-teal-500/10 text-white border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/80'
            }`}
          >
            <Icon className="text-base flex-shrink-0 opacity-90" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700/80 flex-shrink-0">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
        >
          <BsBoxArrowRight className="text-base flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <LocaleProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-200/80 via-slate-100 to-teal-50/50 font-sans overflow-hidden">
        <LogoutConfirmModal
          open={logoutOpen}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false);
            logout();
          }}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <aside className="w-56 bg-slate-900 flex-col hidden md:flex h-full flex-shrink-0 border-r border-slate-800 shadow-sm">
          <SidebarContent />
        </aside>

        <aside
          className={`fixed top-0 left-0 h-full w-56 bg-slate-900 flex flex-col md:hidden z-30 transition-transform duration-200 ease-out border-r border-slate-800 shadow-xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <header className="h-12 bg-white/85 backdrop-blur-sm border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <BsX className="text-lg" /> : <BsList className="text-lg" />}
              </button>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                <span>Admin</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700 font-medium capitalize">
                  {pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-teal-50 rounded-md transition-colors border border-slate-200/90"
              >
                <BsArrowUpRightCircle className="text-sm text-teal-600" />
                Visit Store
              </Link>
              <div className="hidden sm:block w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-slate-700 leading-none">Admin</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Owner</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 border border-teal-200/80">
                  <BsPersonBadge className="text-xs" />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </LocaleProvider>
  );
}
