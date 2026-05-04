'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Heart,
  Building2,
  Truck,
  ArrowRight,
  Leaf,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

type Role = 'donor' | 'ngo' | 'delivery';

interface RoleCard {
  role: Role;
  title: string;
  verifiedLabel: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  accentColor: string;
  buttonColor: string;
  demoEmail: string;
}

const roles: RoleCard[] = [
  {
    role: 'donor',
    title: 'Donor',
    verifiedLabel: 'Verified Donor',
    desc: 'Restaurants, kitchens, and caterers sharing extra food.',
    icon: Heart,
    iconBg: 'bg-emerald-100',
    accentColor: 'text-[#0f5238]',
    buttonColor: 'bg-[#0f5238] hover:bg-[#1b4332]',
    demoEmail: 'donor@sharebite.demo',
  },
  {
    role: 'ngo',
    title: 'NGO',
    verifiedLabel: 'Verified NGO',
    desc: 'Food relief teams accepting and distributing donations.',
    icon: Building2,
    iconBg: 'bg-stone-100',
    accentColor: 'text-[#464a30]',
    buttonColor: 'bg-[#464a30] hover:bg-[#5d6246]',
    demoEmail: 'ngo@sharebite.demo',
  },
  {
    role: 'delivery',
    title: 'Delivery Partner',
    verifiedLabel: 'Verified Delivery Partner',
    desc: 'Drivers and volunteers moving food from donor to NGO.',
    icon: Truck,
    iconBg: 'bg-orange-100',
    accentColor: 'text-[#7d562d]',
    buttonColor: 'bg-[#7d562d] hover:bg-[#a06b3a]',
    demoEmail: 'delivery@sharebite.demo',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = roles.find((role) => role.role === selectedRole) || roles[0];
  const SelectedIcon = selected.icon;

  const useDemoCredentials = () => {
    setEmail(selected.demoEmail);
    setPassword('demo123');
    setError('');
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          selectedRole,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(`${selected.verifiedLabel}`, {
          description: `Welcome to the ${selected.title} dashboard.`,
          icon: <ShieldCheck className="w-4 h-4 text-fb-primary" />,
        });
        router.push(`/dashboard/${data.user.role}`);
      } else {
        const message = data?.error || 'Authentication failed';
        setError(message);
        toast.error(message);
      }
    } catch {
      setError('Connection error. Please try again.');
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfc] relative">
      <header className="w-full px-6 sm:px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f5238]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-[family-name:var(--font-heading)] text-2xl font-black tracking-tight text-fb-on-surface">
            Sharebite
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-fb-outline-variant/20 bg-white px-4 py-2">
          <ShieldCheck className="h-4 w-4 text-fb-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant">
            Role-verified demo login
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/50 blur-3xl" />
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          <section className="flex flex-col justify-center">
            <div className="mb-8">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-fb-primary">
                Share Extra Food Easily
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-black text-fb-on-surface tracking-tight leading-tight">
                Sign in with your verified demo role
              </h1>
              <p className="mt-4 max-w-2xl text-base text-fb-on-surface-variant font-medium leading-relaxed">
                Select the role you want to use, then enter the matching demo account. Sharebite checks the selected role against the Supabase profile before opening the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const active = selectedRole === role.role;
                return (
                  <button
                    key={role.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.role);
                      setError('');
                    }}
                    className={cn(
                      'group rounded-[2rem] border bg-white p-5 text-left shadow-ambient-1 transition-all hover:-translate-y-0.5 hover:shadow-ambient-2',
                      active ? 'border-fb-primary/30 ring-2 ring-fb-primary/10' : 'border-stone-100'
                    )}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105', role.iconBg)}>
                        <Icon className={cn('h-6 w-6', role.accentColor)} />
                      </div>
                      {active && <CheckCircle2 className="h-5 w-5 text-fb-primary" />}
                    </div>
                    <h2 className="font-[family-name:var(--font-heading)] text-lg font-black text-fb-on-surface">
                      {role.title}
                    </h2>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-fb-on-surface-variant">
                      {role.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-stone-100 bg-white p-6 shadow-ambient-2 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-on-surface-variant/50">
                  Selected Role
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-black text-fb-on-surface">
                  {selected.verifiedLabel}
                </h2>
              </div>
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', selected.iconBg)}>
                <SelectedIcon className={cn('h-7 w-7', selected.accentColor)} />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant/60">
                  Demo Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder={selected.demoEmail}
                  className="h-12 rounded-2xl bg-fb-surface-container-low px-4 font-bold"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant/60">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="demo123"
                  className="h-12 rounded-2xl bg-fb-surface-container-low px-4 font-bold"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-fb-surface-container-low p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant/50">
                  Demo credentials
                </p>
                <p className="mt-1 break-words text-sm font-black text-fb-on-surface">{selected.demoEmail}</p>
                <p className="text-xs font-bold text-fb-on-surface-variant">Password: demo123</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={useDemoCredentials}
                  className="mt-3 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Fill demo credentials
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className={cn('h-14 w-full rounded-2xl text-xs font-black uppercase tracking-widest text-white', selected.buttonColor)}
              >
                {loading ? 'Verifying role...' : `Log in as ${selected.title}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </section>
        </div>
      </main>

      <footer className="w-full py-8 text-center border-t border-stone-50 relative z-10">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
          Sharebite 2026
        </p>
      </footer>
    </div>
  );
}
