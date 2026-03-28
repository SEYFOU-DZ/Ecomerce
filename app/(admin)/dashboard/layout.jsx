'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsHouseDoor,
  BsBoxSeam,
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
      <div className="h-16 flex items-center px-5 border-b border-slate-700/50 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/30 to-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
            <BsPersonBadge className="text-base" />
          </div>
          <span className="text-base font-bold text-white tracking-wide">
            VARNOX
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 border-l-[3px] ${
              isActive(href)
                ? 'bg-primary/15 text-white border-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`text-lg flex-shrink-0 ${isActive(href) ? 'text-primary' : 'opacity-80'}`} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700/50 flex-shrink-0">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <BsBoxArrowRight className="text-lg flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <LocaleProvider>
      <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
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
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-20 md:hidden transition-all"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <aside className="w-60 bg-[#0B1120] flex-col hidden md:flex h-full flex-shrink-0 border-r border-slate-800/80 shadow-2xl relative z-10">
          <SidebarContent />
        </aside>

        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-[#0B1120] flex flex-col md:hidden z-30 transition-transform duration-300 ease-out border-r border-slate-800/80 shadow-2xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[url('/noise.png')] bg-repeat opacity-100">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-5 sm:px-8 flex-shrink-0 z-10 sticky top-0 supports-[backdrop-filter]:bg-white/60">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <BsX className="text-xl" /> : <BsList className="text-xl" />}
              </button>
              <div className="hidden md:flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                <span>Varnox Admin</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 font-semibold capitalize tracking-wide">
                  {pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Overview'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-all border border-slate-200 shadow-sm hover:shadow"
              >
                <BsArrowUpRightCircle className="text-sm text-primary" />
                Live Store
              </Link>
              <div className="hidden sm:block w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-800 leading-none group-hover:text-primary transition-colors">Admin</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-1">Superuser</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-200 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all shadow-sm">
                  <BsPersonBadge className="text-base" />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-5 sm:p-8 relative">
            {children}
          </div>
        </main>
      </div>
    </LocaleProvider>
  );
}
