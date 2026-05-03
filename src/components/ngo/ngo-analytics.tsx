'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Donation, AnalyticsSnapshot } from '@/types';
import {
  Package,
  Utensils,
  Timer,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Target,
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

  // Impact calculations
  const co2Saved = (stats.mealsRescued * 2.5).toFixed(1); // 2.5kg CO2 per meal (est)
  const waterSaved = (stats.mealsRescued * 150).toLocaleString(); // 150L per meal (est)

  const aiInsight = `Your organisation has rescued ${stats.mealsRescued} meals this period, with cooked meals being the most common category (${Math.round((categoryCount['Cooked Meals'] || 0) / Math.max(donations.length, 1) * 100)}% of total). Donation volume peaks mid-week, suggesting restaurants clear surplus after weekend prep. Consider increasing capacity on Wednesdays and Thursdays to capture more donations. Your average response time of ${stats.avgAcceptanceMinutes} minutes is excellent — maintaining this will improve your match scores.`;

  const chartTooltipStyle = {
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 12px 32px rgba(15, 82, 56, 0.12)',
    fontSize: '12px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    padding: '12px',
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-fb-primary/5 text-fb-primary border-fb-primary/20 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              Performance Insights
            </Badge>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-black text-fb-on-surface tracking-tight leading-tight">
            Analytics & <span className="text-fb-primary">Global Impact</span>
          </h1>
          <p className="text-fb-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Tracking food-sharing impact for <span className="font-bold text-fb-on-surface underline decoration-fb-primary/30 underline-offset-4">{ngoName}</span>.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 bg-fb-surface-container-low px-5 py-2.5 rounded-2xl border border-fb-outline-variant/10 shadow-ambient-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-fb-on-surface-variant tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-fb-primary" />
              LIVE DATA
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metrics & Volume (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* High-Fidelity KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <KPIStoreCard 
              title="Meals Rescued" 
              value={stats.mealsRescued.toLocaleString()} 
              trend="+12.5%" 
              trendUp={true} 
              icon={Utensils}
              description="Nourishment secured"
            />
            <KPIStoreCard 
              title="Donation Velocity" 
              value={stats.thisWeek.toString()} 
              trend="+4" 
              trendUp={true} 
              icon={TrendingUp}
              description="Successful matches"
            />
            <KPIStoreCard 
              title="Efficiency Score" 
              value={`${stats.avgAcceptanceMinutes}m`} 
              trend="-2m" 
              trendUp={true} 
              icon={Timer}
              description="Avg acceptance time"
            />
          </div>

          {/* Large Scale Volume Chart */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-[family-name:var(--font-heading)] font-black text-fb-on-surface tracking-tight">
                    Donation Trends
                  </CardTitle>
                  <CardDescription className="text-fb-on-surface-variant text-sm font-medium">
                    14-day donation overview
                  </CardDescription>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-fb-on-surface-variant tracking-wider uppercase">
                    <div className="w-3 h-3 rounded-full bg-fb-primary" />
                    Donations
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-fb-on-surface-variant tracking-wider uppercase">
                    <div className="w-3 h-3 rounded-full bg-fb-secondary" />
                    Meal Units
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-[350px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f5238" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="barSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7d562d" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a67c52" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#bfc9c1" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      fontSize={11} 
                      fontWeight={600}
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#707973" 
                      dy={15}
                    />
                    <YAxis 
                      fontSize={11} 
                      fontWeight={600}
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#707973" 
                    />
                    <Tooltip 
                      contentStyle={chartTooltipStyle}
                      cursor={{ fill: 'rgba(15, 82, 56, 0.04)', radius: 12 }}
                    />
                    <Bar dataKey="donations" fill="url(#barPrimary)" radius={[8, 8, 0, 0]} barSize={32} />
                    <Bar dataKey="meals" fill="url(#barSecondary)" radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Pie Chart */}
            <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-[family-name:var(--font-heading)] font-black text-fb-on-surface flex items-center gap-3">
                  <div className="p-2 bg-fb-primary/10 rounded-xl">
                    <PieChartIcon className="w-5 h-5 text-fb-primary" />
                  </div>
                  Impact Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="h-64 mt-4">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={105}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-sm text-fb-outline font-medium gap-2">
                      <BarChart3 className="w-8 h-8 opacity-20" />
                      No data footprint yet
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {categoryData.slice(0, 4).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-fb-surface-container-low rounded-2xl border border-fb-outline-variant/5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shadow-sm"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-fb-on-surface-variant truncate w-24">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-black text-fb-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Line Chart */}
            <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-[family-name:var(--font-heading)] font-black text-fb-on-surface flex items-center gap-3">
                  <div className="p-2 bg-fb-secondary/10 rounded-xl">
                    <Activity className="w-5 h-5 text-fb-secondary" />
                  </div>
                  Response Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={acceptanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#bfc9c1" strokeOpacity={0.2} />
                      <XAxis dataKey="date" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} stroke="#707973" dy={15} />
                      <YAxis fontSize={11} fontWeight={600} tickLine={false} axisLine={false} stroke="#707973" />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#7d562d"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#7d562d', strokeWidth: 0 }}
                        activeDot={{ r: 9, strokeWidth: 0, fill: '#0f5238' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 p-5 bg-gradient-to-r from-fb-primary/10 to-transparent rounded-2xl border border-fb-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-primary/60 mb-1">Weekly Delta</p>
                    <p className="text-sm font-black text-fb-on-surface">Efficiency optimized</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-black text-2xl flex items-center gap-1">
                      <TrendingDown className="w-5 h-5" />
                      -12%
                    </div>
                    <p className="text-[10px] font-bold text-fb-on-surface-variant uppercase">Shorter wait times</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: AI Specialist & Partners (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI Strategic Specialist Panel */}
          <Card className="border-none bg-[#0f5238] text-white shadow-ambient-3 rounded-[2.5rem] relative overflow-hidden group">
            {/* Background Textures */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-fb-secondary/10 rounded-full blur-2xl" />
            
            <CardHeader className="pb-6 pt-10 px-8 relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                  <Sparkles className="w-6 h-6 text-fb-primary-fixed" />
                </div>
                <div>
                  <Badge className="bg-white/10 text-white border-white/20 text-[10px] uppercase tracking-widest font-bold mb-1">
                    Donation Insights
                  </Badge>
                  <CardTitle className="text-2xl font-[family-name:var(--font-heading)] font-black tracking-tight">
                    AI Suggestion
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-10 relative">
              <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner">
                <p className="text-base text-white/90 leading-relaxed font-medium italic">
                  "{aiInsight}"
                </p>
              </div>

              <div className="space-y-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommended Actions
                </h4>
                <div className="grid gap-3">
                  <StrategicAction icon={Activity} text="Scale Wednesday volunteer routes" />
                  <StrategicAction icon={Leaf} text="Priority match for expiring dairy" />
                  <StrategicAction icon={TrendingUp} text="Review Friday morning acceptance" />
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">
                  Environmental Contribution
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <ImpactStat icon={Leaf} value={`${co2Saved}kg`} label="CO2 Offset" color="bg-emerald-500/20" iconColor="text-emerald-400" />
                  <ImpactStat icon={Activity} value={waterSaved} label="Water (L)" color="bg-blue-500/20" iconColor="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Excellence Panel */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-fb-outline">
                Top Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              {[
                { name: 'City Market Central', type: 'Supermarket', count: 12, color: 'bg-emerald-100 text-emerald-700', initials: 'CM' },
                { name: 'Artisan Bakery Co.', type: 'Bakery', count: 8, color: 'bg-amber-100 text-amber-700', initials: 'AB' },
                { name: 'Green Garden Bistro', type: 'Restaurant', count: 5, color: 'bg-fb-primary/10 text-fb-primary', initials: 'GG' },
              ].map((partner) => (
                <div key={partner.name} className="flex items-center justify-between group cursor-pointer hover:bg-fb-surface-container-low/50 p-2 -m-2 rounded-2xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105 ${partner.color}`}>
                      {partner.initials}
                    </div>
                    <div>
                      <p className="text-sm font-black text-fb-on-surface group-hover:text-fb-primary transition-colors">{partner.name}</p>
                      <p className="text-[10px] text-fb-outline font-bold uppercase tracking-wider mt-0.5">{partner.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-fb-on-surface">{partner.count}</p>
                    <p className="text-[9px] text-fb-outline font-black uppercase tracking-widest">Donations</p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full rounded-2xl border-fb-outline-variant/30 text-fb-on-surface-variant font-bold text-xs uppercase tracking-widest h-12 hover:bg-fb-surface-container-low transition-all">
                View All Partners
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPIStoreCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: any;
  description: string;
}) {
  return (
    <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 hover:shadow-ambient-3 transition-all duration-500 group overflow-hidden rounded-[2rem]">
      <CardContent className="p-0">
        <div className="p-6 relative">
          
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-fb-surface-container-low group-hover:bg-fb-primary/10 transition-colors shadow-sm">
              <Icon className="w-6 h-6 text-fb-primary" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-fb-error-container/20 text-fb-error'}`}>
              {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend}
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-outline">
              {title}
            </p>
            <p className="text-4xl font-black font-[family-name:var(--font-heading)] text-fb-on-surface tracking-tighter">
              {value}
            </p>
            <p className="text-[11px] font-bold text-fb-on-surface-variant/60 italic">
              {description}
            </p>
          </div>
        </div>
        <div className="h-2 w-full bg-fb-surface-container-low overflow-hidden">
          <div 
            className="h-full bg-fb-primary transition-all duration-1000 ease-out" 
            style={{ width: '70%', boxShadow: '0 0 12px rgba(15, 82, 56, 0.4)' }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StrategicAction({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-white/90">{text}</span>
      <ArrowUpRight className="w-4 h-4 ml-auto text-white/30 group-hover:text-white transition-colors" />
    </div>
  );
}

function ImpactStat({ icon: Icon, value, label, color, iconColor }: { icon: any, value: string, label: string, color: string, iconColor: string }) {
  return (
    <div className={`p-4 rounded-3xl ${color} border border-white/5 backdrop-blur-sm group hover:scale-[1.02] transition-transform`}>
      <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
        <Icon className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-xl font-black text-white tracking-tight group-hover:text-fb-primary-fixed transition-colors">{value}</p>
    </div>
  );
}


