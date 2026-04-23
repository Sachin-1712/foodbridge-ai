'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Heart,
  Building2,
  Truck,
  ArrowRight,
  Sparkles,
  Leaf,
} from 'lucide-react';

type Role = 'donor' | 'ngo' | 'delivery';

interface RoleCard {
  role: Role;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  accentColor: string;
}

const roles: RoleCard[] = [
  {
    role: 'donor',
    title: 'Food Donor',
    desc: 'Restaurants, caterers & businesses with surplus food to share',
    icon: Heart,
    gradient: 'from-[#2D6A4F] to-[#0f5238]',
    iconBg: 'bg-[#b1f0ce]',
    accentColor: 'text-[#2D6A4F]',
  },
  {
    role: 'ngo',
    title: 'NGO Partner',
    desc: 'Organisations collecting & distributing food to communities',
    icon: Building2,
    gradient: 'from-[#464a30] to-[#5d6246]',
    iconBg: 'bg-[#e1e6c2]',
    accentColor: 'text-[#464a30]',
  },
  {
    role: 'delivery',
    title: 'Delivery Partner',
    desc: 'Drivers & logistics teams ensuring timely food transport',
    icon: Truck,
    gradient: 'from-[#7d562d] to-[#a06b3a]',
    iconBg: 'bg-[#ffdcbd]',
    accentColor: 'text-[#7d562d]',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      let email = '';
      let password = 'demo123';
      if (selected === 'donor') email = 'donor@foodbridge.demo';
      if (selected === 'ngo') email = 'ngo@foodbridge.demo';
      if (selected === 'delivery') email = 'delivery@foodbridge.demo';

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success('Welcome to FoodBridge!');
        router.push(`/dashboard/${selected}`);
      } else {
        toast.error('Login failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fb-surface px-4 py-12 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#b1f0ce] opacity-[0.07] blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#ffca98] opacity-[0.06] blur-[100px]" />
      </div>

      {/* Logo & brand */}
      <div className="flex flex-col items-center mb-12 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#2D6A4F] shadow-fab">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-2xl font-extrabold tracking-tight text-fb-on-surface">
            FoodBridge
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-center text-fb-on-surface leading-tight">
          Reduce waste. Feed communities.
        </h1>
        <p className="text-fb-on-surface-variant text-base mt-3 text-center max-w-md">
          Select your role to get started with AI-powered food redistribution
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl relative z-10">
        {roles.map((r) => {
          const isSelected = selected === r.role;
          const Icon = r.icon;

          return (
            <button
              key={r.role}
              onClick={() => setSelected(r.role)}
              className={cn(
                'group relative flex flex-col items-center text-center p-7 rounded-2xl border-2 transition-all duration-300 cursor-pointer',
                'bg-fb-surface-container-lowest shadow-ambient-1',
                isSelected
                  ? 'border-[#2D6A4F] shadow-ambient-2 -translate-y-1'
                  : 'border-transparent hover:border-fb-outline-variant hover:shadow-ambient-2 hover:-translate-y-0.5'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'flex items-center justify-center w-16 h-16 rounded-2xl mb-5 transition-transform duration-300',
                r.iconBg,
                isSelected && 'scale-110'
              )}>
                <Icon className={cn('w-7 h-7', r.accentColor)} />
              </div>

              {/* Title */}
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-fb-on-surface mb-1.5">
                {r.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-fb-on-surface-variant leading-relaxed">
                {r.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 relative z-10 w-full max-w-sm">
        <Button
          onClick={handleLogin}
          disabled={!selected || loading}
          className={cn(
            'w-full h-13 rounded-full text-base font-semibold gap-2 transition-all duration-300',
            'bg-gradient-to-r from-[#2D6A4F] to-[#0f5238] text-white shadow-fab',
            'hover:shadow-lg hover:from-[#245a43] hover:to-[#0d4a30]',
            'disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in…
            </span>
          ) : (
            <>
              Continue as {selected ? roles.find(r => r.role === selected)?.title : '…'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
        <p className="text-xs text-fb-outline flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Demo mode — no credentials required
        </p>
      </div>
    </div>
  );
}
