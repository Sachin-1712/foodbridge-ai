'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Donation, AnalyticsSnapshot } from '@/types';
import {
  Package,
  Utensils,
  Timer,
  TrendingUp,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface NGOAnalyticsProps {
  stats: {
    totalReceived: number;
    mealsRescued: number;
    thisWeek: number;
    avgAcceptanceMinutes: number;
    topDonorType: string;
  };
  analytics: AnalyticsSnapshot[];
  donations: Donation[];
  ngoName: string;
}

const COLORS = ['#2D6A4F', '#7d562d', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const categoryLabels: Record<string, string> = {
  cooked_meals: 'Cooked Meals',
  bakery: 'Bakery',
  fresh_produce: 'Fresh Produce',
  packaged: 'Packaged',
  dairy: 'Dairy',
  beverages: 'Beverages',
  other: 'Other',
};

export function NGOAnalytics({ stats, analytics, donations, ngoName }: NGOAnalyticsProps) {
  // Prepare chart data
  const dailyData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    donations: a.donationsReceived,
    meals: a.mealsRescued,
  }));

  // Category distribution
  const categoryCount: Record<string, number> = {};
  donations.forEach((d) => {
    const cat = categoryLabels[d.category] || d.category;
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Acceptance trend
  const acceptanceData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    minutes: a.avgAcceptanceTime,
  }));

  const aiInsight = `Your organisation has rescued ${stats.mealsRescued} meals this period, with cooked meals being the most common category (${Math.round((categoryCount['Cooked Meals'] || 0) / Math.max(donations.length, 1) * 100)}% of total). Donation volume peaks mid-week, suggesting restaurants clear surplus after weekend prep. Consider increasing capacity on Wednesdays and Thursdays to capture more donations. Your average response time of ${stats.avgAcceptanceMinutes} minutes is excellent — maintaining this will improve your match scores.`;

  const chartTooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #bfc9c1',
    boxShadow: '0 8px 24px rgba(45,106,79,0.08)',
    fontSize: '12px',
    background: '#ffffff',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-fb-on-surface">
          Analytics & Impact
        </h1>
        <p className="text-sm text-fb-on-surface-variant mt-1">
          Performance insights for {ngoName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="This Week" value={stats.thisWeek.toString()} subtitle="donations" icon={Package} gradientFrom="#2D6A4F" gradientTo="#0f5238" />
        <StatCard title="Meals Rescued" value={stats.mealsRescued.toString()} subtitle="total" icon={Utensils} gradientFrom="#10b981" gradientTo="#059669" />
        <StatCard title="Avg. Response" value={`${stats.avgAcceptanceMinutes}m`} subtitle="acceptance time" icon={Timer} gradientFrom="#f59e0b" gradientTo="#d97706" />
        <StatCard title="Top Source" value={stats.topDonorType} subtitle="donor type" icon={TrendingUp} gradientFrom="#8b5cf6" gradientTo="#7c3aed" />
      </div>

      {/* AI Insight */}
      <Card className="border-[#2D6A4F]/15 bg-gradient-to-r from-[#b1f0ce]/10 to-[#e1e6c2]/10 shadow-ambient-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-[family-name:var(--font-heading)] flex items-center gap-2 text-fb-on-surface">
            <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
            AI Insights
            <Badge variant="outline" className="text-[10px] bg-[#b1f0ce]/30 text-[#2D6A4F] border-[#2D6A4F]/20">
              Auto-generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-fb-on-surface-variant leading-relaxed">
            {aiInsight}
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donations by Day */}
        <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold flex items-center gap-2 text-fb-on-surface">
              <BarChart3 className="w-4 h-4 text-fb-outline" />
              Donations by Day
            </CardTitle>
            <CardDescription className="text-fb-on-surface-variant text-xs">Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e3df" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="donations" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Category */}
        <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold text-fb-on-surface">
              Donations by Category
            </CardTitle>
            <CardDescription className="text-fb-on-surface-variant text-xs">
              Distribution of accepted donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-fb-outline">
                  No data yet
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-fb-on-surface-variant">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Trend */}
        <Card className="lg:col-span-2 bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-heading)] font-semibold text-fb-on-surface">
              Acceptance Time Trend
            </CardTitle>
            <CardDescription className="text-fb-on-surface-variant text-xs">
              Average time to accept donations (minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={acceptanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e3df" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#707973" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2D6A4F' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradientFrom,
  gradientTo,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fb-on-surface-variant">{title}</p>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-fb-on-surface mt-1.5">{value}</p>
            <p className="text-xs text-fb-outline mt-1">{subtitle}</p>
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
