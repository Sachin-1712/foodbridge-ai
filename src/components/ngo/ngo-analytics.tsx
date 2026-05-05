'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { Donation, AnalyticsSnapshot, User } from '@/types';
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
  MapPin,
  Navigation,
  AlertTriangle,
  Info,
  RefreshCw,
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
  zoneDonations?: Donation[];
  donorProfiles?: User[];
  ngoName: string;
  ngoArea?: string;
  ngoLatitude?: number;
  ngoLongitude?: number;
  lastUpdated?: string;
}

const COLORS = ['#2D6A4F', '#7d562d', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
const partnerColors = [
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-fb-primary/10 text-fb-primary',
];

const categoryLabels: Record<string, string> = {
  cooked_meals: 'Cooked Meals',
  bakery: 'Bakery',
  fresh_produce: 'Fresh Produce',
  packaged: 'Packaged',
  dairy: 'Dairy',
  beverages: 'Beverages',
  other: 'Other',
};

type ImpactMixItem = {
  name: string;
  value: number;
  donations: number;
  percentage: number;
};

type PartnerSummary = {
  id: string;
  name: string;
  area: string;
  donationCount: number;
  totalQuantity: number;
  latestStatus: string;
  initials: string;
};

const bangaloreZones = [
  { name: 'Koramangala' },
  { name: 'Indiranagar' },
  { name: 'Jayanagar' },
  { name: 'Whitefield' },
  { name: 'HSR Layout' },
  { name: 'MG Road' },
  { name: 'Electronic City' },
  { name: 'JP Nagar' },
  { name: 'Malleshwaram' },
  { name: 'Marathahalli' },
  { name: 'Hebbal' },
];

type ZoneInsight = {
  area: string;
  donationCount: number;
  totalQuantity: number;
  commonFoodType: string;
  activeCount: number;
  completedCount: number;
  urgencyLevel: 'High' | 'Medium' | 'Low';
  predictionScore: number;
  predictionLevel: 'High' | 'Medium' | 'Low';
  predictedPeakWindow: string;
  recommendation: string;
};

type HighNeedZone = {
  area: string;
  needScore: number;
  suggestedFoodType: string;
  nearestNgo: string;
  estimatedMealRequirement: number;
  distanceKm: number;
  recommendation: string;
};

const activeStatuses = ['open', 'accepted', 'pickup_assigned', 'picked_up', 'in_transit'];

const highNeedCommunityIndicators = [
  { area: 'Ejipura', mealGap: 180, suggestedFoodType: 'Cooked Meals', nearestNgo: 'Bengaluru Food Relief Trust', distanceKm: 6.2, ngoCapacityNearby: 86, logisticsFeasibility: 82, priority: 96 },
  { area: 'KR Market / City Market', mealGap: 160, suggestedFoodType: 'Cooked Meals', nearestNgo: 'Bengaluru Food Relief Trust', distanceKm: 5.8, ngoCapacityNearby: 82, logisticsFeasibility: 78, priority: 92 },
  { area: 'Shivajinagar', mealGap: 145, suggestedFoodType: 'Packaged Food', nearestNgo: 'Hope Shelter Network', distanceKm: 8.4, ngoCapacityNearby: 74, logisticsFeasibility: 70, priority: 88 },
  { area: 'Cottonpet', mealGap: 135, suggestedFoodType: 'Cooked Meals', nearestNgo: 'Annadaan Bengaluru', distanceKm: 7.1, ngoCapacityNearby: 78, logisticsFeasibility: 76, priority: 84 },
  { area: 'Yeshwanthpur', mealGap: 125, suggestedFoodType: 'Breakfast Packs', nearestNgo: 'Hope Shelter Network', distanceKm: 8.7, ngoCapacityNearby: 68, logisticsFeasibility: 72, priority: 78 },
  { area: 'Hebbal Kempapura', mealGap: 118, suggestedFoodType: 'Cooked Meals', nearestNgo: 'Hope Shelter Network', distanceKm: 3.4, ngoCapacityNearby: 72, logisticsFeasibility: 88, priority: 81 },
  { area: 'Bommanahalli', mealGap: 140, suggestedFoodType: 'Packaged Food', nearestNgo: 'Helping Hands Bangalore', distanceKm: 5.2, ngoCapacityNearby: 76, logisticsFeasibility: 80, priority: 83 },
  { area: 'Peenya', mealGap: 132, suggestedFoodType: 'Fresh Produce', nearestNgo: 'Bengaluru Food Relief Trust', distanceKm: 11.2, ngoCapacityNearby: 62, logisticsFeasibility: 60, priority: 80 },
  { area: 'DJ Halli', mealGap: 150, suggestedFoodType: 'Cooked Meals', nearestNgo: 'Hope Shelter Network', distanceKm: 7.8, ngoCapacityNearby: 70, logisticsFeasibility: 74, priority: 90 },
];

const detectZone = (donation: Donation) => {
  const haystack = `${donation.locationName || ''} ${donation.title || ''} ${donation.notes || ''}`.toLowerCase();
  return bangaloreZones.find((zone) => haystack.includes(zone.name.toLowerCase()))?.name;
};

const isRecent = (donation: Donation, referenceTime: number) => referenceTime - new Date(donation.createdAt).getTime() < 7 * 86400000;

const getWindowLabel = (donation: Donation) => {
  const hour = new Date(donation.pickupStart || donation.preparedAt || donation.createdAt).getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Evening';
};

const mostCommon = (items: string[], fallback: string) => {
  if (items.length === 0) return fallback;
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
};

const topCount = (items: string[]) => {
  if (items.length === 0) return 0;
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  return Object.values(counts).sort((a, b) => b - a)[0] || 0;
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  matched: 'Matched',
  accepted: 'Accepted',
  pickup_assigned: 'Pickup Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const getInitials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'DN';

const getImpactCategory = (donation: Donation) => {
  const haystack = `${donation.title} ${donation.foodType} ${donation.notes} ${donation.locationName}`.toLowerCase();

  if (haystack.includes('event') || haystack.includes('cater') || haystack.includes('corporate') || haystack.includes('office') || haystack.includes('training')) {
    return 'Event Leftovers';
  }

  if (donation.category === 'bakery') return 'Bakery';
  if (donation.category === 'beverages') return 'Beverages';
  if (donation.category === 'fresh_produce') return 'Fresh Produce';

  return 'Cooked Meals';
};

function buildImpactMix(donations: Donation[]): ImpactMixItem[] {
  const preferredOrder = ['Cooked Meals', 'Bakery', 'Beverages', 'Fresh Produce', 'Event Leftovers'];
  const totals = preferredOrder.reduce<Record<string, { value: number; donations: number }>>((acc, name) => {
    acc[name] = { value: 0, donations: 0 };
    return acc;
  }, {});

  donations.forEach((donation) => {
    const category = getImpactCategory(donation);
    totals[category].value += donation.quantity;
    totals[category].donations += 1;
  });

  const totalUnits = Object.values(totals).reduce((sum, item) => sum + item.value, 0);

  return preferredOrder.map((name) => ({
    name,
    value: totals[name].value,
    donations: totals[name].donations,
    percentage: totalUnits > 0 ? Math.round((totals[name].value / totalUnits) * 100) : 0,
  }));
}

function buildPartnerSummaries(donations: Donation[], donors: User[]): PartnerSummary[] {
  const donorById = new Map(donors.map((donor) => [donor.id, donor]));
  const grouped = donations.reduce<Record<string, Donation[]>>((acc, donation) => {
    acc[donation.donorId] = acc[donation.donorId] || [];
    acc[donation.donorId].push(donation);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([donorId, donorDonations]) => {
      const donor = donorById.get(donorId);
      const sorted = [...donorDonations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const name = donor?.organizationName || donor?.name || sorted[0]?.locationName?.split(',')[0] || 'Bangalore Donor';

      return {
        id: donorId,
        name,
        area: donor?.area || detectZone(sorted[0]) || 'Bangalore',
        donationCount: donorDonations.length,
        totalQuantity: donorDonations.reduce((sum, donation) => sum + donation.quantity, 0),
        latestStatus: statusLabels[sorted[0]?.status || 'open'] || sorted[0]?.status || 'Open',
        initials: getInitials(name),
      };
    })
    .sort((a, b) => {
      if (b.donationCount !== a.donationCount) return b.donationCount - a.donationCount;
      return b.totalQuantity - a.totalQuantity;
    });
}

function buildZoneInsights(donations: Donation[], referenceTime: number): ZoneInsight[] {
  const rawZones = bangaloreZones
    .map((zone) => {
      const zoneDonations = donations.filter((donation) => detectZone(donation) === zone.name);
      const active = zoneDonations.filter((donation) => activeStatuses.includes(donation.status));
      const urgentActive = active.filter((donation) => donation.urgency === 'high');
      const completed = zoneDonations.filter((donation) => donation.status === 'delivered');
      const foodTypes = zoneDonations.map((donation) => donation.foodType || categoryLabels[donation.category] || donation.category);
      const windowLabels = zoneDonations.map(getWindowLabel);
      const commonFoodType = mostCommon(
        foodTypes,
        'Mixed food'
      );
      const predictedPeakWindow = mostCommon(windowLabels, 'Afternoon');
      const urgencyLevel: ZoneInsight['urgencyLevel'] = urgentActive.length > 0 ? 'High' : active.length > 0 ? 'Medium' : 'Low';
      let recommendation = `Plan ${predictedPeakWindow.toLowerCase()} pickup capacity for ${commonFoodType}.`;

      if (urgentActive.length > 0) {
        recommendation = `Prioritize this zone now: ${urgentActive.length} urgent donation${urgentActive.length > 1 ? 's' : ''} need attention.`;
      } else if (active.length > 0) {
        recommendation = `Keep NGO and delivery partners ready for active ${commonFoodType} pickups.`;
      } else if (completed.length > 0) {
        recommendation = `Watch this area for repeat donations around ${predictedPeakWindow.toLowerCase()}.`;
      }

      return {
        area: zone.name,
        donationCount: zoneDonations.length,
        totalQuantity: zoneDonations.reduce((sum, donation) => sum + donation.quantity, 0),
        recentCount: zoneDonations.filter((donation) => isRecent(donation, referenceTime)).length,
        commonFoodType,
        activeCount: active.length,
        completedCount: completed.length,
        urgentCount: urgentActive.length,
        commonFoodPattern: zoneDonations.length > 0 ? topCount(foodTypes) / zoneDonations.length : 0,
        peakConsistency: zoneDonations.length > 0 ? topCount(windowLabels) / zoneDonations.length : 0,
        urgencyLevel,
        predictedPeakWindow,
        recommendation,
      };
    })
    .filter((zone) => zone.donationCount > 0);

  const maxRecentCount = Math.max(...rawZones.map((zone) => zone.recentCount), 1);
  const maxQuantity = Math.max(...rawZones.map((zone) => zone.totalQuantity), 1);
  const maxActiveCount = Math.max(...rawZones.map((zone) => zone.activeCount), 1);
  const maxUrgentCount = Math.max(...rawZones.map((zone) => zone.urgentCount), 1);

  return rawZones
    .map((zone) => {
      const predictionScore = Math.round(
        (zone.recentCount / maxRecentCount) * 25 +
        (zone.totalQuantity / maxQuantity) * 25 +
        (zone.activeCount / maxActiveCount) * 20 +
        (zone.urgentCount / maxUrgentCount) * 15 +
        zone.peakConsistency * 10 +
        zone.commonFoodPattern * 5
      );
      const predictionLevel: ZoneInsight['predictionLevel'] = predictionScore >= 75 ? 'High' : predictionScore >= 45 ? 'Medium' : 'Low';

      return {
        area: zone.area,
        donationCount: zone.donationCount,
        totalQuantity: zone.totalQuantity,
        commonFoodType: zone.commonFoodType,
        activeCount: zone.activeCount,
        completedCount: zone.completedCount,
        urgencyLevel: zone.urgencyLevel,
        predictionScore,
        predictionLevel,
        predictedPeakWindow: zone.predictedPeakWindow,
        recommendation: zone.recommendation,
      };
    })
    .sort((a, b) => {
      if (b.predictionScore !== a.predictionScore) return b.predictionScore - a.predictionScore;
      if (b.donationCount !== a.donationCount) return b.donationCount - a.donationCount;
      return b.activeCount - a.activeCount;
    });
}

function buildHighNeedZones(donations: Donation[]): HighNeedZone[] {
  const openActiveQuantity = donations
    .filter((donation) => activeStatuses.includes(donation.status))
    .reduce((sum, donation) => sum + donation.quantity, 0);

  const maxMealGap = Math.max(...highNeedCommunityIndicators.map((zone) => zone.mealGap), 1);
  const availabilityPressure = Math.max(0, 100 - Math.min(100, (openActiveQuantity / 420) * 100));

  return highNeedCommunityIndicators
    .map((zone) => {
      const mealGapScore = (zone.mealGap / maxMealGap) * 100;
      const needScore = Math.round(
        mealGapScore * 0.35 +
        availabilityPressure * 0.25 +
        zone.ngoCapacityNearby * 0.15 +
        zone.logisticsFeasibility * 0.15 +
        zone.priority * 0.10
      );

      return {
        area: zone.area,
        needScore,
        suggestedFoodType: zone.suggestedFoodType,
        nearestNgo: zone.nearestNgo,
        estimatedMealRequirement: zone.mealGap,
        distanceKm: zone.distanceKm,
        recommendation: `${zone.area} is suitable for ${zone.suggestedFoodType.toLowerCase()} because need is high and ${zone.nearestNgo} is within a practical delivery range.`,
      };
    })
    .sort((a, b) => b.needScore - a.needScore);
}

const formatUpdatedAt = (value?: string) => {
  if (!value) return 'Just now';
  return `${new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })} IST`;
};

export function NGOAnalytics({
  stats,
  analytics,
  donations,
  zoneDonations = donations,
  donorProfiles = [],
  ngoName,
  ngoArea,
  ngoLatitude,
  ngoLongitude,
  lastUpdated,
}: NGOAnalyticsProps) {
  const router = useRouter();
  const [zoneView, setZoneView] = useState<'source' | 'need'>('source');
  const [partnersOpen, setPartnersOpen] = useState(false);
  // Prepare chart data
  const dailyData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    donations: a.donationsReceived,
    meals: a.mealsRescued,
  }));

  const categoryData = buildImpactMix(zoneDonations);
  const partnerSummaries = buildPartnerSummaries(zoneDonations, donorProfiles);
  const topPartners = partnerSummaries.slice(0, 4);

  // Acceptance trend
  const acceptanceData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    minutes: a.avgAcceptanceTime,
  }));

  const deliveredMeals = zoneDonations
    .filter((donation) => donation.status === 'delivered')
    .reduce((sum, donation) => sum + donation.quantity, 0);
  const completedMealUnits = deliveredMeals || stats.mealsRescued;
  // Demo estimates: one rescued meal avoids about 2.5kg CO2e and 150L water footprint.
  const co2Saved = (completedMealUnits * 2.5).toFixed(1);
  const waterSaved = (completedMealUnits * 150).toLocaleString();

  const zoneReferenceTime = new Date(lastUpdated || zoneDonations[0]?.createdAt || Date.now()).getTime();
  const zoneInsights = buildZoneInsights(zoneDonations, zoneReferenceTime);
  const highNeedZones = buildHighNeedZones(zoneDonations);
  const topZone = zoneInsights[0];
  const urgentZone = zoneInsights.find((zone) => zone.urgencyLevel === 'High' && zone.activeCount > 0);
  const nextPickupZone = zoneInsights.find((zone) => zone.activeCount > 0) || topZone;
  const bestNeedZone = highNeedZones[0];
  const largeOpenDonation = zoneDonations
    .filter((donation) => activeStatuses.includes(donation.status))
    .sort((a, b) => b.quantity - a.quantity)[0];
  const topZoneInsight = topZone
    ? `${topZone.area} has ${topZone.predictionLevel.toLowerCase()} source activity with a ${topZone.predictionScore}/100 score. Quantity now influences the score, so large meal donations can move a zone upward after refresh.`
    : 'No Bangalore donation rows are available yet. Zone predictions will appear after donors create donations.';
  const highNeedRecommendation = bestNeedZone
    ? largeOpenDonation
      ? `${largeOpenDonation.title} from ${detectZone(largeOpenDonation) || largeOpenDonation.locationName} can be routed to ${bestNeedZone.area} because it has the highest need score and is within delivery range.`
      : `Best area to prioritise next: ${bestNeedZone.area} - high meal requirement, close to ${bestNeedZone.nearestNgo}, and suitable for ${bestNeedZone.suggestedFoodType.toLowerCase()} donations.`
    : 'High-need community recommendations will appear after need indicators are available.';

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

          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge className="mb-3 bg-fb-primary/10 text-fb-primary border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    Rule-Based Prediction
                  </Badge>
                  <CardTitle className="text-2xl font-[family-name:var(--font-heading)] font-black text-fb-on-surface tracking-tight">
                    Donation Zones & Predictions
                  </CardTitle>
                  <CardDescription className="text-fb-on-surface-variant text-sm font-medium">
                    AI-assisted prediction based on recent donation patterns.
                  </CardDescription>
                  <p className="mt-2 max-w-xl text-xs font-semibold leading-relaxed text-fb-on-surface-variant/70">
                    Source zones are calculated from live donation records using pickup area, quantity, urgency, status, and pickup time.
                  </p>
                </div>
                <div className="min-h-[116px] max-w-md rounded-3xl bg-[#0f5238] p-5 text-white shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#95d5b2]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95d5b2]">Top Insight</span>
                  </div>
                  <TypewriterText text={topZoneInsight} className="text-sm font-semibold leading-relaxed" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 lg:px-8 lg:pb-8">
              <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                <div className="rounded-[1.5rem] border border-fb-outline-variant/10 bg-white p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <DataSourcePill label="Data source" value="Live Supabase donations table" />
                    <DataSourcePill label="Uses" value="Pickup area, quantity, urgency, status, pickup time" />
                    <DataSourcePill label="Last updated" value={formatUpdatedAt(lastUpdated)} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.refresh()}
                  className="h-full min-h-16 rounded-[1.5rem] border-fb-outline-variant/20 px-5 text-[10px] font-black uppercase tracking-widest"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh zone data
                </Button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-[1.5rem] bg-fb-surface-container-low p-1.5">
                <button
                  type="button"
                  onClick={() => setZoneView('source')}
                  className={`rounded-[1.15rem] px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${zoneView === 'source' ? 'bg-white text-fb-primary shadow-sm' : 'text-fb-on-surface-variant'}`}
                >
                  Donation Source Zones
                </button>
                <button
                  type="button"
                  onClick={() => setZoneView('need')}
                  className={`rounded-[1.15rem] px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${zoneView === 'need' ? 'bg-white text-fb-primary shadow-sm' : 'text-fb-on-surface-variant'}`}
                >
                  High-Need Community Zones
                </button>
              </div>

              {zoneView === 'need' ? (
                <HighNeedZonesPanel
                  zones={highNeedZones}
                  recommendation={highNeedRecommendation}
                  ngoName={ngoName}
                  ngoArea={ngoArea}
                  ngoLatitude={ngoLatitude}
                  ngoLongitude={ngoLongitude}
                />
              ) : (
                <>
              {zoneInsights.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-fb-outline-variant/20 bg-white/50 text-center">
                  <MapPin className="mb-4 h-10 w-10 text-fb-outline opacity-40" />
                  <p className="text-sm font-black uppercase tracking-widest text-fb-on-surface">No Zone Data Yet</p>
                  <p className="mt-2 max-w-md text-xs font-medium text-fb-on-surface-variant">
                    Create donations with Bangalore pickup addresses to generate zone predictions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_390px]">
                  <div className="grid gap-4">
                  <div className="relative h-[330px] overflow-hidden rounded-[2rem] border border-fb-outline-variant/10 bg-[#e8eee7] shadow-inner">
                    <iframe
                      title="Bangalore donation zones map"
                      src="https://maps.google.com/maps?q=Bangalore%2C%20Karnataka%2C%20India&z=11&output=embed"
                      className="absolute inset-0 h-full w-full grayscale-[0.15] contrast-[1.08] opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#f8f9f5]/80 pointer-events-none" />

                    <div className="absolute left-5 top-5 right-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-ambient-1 backdrop-blur">
                        <p className="text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant">Bangalore Zone Map</p>
                        <p className="mt-1 text-xs font-bold text-fb-primary">City context for the ranked zone list</p>
                      </div>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Bangalore%2C%20Karnataka%2C%20India"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-white/90 px-4 text-[10px] font-black uppercase tracking-widest text-fb-primary shadow-ambient-1 backdrop-blur hover:bg-white"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Open in Google Maps
                      </a>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <MiniPrediction label="Highest Score" value={topZone ? `${topZone.area} - ${topZone.predictionScore}` : 'Waiting'} />
                      <MiniPrediction label="Needs Attention" value={urgentZone?.area || 'No urgent zone'} />
                      <MiniPrediction label="Next Pickup" value={nextPickupZone?.area || 'Waiting'} />
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-fb-primary/10 bg-fb-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-fb-primary">
                      <Info className="h-4 w-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">How prediction works</p>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-fb-on-surface-variant">
                      These suggestions are based on recent Bangalore donation patterns, not a trained ML model. Scores use recent donation count (25%), total quantity/meals (25%), active/open donations (20%), urgent donations (15%), pickup-time consistency (10%), and common food pattern (5%).
                    </p>
                  </div>
                  </div>

                  <div className="rounded-[2rem] border border-fb-outline-variant/10 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-on-surface-variant">Zone Queue</p>
                        <p className="mt-1 text-xs font-bold text-fb-on-surface">Ranked by 0-100 prediction score</p>
                      </div>
                      <Badge className="border-none bg-fb-primary/10 text-[10px] font-black text-fb-primary">
                        {zoneInsights.length} zones
                      </Badge>
                    </div>

                    <div className="h-[402px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                      {zoneInsights.map((zone) => (
                        <ZoneInsightCard key={zone.area} zone={zone} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </CardContent>
          </Card>

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

        </div>

        {/* Right Column: Useful NGO Dashboard Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Partner Excellence Panel */}
          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-fb-outline">
                Top Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              {topPartners.map((partner, index) => (
                <div key={partner.name} className="flex items-center justify-between group cursor-pointer hover:bg-fb-surface-container-low/50 p-2 -m-2 rounded-2xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105 ${partnerColors[index % partnerColors.length]}`}>
                      {partner.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-fb-on-surface group-hover:text-fb-primary transition-colors">{partner.name}</p>
                      <p className="text-[10px] text-fb-outline font-bold uppercase tracking-wider mt-0.5">{partner.area}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-fb-on-surface">{partner.donationCount}</p>
                    <p className="text-[9px] text-fb-outline font-black uppercase tracking-widest">Donations</p>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setPartnersOpen(true)}
                className="w-full rounded-2xl border-fb-outline-variant/30 text-fb-on-surface-variant font-bold text-xs uppercase tracking-widest h-12 hover:bg-fb-surface-container-low transition-all"
              >
                View All Partners
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
            <CardHeader className="px-8 pt-8 pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-fb-outline flex items-center gap-3">
                <PieChartIcon className="w-4 h-4 text-fb-primary" />
                Impact Mix
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-40">
                {categoryData.some((item) => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`compact-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-medium text-fb-outline">
                    <BarChart3 className="w-8 h-8 opacity-20" />
                    No data footprint yet
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-fb-surface-container-low p-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full shadow-sm"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate text-xs font-bold text-fb-on-surface-variant">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-fb-on-surface">{item.value} <span className="text-[9px] text-fb-outline">({item.percentage}%)</span></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/20 shadow-ambient-1 rounded-[2.5rem]">
            <CardHeader className="px-8 pt-8 pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-fb-outline flex items-center gap-3">
                <Activity className="w-4 h-4 text-fb-secondary" />
                Response Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={acceptanceData} margin={{ top: 16, right: 10, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#bfc9c1" strokeOpacity={0.2} />
                    <XAxis dataKey="date" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} stroke="#707973" dy={10} />
                    <YAxis fontSize={10} fontWeight={600} tickLine={false} axisLine={false} stroke="#707973" />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#7d562d"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#7d562d', strokeWidth: 0 }}
                      activeDot={{ r: 7, strokeWidth: 0, fill: '#0f5238' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-fb-primary/10 bg-fb-primary/5 p-4">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-fb-primary/60">Weekly Delta</p>
                  <p className="text-sm font-black text-fb-on-surface">Efficiency optimized</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xl font-black text-emerald-600">
                    <TrendingDown className="w-4 h-4" />
                    -12%
                  </div>
                  <p className="text-[9px] font-bold uppercase text-fb-on-surface-variant">Shorter waits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-[#0f5238] text-white shadow-ambient-2 rounded-[2rem]">
            <CardHeader className="px-5 pt-5 pb-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95d5b2]">
                Estimated Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <CompactImpactStat icon={Leaf} value={`${co2Saved}kg`} label="Est. CO2 Offset" />
              <CompactImpactStat icon={Activity} value={waterSaved} label="Est. Water (L)" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={partnersOpen} onOpenChange={setPartnersOpen}>
        <SheetContent className="w-full overflow-y-auto border-fb-outline-variant/20 bg-white p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-fb-outline-variant/10 p-6">
            <SheetTitle className="text-2xl font-black tracking-tight text-fb-on-surface">
              All Donor Partners
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-fb-on-surface-variant">
              Ranked from current Bangalore donation rows by donation count, then meal units.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 p-6">
            {partnerSummaries.map((partner, index) => (
              <PartnerRow key={partner.id} partner={partner} rank={index + 1} />
            ))}
          </div>
        </SheetContent>
      </Sheet>
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

function MiniPrediction({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/95 p-3 shadow-ambient-1 backdrop-blur">
      <p className="text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant/60">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-fb-on-surface">{value}</p>
    </div>
  );
}

function DataSourcePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant/50">{label}</p>
      <p className="mt-1 break-words text-xs font-black text-fb-on-surface">{value}</p>
    </div>
  );
}

function HighNeedZonesPanel({
  zones,
  recommendation,
  ngoName,
  ngoArea,
  ngoLatitude,
  ngoLongitude,
}: {
  zones: HighNeedZone[];
  recommendation: string;
  ngoName: string;
  ngoArea?: string;
  ngoLatitude?: number;
  ngoLongitude?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-4">
        <div className="rounded-[2rem] border border-fb-primary/10 bg-[#0f5238] p-6 text-white shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#95d5b2]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95d5b2]">Suitable Zone Recommendation</p>
          </div>
          <p className="text-sm font-semibold leading-relaxed">{recommendation}</p>
        </div>

        <div className="rounded-[1.5rem] border border-fb-outline-variant/10 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-fb-primary">
            <Info className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">How high-need prediction works</p>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-fb-on-surface-variant">
            High-need zone prediction is demo-level and based on seeded community need indicators plus current donation availability. Scores use estimated meal gap (35%), recent donation shortage (25%), NGO capacity nearby (15%), distance/logistics feasibility (15%), and community priority (10%).
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-fb-outline-variant/10 bg-fb-surface-container-lowest p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-on-surface-variant/50">Demo NGO Location</p>
          <p className="mt-1 text-sm font-black text-fb-on-surface">{ngoName}</p>
          <p className="mt-1 text-xs font-semibold text-fb-on-surface-variant">{ngoArea || 'JP Nagar, Bangalore'}</p>
          {ngoLatitude && ngoLongitude && (
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-fb-on-surface-variant/50">
              {ngoLatitude.toFixed(4)}, {ngoLongitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-fb-outline-variant/10 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-on-surface-variant">High-Need Queue</p>
            <p className="mt-1 text-xs font-bold text-fb-on-surface">Ranked by demo need score</p>
          </div>
          <Badge className="border-none bg-fb-primary/10 text-[10px] font-black text-fb-primary">
            {zones.length} zones
          </Badge>
        </div>
        <div className="h-[402px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {zones.map((zone) => (
            <HighNeedZoneCard key={zone.area} zone={zone} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HighNeedZoneCard({ zone }: { zone: HighNeedZone }) {
  return (
    <div className="rounded-[1.35rem] border border-fb-outline-variant/10 bg-fb-surface-container-lowest p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-base font-black tracking-tight text-fb-on-surface">{zone.area}</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-fb-on-surface-variant/50">
            {zone.estimatedMealRequirement} meal requirement
          </p>
        </div>
        <Badge className="shrink-0 border-none bg-amber-100 text-[8px] font-black uppercase tracking-widest text-amber-700">
          {zone.needScore}/100
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CompactZoneMetric icon={Utensils} label="Food" value={zone.suggestedFoodType} />
        <CompactZoneMetric icon={MapPin} label="Distance" value={`${zone.distanceKm} km`} />
        <CompactZoneMetric icon={Activity} label="NGO" value={zone.nearestNgo} />
        <CompactZoneMetric icon={Package} label="Need" value={`${zone.estimatedMealRequirement} meals`} />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-fb-primary" />
          <span className="text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant">Recommendation</span>
        </div>
        <p className="line-clamp-3 text-[11px] font-semibold leading-relaxed text-fb-on-surface-variant">{zone.recommendation}</p>
      </div>
    </div>
  );
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let index = 0;
    setDisplayText('');
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <p className={`relative ${className || ''}`} aria-live="polite">
      <span aria-hidden="true" className="invisible block">{text}</span>
      <span className="absolute inset-0 block">
        {displayText}
        {displayText.length < text.length && (
          <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-[#95d5b2]" />
        )}
      </span>
    </p>
  );
}

function ZoneInsightCard({ zone }: { zone: ZoneInsight }) {
  const levelClasses = zone.predictionLevel === 'High'
    ? 'bg-emerald-100 text-emerald-700'
    : zone.predictionLevel === 'Medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-fb-surface-container text-fb-on-surface-variant';

  return (
    <div className="rounded-[1.35rem] border border-fb-outline-variant/10 bg-fb-surface-container-lowest p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black tracking-tight text-fb-on-surface">{zone.area}</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-fb-on-surface-variant/50">
            {zone.donationCount} donations / {zone.totalQuantity} meals
          </p>
        </div>
        <Badge className={`shrink-0 border-none text-[8px] font-black uppercase tracking-widest ${levelClasses}`}>
          {zone.predictionLevel}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant/60">
            Predicted Activity
          </span>
          <span className="text-xs font-black text-fb-on-surface">{zone.predictionScore}/100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-fb-surface-container">
          <div
            className={`h-full rounded-full ${zone.predictionLevel === 'High' ? 'bg-emerald-600' : zone.predictionLevel === 'Medium' ? 'bg-amber-500' : 'bg-fb-outline'}`}
            style={{ width: `${zone.predictionScore}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-bold text-fb-on-surface-variant">
          {zone.predictionLevel} predicted activity
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CompactZoneMetric icon={Utensils} label="Common" value={zone.commonFoodType} />
        <CompactZoneMetric icon={Activity} label="Active" value={zone.activeCount.toString()} />
        <CompactZoneMetric icon={Timer} label="Peak" value={zone.predictedPeakWindow} />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-3">
        <div className="mb-1.5 flex items-center gap-2">
          {zone.urgencyLevel === 'High' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <Navigation className="h-4 w-4 text-fb-primary" />}
          <span className="text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant">Recommendation</span>
        </div>
        <p className="line-clamp-2 text-[11px] font-semibold leading-relaxed text-fb-on-surface-variant">{zone.recommendation}</p>
      </div>
    </div>
  );
}

function CompactZoneMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-2.5">
      <div className="mb-1.5 flex items-center gap-1 text-fb-on-surface-variant/50">
        <Icon className="h-3 w-3" />
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="truncate text-[11px] font-black text-fb-on-surface">{value}</p>
    </div>
  );
}

function CompactImpactStat({ icon: Icon, value, label }: { icon: any, value: string, label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#95d5b2]">
        <Icon className="h-4 w-4" />
        <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function PartnerRow({ partner, rank }: { partner: PartnerSummary; rank: number }) {
  return (
    <div className="rounded-[1.5rem] border border-fb-outline-variant/10 bg-fb-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fb-primary/10 text-sm font-black text-fb-primary">
            {partner.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-none bg-fb-surface-container text-[8px] font-black uppercase tracking-widest text-fb-on-surface-variant">
                #{rank}
              </Badge>
              <p className="break-words text-sm font-black text-fb-on-surface">{partner.name}</p>
            </div>
            <p className="mt-1 text-xs font-semibold text-fb-on-surface-variant">{partner.area}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-fb-outline">
              Latest status: {partner.latestStatus}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-fb-on-surface">{partner.donationCount}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-fb-outline">Donations</p>
          <p className="mt-2 text-sm font-black text-fb-primary">{partner.totalQuantity}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-fb-outline">Meal units</p>
        </div>
      </div>
    </div>
  );
}
