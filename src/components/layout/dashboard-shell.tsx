'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChatPanel } from '@/components/shared/chat-panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Leaf,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  BarChart3,
  Truck,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface UserSession {
  role: 'donor' | 'ngo' | 'delivery';
  name: string;
  org?: string;
}

const roleNavItems: Record<string, { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  donor: [
    { label: 'Dashboard', href: '/dashboard/donor', icon: LayoutDashboard },
    { label: 'New Donation', href: '/dashboard/donor/new', icon: PlusCircle },
  ],
  ngo: [
    { label: 'Marketplace', href: '/dashboard/ngo', icon: ShoppingBag },
    { label: 'Analytics', href: '/dashboard/ngo/analytics', icon: BarChart3 },
  ],
  delivery: [
    { label: 'Logistics', href: '/dashboard/delivery', icon: Truck },
  ],
};

export function DashboardShell({ children, user }: { children: React.ReactNode; user: UserSession }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = roleNavItems[user.role] || [];

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  const roleBadge = {
    donor: { label: 'Donor', bg: 'bg-[#b1f0ce]', text: 'text-[#002114]' },
    ngo: { label: 'NGO', bg: 'bg-[#e1e6c2]', text: 'text-[#464a30]' },
    delivery: { label: 'Driver', bg: 'bg-[#ffdcbd]', text: 'text-[#7d562d]' },
  }[user.role];

  return (
    <div className="flex h-screen bg-fb-surface overflow-hidden">
      {/* =================== SIDEBAR (Desktop) =================== */}
      <aside className="hidden md:flex flex-col w-64 bg-fb-surface-container-lowest border-r border-fb-outline-variant/30 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-fb-outline-variant/20">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2D6A4F]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-fb-on-surface">
            Sharebite
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold'
                    : 'text-fb-on-surface-variant hover:bg-fb-surface-container-low hover:text-fb-on-surface'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-[#2D6A4F]' : 'text-fb-outline')} />
                {item.label}
              </button>
            );
          })}

          {/* AI Chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              chatOpen
                ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold'
                : 'text-fb-on-surface-variant hover:bg-fb-surface-container-low hover:text-fb-on-surface'
            )}
          >
            <Sparkles className={cn('w-5 h-5', chatOpen ? 'text-[#2D6A4F]' : 'text-fb-outline')} />
            Sharebite AI
          </button>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-fb-surface-container-low">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2D6A4F] text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-fb-on-surface truncate">{user.name}</p>
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', roleBadge.bg, roleBadge.text)}>
                {roleBadge.label}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-fb-on-surface-variant hover:text-fb-error text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* =================== MOBILE TOP BAR =================== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-fb-surface-container-lowest/90 backdrop-blur-md border-b border-fb-outline-variant/20 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2D6A4F]">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-base font-bold text-fb-on-surface">
            Sharebite
          </span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-fb-surface-container">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-20 bg-fb-surface-container-lowest/95 backdrop-blur-sm">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all',
                    isActive
                      ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold'
                      : 'text-fb-on-surface-variant'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => { setChatOpen(true); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-fb-on-surface-variant"
            >
              <Sparkles className="w-5 h-5" />
              Sharebite AI
            </button>
            <div className="pt-4 border-t border-fb-outline-variant/20">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-fb-error">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* =================== MAIN CONTENT =================== */}
      <main className="flex-1 md:ml-64 overflow-y-auto pt-14 md:pt-0">
        <div className="p-5 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      {/* =================== AI FAB & CHAT PANEL =================== */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#2D6A4F] text-white shadow-fab flex items-center justify-center hover:scale-105 transition-transform md:bottom-8 md:right-8"
          aria-label="Open Sharebite AI"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-fb-surface-container-lowest border-l border-fb-outline-variant/30 shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
          chatOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ChatPanel onClose={() => setChatOpen(false)} userRole={user.role} />
      </div>

      {/* =================== MOBILE BOTTOM NAV =================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-fb-surface-container-lowest/90 backdrop-blur-md border-t border-fb-outline-variant/20 flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all',
                isActive ? 'text-[#2D6A4F]' : 'text-fb-outline'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setChatOpen(true)}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all',
            chatOpen ? 'text-[#2D6A4F]' : 'text-fb-outline'
          )}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">AI</span>
        </button>
      </nav>
    </div>
  );
}
