'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StatusBadge, UrgencyBadge } from '@/components/shared/status-badge';
import { Donation } from '@/types';
import { toast } from 'sonner';
import {
  Package,
  Utensils,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  Timer,
  LeafyGreen,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface EnrichedDonation extends Donation {
  matchScore?: number;
  matchReason?: string;
}

interface NGODashboardProps {
  stats: {
    totalReceived: number;
    mealsRescued: number;
    thisWeek: number;
    avgAcceptanceMinutes: number;
    topDonorType: string;
  };
  openDonations: EnrichedDonation[];
  acceptedDonations: Donation[];
  ngoName: string;
}

const categoryLabels: Record<string, string> = {
  cooked_meals: 'Cooked Meals',
  bakery: 'Bakery',
  fresh_produce: 'Fresh Produce',
  packaged: 'Packaged',
  dairy: 'Dairy',
  beverages: 'Beverages',
  other: 'Other',
};

export function NGODashboard({ stats, openDonations, acceptedDonations, ngoName }: NGODashboardProps) {
  const router = useRouter();
  const [selectedDonation, setSelectedDonation] = useState<EnrichedDonation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredDonations = openDonations.filter((d) => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (urgencyFilter !== 'all' && d.urgency !== urgencyFilter) return false;
    return true;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const handleAccept = async (donationId: string) => {
    setLoading(donationId);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', donationId }),
      });

      if (res.ok) {
        toast.success('Donation accepted!', {
          description: 'A delivery job has been created automatically.',
        });
        setSelectedDonation(null);
        router.refresh();
      } else {
        toast.error('Failed to accept donation');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-fb-on-surface">
          {ngoName}
        </h1>
        <p className="text-sm text-fb-on-surface-variant mt-1">
          Review available donations and manage incoming food
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="This Week" value={stats.thisWeek.toString()} subtitle="donations received" icon={Package} gradientFrom="#2D6A4F" gradientTo="#0f5238" />
        <KPICard label="Meals Rescued" value={stats.mealsRescued.toString()} subtitle="total portions" icon={Utensils} gradientFrom="#10b981" gradientTo="#059669" />
        <KPICard label="Avg. Response" value={stats.avgAcceptanceMinutes.toString()} subtitle="minutes" icon={Timer} gradientFrom="#f59e0b" gradientTo="#d97706" />
        <KPICard label="Top Source" value={stats.topDonorType} subtitle="donor type" icon={Building2} gradientFrom="#8b5cf6" gradientTo="#7c3aed" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available">
        <TabsList className="bg-fb-surface-container">
          <TabsTrigger value="available" className="gap-2 data-[state=active]:bg-fb-surface-container-lowest data-[state=active]:text-[#2D6A4F] data-[state=active]:shadow-sm">
            <Package className="w-4 h-4" />
            Available ({filteredDonations.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2 data-[state=active]:bg-fb-surface-container-lowest data-[state=active]:text-[#2D6A4F] data-[state=active]:shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Accepted ({acceptedDonations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-fb-outline" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 bg-fb-surface-container-lowest border-fb-outline-variant/40 rounded-xl h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cooked_meals">Cooked Meals</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="fresh_produce">Fresh Produce</SelectItem>
                <SelectItem value="packaged">Packaged</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-40 bg-fb-surface-container-lowest border-fb-outline-variant/40 rounded-xl h-10">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Donations Feed */}
          {filteredDonations.length === 0 ? (
            <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-fb-outline-variant mx-auto mb-3" />
                <p className="text-fb-on-surface-variant text-sm">No available donations match your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredDonations.map((donation) => (
                <button
                  key={donation.id}
                  onClick={() => setSelectedDonation(donation)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-fb-surface-container-lowest border border-fb-outline-variant/20 hover:border-fb-outline-variant/40 hover:shadow-ambient-1 transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#b1f0ce]/30 text-[#2D6A4F] shrink-0">
                    {donation.isVegetarian ? (
                      <LeafyGreen className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Utensils className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-fb-on-surface">{donation.title}</p>
                      {donation.isVegetarian && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">VEG</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-fb-on-surface-variant">
                      <span>{donation.quantity} {donation.unit}</span>
                      <span>•</span>
                      <span>{categoryLabels[donation.category]}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {donation.locationName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {donation.matchScore && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-bold text-fb-on-surface">{donation.matchScore}</span>
                      </div>
                    )}
                    <UrgencyBadge urgency={donation.urgency} />
                    <ArrowUpRight className="w-4 h-4 text-fb-outline-variant group-hover:text-fb-on-surface-variant transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-4">
          {acceptedDonations.length === 0 ? (
            <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-fb-outline-variant mx-auto mb-3" />
                <p className="text-fb-on-surface-variant text-sm">No accepted donations yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {acceptedDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-fb-surface-container-lowest border border-fb-outline-variant/20"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fb-on-surface">{donation.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-fb-on-surface-variant">
                      <span>{donation.quantity} {donation.unit}</span>
                      <span>•</span>
                      <span>{categoryLabels[donation.category]}</span>
                    </div>
                  </div>
                  <StatusBadge status={donation.status} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Donation Detail Modal */}
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="max-w-lg bg-fb-surface-container-lowest border-fb-outline-variant/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-fb-on-surface">
              {selectedDonation?.title}
              {selectedDonation?.isVegetarian && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">VEG</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-fb-on-surface-variant">
              Review donation details and match information
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <UrgencyBadge urgency={selectedDonation.urgency} />
                <StatusBadge status={selectedDonation.status} />
              </div>

              {/* Match Score */}
              {selectedDonation.matchScore && (
                <div className="bg-gradient-to-r from-[#b1f0ce]/20 to-[#e1e6c2]/20 rounded-xl p-4 border border-[#2D6A4F]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                    <span className="text-sm font-semibold text-[#2D6A4F]">Match Score: {selectedDonation.matchScore}/100</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2D6A4F] mb-1">Why this NGO?</p>
                  <p className="text-xs text-fb-on-surface-variant leading-relaxed">
                    {selectedDonation.matchReason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-fb-outline text-xs">Category</p>
                  <p className="font-medium text-fb-on-surface">{categoryLabels[selectedDonation.category]}</p>
                </div>
                <div>
                  <p className="text-fb-outline text-xs">Quantity</p>
                  <p className="font-medium text-fb-on-surface">{selectedDonation.quantity} {selectedDonation.unit}</p>
                </div>
                <div>
                  <p className="text-fb-outline text-xs">Food Type</p>
                  <p className="font-medium text-fb-on-surface">{selectedDonation.foodType}</p>
                </div>
                <div>
                  <p className="text-fb-outline text-xs">Pickup Window</p>
                  <p className="font-medium text-fb-on-surface">
                    {new Date(selectedDonation.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(selectedDonation.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-fb-outline text-xs mb-1">Location</p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-fb-outline" />
                  <span className="font-medium text-fb-on-surface">{selectedDonation.locationName}</span>
                </div>
              </div>

              {selectedDonation.notes && (
                <div>
                  <p className="text-fb-outline text-xs mb-1">Notes</p>
                  <p className="text-sm bg-fb-surface-container-low rounded-xl p-3 text-fb-on-surface-variant">{selectedDonation.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-fb-on-surface-variant border-fb-outline-variant/40 rounded-xl h-11"
                  onClick={() => {
                    setSelectedDonation(null);
                    toast.info('Donation passed');
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Pass
                </Button>
                <Button
                  className="flex-1 gap-2 bg-[#2D6A4F] hover:bg-[#245a43] text-white rounded-xl h-11 shadow-ambient-2"
                  onClick={() => handleAccept(selectedDonation.id)}
                  disabled={loading === selectedDonation.id}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading === selectedDonation.id ? 'Accepting...' : 'Accept Donation'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===== KPI Card ===== */
function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradientFrom,
  gradientTo,
}: {
  label: string;
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fb-on-surface-variant">{label}</p>
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
