'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { DeliveryJob, DeliveryStatus } from '@/types';
import { toast } from 'sonner';
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  Package,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Route,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryDashboardProps {
  jobs: DeliveryJob[];
  driverName: string;
}

const statusFlow: DeliveryStatus[] = ['assigned', 'accepted', 'picked_up', 'in_transit', 'delivered'];

const statusActions: Record<DeliveryStatus, { label: string; next: DeliveryStatus | null }> = {
  assigned: { label: 'Accept Job', next: 'accepted' },
  accepted: { label: 'Mark Picked Up', next: 'picked_up' },
  picked_up: { label: 'Start Transit', next: 'in_transit' },
  in_transit: { label: 'Mark Delivered', next: 'delivered' },
  delivered: { label: 'Completed', next: null },
};

const statusLabels: Record<DeliveryStatus, string> = {
  assigned: 'Assigned',
  accepted: 'Accepted',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

export function DeliveryDashboard({ jobs, driverName }: DeliveryDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const firstName = driverName.split(' ')[0];

  const activeJobs = jobs.filter((j) => j.status !== 'delivered');
  const completedJobs = jobs.filter((j) => j.status === 'delivered');

  const handleStatusUpdate = async (jobId: string, newStatus: DeliveryStatus) => {
    setLoading(jobId);
    try {
      const res = await fetch('/api/delivery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Status updated to "${statusLabels[newStatus]}"`, {
          description: newStatus === 'delivered' ? '🎉 Delivery completed!' : undefined,
        });
        router.refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const getGoogleMapsUrl = (pickup: string, drop: string) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&travelmode=driving`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-fb-on-surface">
          Hey, {firstName} 🚗
        </h1>
        <p className="text-sm text-fb-on-surface-variant mt-1">
          {activeJobs.length} active {activeJobs.length === 1 ? 'job' : 'jobs'} • {completedJobs.length} completed
        </p>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-fb-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Active Jobs
          </h2>
          {activeJobs.map((job) => {
            const action = statusActions[job.status];
            const currentIndex = statusFlow.indexOf(job.status);

            return (
              <Card key={job.id} className="overflow-hidden bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
                <CardContent className="p-0">
                  {/* Job Header */}
                  <div className="flex items-center justify-between p-4 bg-fb-surface-container-low/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #7d562d, #a06b3a)' }}
                      >
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-fb-on-surface">{job.donationTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-fb-on-surface-variant">
                          <Clock className="w-3 h-3" />
                          <span>ETA: {job.etaMinutes} min</span>
                          <span>•</span>
                          <span>{job.distanceKm} km</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={job.status} />
                      {job.priorityScore !== undefined && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wide" style={{ color: '#a06b3a' }}>
                          <span>PRIORITY</span>
                          <span className="bg-[#ffdcbd]/40 px-1.5 py-0.5 rounded-sm">{job.priorityScore}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-fb-outline-variant/20" />

                  {job.aiReasoning && (
                    <div className="px-4 py-2 bg-[#ffdcbd]/10 border-b border-fb-outline-variant/20 flex items-start gap-2">
                      <div className="mt-0.5 text-[#a06b3a] shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                      </div>
                      <p className="text-[11px] text-fb-on-surface-variant leading-tight">
                        <span className="font-semibold text-fb-on-surface">AI Route Insight:</span> {job.aiReasoning}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      {statusFlow.map((s, i) => {
                        const isComplete = i <= currentIndex;
                        const isCurrent = i === currentIndex;
                        return (
                          <div key={s} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                                  isComplete
                                    ? 'bg-[#2D6A4F] text-white'
                                    : 'bg-fb-surface-container text-fb-outline',
                                  isCurrent && 'ring-2 ring-[#b1f0ce] ring-offset-2'
                                )}
                              >
                                {isComplete ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              <span className={cn(
                                'text-[10px] mt-1 font-medium',
                                isComplete ? 'text-[#2D6A4F]' : 'text-fb-outline'
                              )}>
                                {statusLabels[s]}
                              </span>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div
                                className={cn(
                                  'w-8 h-0.5 mx-1 mt-[-14px]',
                                  i < currentIndex ? 'bg-[#2D6A4F]' : 'bg-fb-surface-container-high'
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-fb-outline-variant/20" />

                  {/* Route Info */}
                  <div className="p-4 space-y-3">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#b1f0ce]/30 text-[#2D6A4F] shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-fb-on-surface-variant uppercase tracking-wider">Pickup</p>
                        <p className="text-sm font-medium text-fb-on-surface">{job.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-4">
                      <ArrowRight className="w-4 h-4 text-fb-outline-variant" />
                    </div>

                    {/* Drop */}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ffdcbd]/40 text-[#7d562d] shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-fb-on-surface-variant uppercase tracking-wider">Drop-off</p>
                        <p className="text-sm font-medium text-fb-on-surface">{job.dropAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-fb-outline-variant/20" />

                  {/* Actions */}
                  <div className="flex items-center gap-3 p-4">
                    <a
                      href={getGoogleMapsUrl(job.pickupAddress, job.dropAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2 border-fb-outline-variant/40 rounded-xl h-11 text-fb-on-surface-variant text-xs sm:text-sm">
                        <Route className="w-4 h-4" />
                        AI-Assisted Route (Google Maps)
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    {action.next && (
                      <Button
                        className="flex-1 gap-2 rounded-xl h-11 text-white shadow-ambient-2"
                        style={{ background: 'linear-gradient(135deg, #7d562d, #a06b3a)' }}
                        onClick={() => handleStatusUpdate(job.id, action.next!)}
                        disabled={loading === job.id}
                      >
                        {loading === job.id ? 'Updating...' : action.label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state for active */}
      {activeJobs.length === 0 && (
        <Card className="bg-fb-surface-container-lowest border-fb-outline-variant/30 shadow-ambient-1">
          <CardContent className="py-12 text-center">
            <Truck className="w-12 h-12 text-fb-outline-variant mx-auto mb-3" />
            <p className="text-fb-on-surface-variant text-sm font-medium">No active jobs</p>
            <p className="text-fb-outline text-xs mt-1">New jobs will appear here when NGOs accept donations</p>
          </CardContent>
        </Card>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-fb-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            Completed ({completedJobs.length})
          </h2>
          {completedJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-fb-surface-container-lowest border border-fb-outline-variant/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#b1f0ce]/30 text-[#2D6A4F] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-fb-on-surface">{job.donationTitle}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-fb-on-surface-variant">
                  <span>{job.distanceKm} km</span>
                  <span>•</span>
                  <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge variant="outline" className="bg-[#b1f0ce]/30 text-[#2D6A4F] border-[#2D6A4F]/20 text-xs">
                Delivered ✓
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
