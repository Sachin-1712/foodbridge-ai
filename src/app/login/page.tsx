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
  ShieldCheck,
  Globe,
  Zap,
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
  tagline: string;
}

  const roles: RoleCard[] = [
  {
    role: 'donor',
    title: 'Food Donor',
    desc: 'Restaurants, grocery stores, and farms with surplus food to share with the community.',
    tagline: 'Supply Node',
    icon: Heart,
    gradient: 'from-[#0f5238] to-[#1b4332]',
    iconBg: 'bg-emerald-100',
    accentColor: 'text-[#0f5238]',
  },
  {
    role: 'ngo',
    title: 'NGO / Food Bank',
    desc: 'Charities and community kitchens coordinating distribution to those facing food insecurity.',
    tagline: 'Distribution Hub',
    icon: Building2,
    gradient: 'from-[#464a30] to-[#5d6246]',
    iconBg: 'bg-stone-100',
    accentColor: 'text-[#464a30]',
  },
  {
    role: 'delivery',
    title: 'Delivery Partner',
    desc: 'Logistics providers and volunteers driving the mission by moving food from A to B.',
    tagline: 'Logistics Core',
    icon: Truck,
    gradient: 'from-[#7d562d] to-[#a06b3a]',
    iconBg: 'bg-orange-100',
    accentColor: 'text-[#7d562d]',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: Role) => {
    setLoading(true);
    try {
      let email = '';
      let password = 'demo123';
      if (role === 'donor') email = 'donor@foodbridge.demo';
      if (role === 'ngo') email = 'ngo@foodbridge.demo';
      if (role === 'delivery') email = 'delivery@foodbridge.demo';

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success('Login successful', {
          description: `Welcome to the ${role.toUpperCase()} dashboard.`,
        });
        router.push(`/dashboard/${role}`);
      } else {
        toast.error('Authentication failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfc] relative">
      {/* Header */}
      <header className="w-full px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-fb-primary" />
          <span className="font-[family-name:var(--font-heading)] text-2xl font-black tracking-tight text-fb-on-surface">
            Sharebite
          </span>
        </div>
        <Button variant="outline" className="rounded-full border-fb-outline-variant/30 text-fb-on-surface font-bold text-xs">
          Quick Demo
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Simple Background Gradients */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-emerald-50/20 to-transparent opacity-60" />
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center mb-16 relative z-10 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-black text-fb-on-surface tracking-tight mb-4">
            Share Extra Food Easily
          </h1>
          <p className="text-fb-on-surface-variant text-base sm:text-lg max-w-2xl font-medium opacity-70">
            Connect extra food with local NGOs and delivery partners. Choose your role to start the demo.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10 mb-16">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="group flex flex-col items-center p-10 rounded-[2rem] bg-white border border-stone-100 shadow-ambient-1 transition-all duration-500 hover:shadow-ambient-3 hover:-translate-y-1 text-center"
              >
                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center w-20 h-20 rounded-full mb-8 transition-transform duration-500 group-hover:scale-110',
                  r.iconBg
                )}>
                  <Icon className={cn('w-10 h-10', r.accentColor)} />
                </div>

                {/* Text */}
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-black text-fb-on-surface mb-4 tracking-tight">
                  {r.title}
                </h3>
                <p className="text-sm text-fb-on-surface-variant font-medium leading-relaxed opacity-70 mb-10 h-12 flex items-center justify-center px-4">
                  {r.desc}
                </p>

                {/* Action Button */}
                <Button
                  onClick={() => handleLogin(r.role)}
                  disabled={loading}
                  className={cn(
                    'w-full h-14 rounded-full font-bold text-xs uppercase tracking-widest transition-all',
                    r.role === 'donor' ? 'bg-[#0f5238] hover:bg-[#1b4332]' : 
                    r.role === 'ngo' ? 'bg-[#464a30] hover:bg-[#5d6246]' :
                    'bg-[#7d562d] hover:bg-[#a06b3a]'
                  )}
                >
                  Join as {r.role === 'delivery' ? 'Partner' : r.title.split(' ')[1] || r.title.split(' / ')[0]}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Secondary Link */}
        <div className="text-center relative z-10">
          <p className="text-sm font-medium text-fb-on-surface-variant opacity-70">
            Already part of the network? <button onClick={() => toast.info('Demo uses auto-login via cards above')} className="text-fb-primary font-bold hover:underline">Log in to your dashboard</button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-stone-50 relative z-10">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
          Sharebite 2024
        </p>
      </footer>
    </div>
  );
}
