'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { Donation, AnalyticsSnapshot } from '@/types';
import {
  Package,
  Utensils,
  TrendingUp,
  PlusCircle,
  MapPin,
  Clock,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Leaf,
  ChevronRight,
  Heart,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DonorOverviewProps {
  stats: {
    totalDonations: number;
    mealsDoated: number;
    ngosHelped: number;
    impactScore: number;
    activeDonations: number;
  };
  recentDonations: Donation[];
  analytics?: AnalyticsSnapshot[];
  donorName: string;
}

const KPICard = ({ 
  label, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "bg-fb-primary" 
}: { 
  label: string; 
  value: string; 
  subtitle: string; 
  icon: any;
  color?: string;
}) => (
  <Card className="relative overflow-hidden border-fb-outline-variant/10 shadow-sm bg-white group hover:shadow-md transition-all duration-500 rounded-[2rem]">
    <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-[0.03] -mr-8 -mt-8 rounded-full", color)} />
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-fb-surface-container group-hover:scale-110 transition-transform duration-500", color.replace('bg-', 'text-'))}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-fb-primary/5 rounded-full border border-fb-primary/5">
          <div className="w-1 h-1 rounded-full bg-fb-primary" />
          <span className="text-[8px] font-black text-fb-primary uppercase tracking-widest">Live</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-fb-on-surface-variant uppercase tracking-widest leading-none">{label}</p>
        <p className="text-3xl font-black text-fb-on-surface mt-2 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-fb-on-surface-variant/40 mt-1 uppercase">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
);

export function DonorOverview({ stats, recentDonations, analytics = [], donorName }: DonorOverviewProps) {
  const router = useRouter();
  const firstName = donorName.split(' ')[0];

  const chartData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    donations: a.donationsReceived,
    meals: a.mealsRescued,
  }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-fb-primary rounded-full" />
            <h2 className="text-[11px] font-black text-fb-primary uppercase tracking-[0.2em]">Donor Dashboard</h2>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-black tracking-tight text-fb-on-surface">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-fb-on-surface-variant mt-1.5 font-medium max-w-md">
            Track your active donations and food-sharing impact.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-fb-on-surface-variant uppercase tracking-widest">Active Donor</span>
            <span className="text-xs font-black text-fb-on-surface mt-1">{donorName}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-fb-surface-container flex items-center justify-center border border-fb-outline-variant/10 shadow-inner overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${donorName}&backgroundColor=0f5238&textColor=ffffff`} alt={donorName} className="w-full h-full" />
          </div>
          <Separator orientation="vertical" className="h-10 mx-2 bg-fb-outline-variant/20" />
          <Button
            onClick={() => router.push('/dashboard/donor/new')}
            className="h-14 px-8 rounded-2xl bg-fb-primary text-white shadow-ambient-2 hover:shadow-ambient-3 hover:translate-y-[-2px] active:translate-y-0 transition-all font-black uppercase tracking-widest gap-3"
          >
            <PlusCircle className="w-5 h-5" />
            New Donation
          </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Active Donations" value={stats.activeDonations.toString()} subtitle="In Progress" icon={Clock} color="bg-blue-600" />
        <KPICard label="Meals Rescued" value={stats.mealsDoated.toLocaleString()} subtitle="Food Shared" icon={Utensils} color="bg-fb-primary" />
        <KPICard label="Impact Points" value={stats.impactScore.toLocaleString()} subtitle="Community Score" icon={Heart} color="bg-rose-500" />
        <KPICard label="Partnerships" value={stats.ngosHelped.toString()} subtitle="Local NGOs Supported" icon={TrendingUp} color="bg-amber-600" />
      </div>

      {/* Main Content Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="bg-white border-fb-outline-variant/10 shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-fb-outline-variant/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-fb-primary/10">
                  <BarChart3 className="w-5 h-5 text-fb-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-fb-on-surface uppercase tracking-tight">Donation Activity</h3>
                  <p className="text-[10px] font-bold text-fb-on-surface-variant uppercase tracking-widest opacity-60">Recent donation history</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-black border-fb-outline-variant/20 px-3 py-1 rounded-lg">LIVE DATA</Badge>
            </div>
            <div className="p-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f5238" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={10} 
                      fontWeight={700}
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#a0a0a0" 
                      dy={10}
                    />
                    <YAxis 
                      fontSize={10} 
                      fontWeight={700}
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#a0a0a0" 
                    />
                    <Tooltip
                      cursor={{ fill: '#f8f9f5' }}
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(15,82,56,0.1)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: '#ffffff',
                        padding: '12px 16px',
                      }}
                    />
                    <Bar dataKey="donations" fill="url(#chartGradient)" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* AI Suggestion (AI) */}
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#0f5238] p-8 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                  <Zap className="w-5 h-5 text-[#95d5b2]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">AI Suggestion</h3>
                  <p className="text-[10px] font-black text-[#95d5b2] uppercase tracking-[0.2em] opacity-60">Donation Insights</p>
                </div>
              </div>
              <p className="text-lg font-medium text-white/90 leading-relaxed tracking-tight italic">
                "Your donations are often matched faster when pickup windows are clear and notes include storage details."
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Confidence</p>
                    <p className="text-sm font-black text-[#95d5b2]">94.2%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Optimisation</p>
                    <p className="text-sm font-black text-[#95d5b2]">+12.5%</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                  Apply Strategy
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="flex-1 bg-white border-fb-outline-variant/10 shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-fb-outline-variant/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-fb-on-surface uppercase tracking-tight">Active Donations</h3>
                  <p className="text-[10px] font-bold text-fb-on-surface-variant uppercase tracking-widest opacity-60">Current donation status</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-fb-primary uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {recentDonations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20 border-2 border-dashed border-fb-outline-variant/30 rounded-[2rem]">
                  <Package className="w-12 h-12 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No Active Donations</p>
                  <p className="text-[10px] mt-2 font-medium">Create a new donation to begin.</p>
                </div>
              ) : (
                recentDonations.slice(0, 8).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 p-5 rounded-3xl bg-fb-surface-container-lowest border border-transparent hover:border-fb-outline-variant/10 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-fb-surface-container flex items-center justify-center text-fb-primary transition-transform group-hover:scale-110">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-fb-on-surface truncate group-hover:text-fb-primary transition-colors">{d.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-fb-on-surface-variant uppercase">{d.quantity} {d.unit}</span>
                        <Separator orientation="vertical" className="h-2.5 bg-fb-outline-variant/30" />
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-fb-on-surface-variant/60">
                          <MapPin className="w-3 h-3" />
                          {d.locationName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={d.status} className="h-5 text-[8px] font-black px-2 py-0 border-none" />
                      <ArrowRight className="w-4 h-4 text-fb-outline-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 bg-fb-surface-container-lowest border-t border-fb-outline-variant/5">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest">Platform Status: Ready</span>
                </div>
                <span className="text-[9px] font-black text-fb-on-surface-variant opacity-40 uppercase">FB-DN-2024</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
