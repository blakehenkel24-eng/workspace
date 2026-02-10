'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  CheckSquare, 
  Clock, 
  Activity,
  Plus,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/cron', label: 'Cron Jobs', icon: Clock },
  { href: '/activity', label: 'Activity', icon: Activity },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-nav-container')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#141414] border-b border-[#27272A] z-50 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#4F46E5] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">Agent Studio</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] text-[#A1A1AA] min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-nav-container fixed top-16 left-0 right-0 bottom-0 bg-[#141414] z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-4">
          <Link
            href="/agents/new"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors mb-6 min-h-[48px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus className="w-5 h-5" />
            New Agent
          </Link>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-[#6E56CF]/10 text-[#6E56CF]'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#27272A]">
            <div className="text-sm text-[#A1A1AA]">
              <p>v2.0.0</p>
              <p className="mt-1">SQLite + Next.js</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-[#141414] border-r border-[#27272A] flex-col hidden lg:flex z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E56CF] to-[#4F46E5] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Agent Studio</span>
          </div>
        </div>

        <div className="flex-1 px-4">
          <Link
            href="/agents/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#6E56CF] hover:bg-[#5D45BE] text-white rounded-lg font-medium transition-colors mb-6"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </Link>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6E56CF]/10 text-[#6E56CF]'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#27272A]">
          <div className="text-xs text-[#A1A1AA]">
            <p>v2.0.0</p>
            <p className="mt-1">SQLite + Next.js</p>
          </div>
        </div>
      </nav>
    </>
  );
}
