'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  LeafyGreen,
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

export function DonorOverview({ stats, recentDonations, analytics = [], donorName }: DonorOverviewProps) {
  const router = useRouter();
  const firstName = donorName.split(' ')[0];

  const chartData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    donations: a.donationsReceived,
    meals: a.mealsRescued,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-fb-on-surface">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-fb-on-surface-variant mt-1">
            Here's the impact you're making this month.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/donor/new')}
          className="gap-2 rounded-xl h-11 shadow-ambient-2 hover:shadow-ambient-3 transition-shadow"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #1b4b36)' }}
        >
          <PlusCircle className="w-4 h-4" />
          New Donation
        </Button>
      </div>

      {/* KPI Stats - Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Donations" value={stats.activeDonations.toString()} subtitle="awaiting pickup" icon={Clock} gradientFrom="#2D6A4F" gradientTo="#0f5238" />
        <KPICard label="Total Meals" value={stats.mealsDoated.toString()} subtitle="rescued to date" icon={Utensils} gradientFrom="#10b981" gradientTo="#059669" />
        <KPICard label="Impact Score" value={stats.impactScore.toString()} subtitle="points" icon={Package} gradientFrom="#f59e0b" gradientTo="#d97706" />
        <KPICard label="NGOs Helped" value={stats.ngosHelped.toString()} subtitle="all time" icon={TrendingUp} gradientFrom="#8b5cf6" gradientTo="#7c3aed" />
      </div>

      {/* Two-column layout: chart + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-3 bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold flex items-center gap-2 text-fb-on-surface">
              <BarChart3 className="w-4 h-4 text-fb-outline" />
              Donation Activity
            </CardTitle>
            <CardDescription className="text-fb-on-surface-variant text-xs">Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e3df" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #bfc9c1',
                      boxShadow: '0 8px 24px rgba(45,106,79,0.08)',
                      fontSize: '12px',
                      background: '#ffffff',
                    }}
                  />
                  <Bar dataKey="donations" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insight + Recent */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Insight Card */}
          <Card className="border-[#2D6A4F]/20 bg-gradient-to-br from-[#b1f0ce]/10 to-[#e1e6c2]/10 shadow-ambient-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                <span className="text-xs font-semibold text-[#2D6A4F] uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-sm text-fb-on-surface-variant leading-relaxed">
                Your donations peak mid-week. Consider scheduling pickups on Tuesdays & Wednesdays for
                faster NGO matching and reduced waste.
              </p>
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold text-fb-on-surface">
                Recent Donations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-fb-outline-variant mx-auto mb-2" />
                  <p className="text-sm text-fb-on-surface-variant">No donations yet</p>
                </div>
              ) : (
                recentDonations.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-fb-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#b1f0ce]/40 text-[#2D6A4F] shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fb-on-surface truncate">{d.title}</p>
                      <div className="flex items-center gap-2 text-xs text-fb-on-surface-variant mt-0.5">
                        <span>{d.quantity} {d.unit}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {d.locationName}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ===== KPI Card Component ===== */
function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradientFrom,
  gradientTo,
  trend,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientFrom: string;
  gradientTo: string;
  trend?: string;
}) {
  return (
    <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1 hover:shadow-ambient-2 transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fb-on-surface-variant">{label}</p>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-fb-on-surface mt-1.5">{value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-fb-outline">{subtitle}</span>
              {trend && (
                <span className="text-xs font-semibold text-[#2D6A4F] bg-[#b1f0ce]/30 px-1.5 py-0.5 rounded">
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shadow-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
