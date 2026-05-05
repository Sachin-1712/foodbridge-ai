'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Sparkles,
  Utensils,
  Zap,
  Info,
  Map as MapIcon,
  ChevronRight,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryDashboardProps {
  jobs: DeliveryJob[];
  driverName: string;
}

const statusFlow: DeliveryStatus[] = ['assigned', 'accepted', 'picked_up', 'in_transit', 'delivered'];
const terminalStatuses: DeliveryStatus[] = ['delivered', 'cancelled'];
const statusOptions: DeliveryStatus[] = [...statusFlow, 'cancelled'];

const statusLabels: Record<DeliveryStatus, string> = {
  assigned: 'Assigned',
  accepted: 'Accepted',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// --- Sub-components ---

const IntelligencePanel = ({ job }: { job: DeliveryJob }) => {
  if (!job.aiReasoning) return null;

  return (
    <div className="relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f5238] to-[#1b4332] opacity-[0.98] rounded-[2rem]" />
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative p-6 z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <Zap className="w-4 h-4 text-[#95d5b2] fill-[#95d5b2]/20" />
          </div>
          <span className="text-[10px] font-black text-[#95d5b2] uppercase tracking-[0.2em]">Route Suggestion</span>
        </div>
        
        <p className="text-sm font-medium text-white leading-relaxed tracking-tight">
          "{job.aiReasoning}"
        </p>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Confidence</span>
              <span className="text-xs font-black text-[#95d5b2] mt-1">98.4%</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Priority</span>
              <span className="text-xs font-black text-[#95d5b2] mt-1">{job.priorityScore || 92}/100</span>
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1b4332] bg-fb-primary-fixed/20 backdrop-blur-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MapViewport = ({ job }: { job: DeliveryJob | null }) => {
  const onOpenMaps = () => {
    if (!job) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(job.pickupAddress)}&destination=${encodeURIComponent(job.dropAddress)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative h-full w-full bg-[#f8f9f5] rounded-[2.5rem] border border-fb-outline-variant/10 overflow-hidden shadow-inner flex flex-col">
      {job ? (
        <>
          {/* Header Stats Strip */}
          <div className="absolute top-6 left-6 right-6 z-20">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-ambient-2 rounded-3xl p-1.5 flex items-center justify-between">
              <div className="flex items-center gap-6 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-fb-primary/10 rounded-xl">
                    <Timer className="w-4 h-4 text-fb-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest leading-none">Arrival</p>
                    <p className="text-sm font-black text-fb-on-surface mt-1">{job.etaMinutes} MIN</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-fb-outline-variant/10" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Route className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest leading-none">Distance</p>
                    <p className="text-sm font-black text-fb-on-surface mt-1">{job.distanceKm} KM</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-2xl bg-fb-surface-container hover:bg-fb-surface-container-high text-fb-on-surface font-bold text-[10px] uppercase tracking-widest"
                onClick={onOpenMaps}
              >
                <Navigation className="w-3.5 h-3.5 mr-2" />
                Directions
              </Button>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="flex-1 relative">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(job.pickupAddress)}&output=embed`}
              allowFullScreen
              className="grayscale-[0.2] contrast-[1.1] opacity-90"
            ></iframe>
            
            {/* Overlay for aesthetic blending */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-[#f8f9f5] rounded-[2.5rem]" />
          </div>

          {/* Location Details Strip */}
          <div className="p-8 bg-white border-t border-fb-outline-variant/10 grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <div className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-fb-primary" />
                Pickup
              </div>
              <p className="text-xs font-bold text-fb-on-surface leading-tight line-clamp-2">{job.pickupAddress}</p>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7d562d]" />
                Drop-off
              </div>
              <p className="text-xs font-bold text-fb-on-surface leading-tight line-clamp-2">{job.dropAddress}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 bg-fb-surface-container rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner rotate-12 transition-transform hover:rotate-0 duration-700">
            <MapIcon className="w-10 h-10 text-fb-outline-variant -rotate-12" />
          </div>
          <h3 className="text-xl font-black text-fb-on-surface tracking-tight">No Job Selected</h3>
          <p className="text-sm text-fb-on-surface-variant mt-2 max-w-xs leading-relaxed">
            Select a delivery job to view route details.
          </p>
        </div>
      )}
    </div>
  );
};

export function DeliveryDashboard({ jobs, driverName }: DeliveryDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const activeJobs = useMemo(() => jobs.filter((j) => !terminalStatuses.includes(j.status)), [jobs]);
  const completedJobsCount = useMemo(() => jobs.filter((j) => terminalStatuses.includes(j.status)).length, [jobs]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    activeJobs.length > 0 ? activeJobs[0].id : null
  );

  const selectedJob = activeJobs.find(j => j.id === selectedJobId) || (activeJobs.length > 0 ? activeJobs[0] : null);

  const handleStatusUpdate = async (jobId: string, newStatus: DeliveryStatus) => {
    const currentJob = jobs.find((job) => job.id === jobId);
    if (currentJob?.status === newStatus) return;

    setLoading(jobId);
    try {
      const res = await fetch('/api/delivery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status: newStatus }),
      });

      if (res.ok) {
        toast.success('Status updated', {
          description: newStatus === 'delivered' ? '🎉 Delivery successfully logged.' : undefined,
          icon: <CheckCircle2 className="w-4 h-4 text-fb-primary" />,
        });
        if (terminalStatuses.includes(newStatus) && selectedJobId === jobId) {
          const nextActiveJob = activeJobs.find((job) => job.id !== jobId);
          setSelectedJobId(nextActiveJob?.id ?? null);
        }
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Sync failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(null);
    }
  };

  const getGoogleMapsUrl = (pickup: string, drop: string) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&travelmode=driving`;
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-black tracking-tight text-fb-on-surface">
            Delivery Dashboard
          </h1>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-fb-primary/10 rounded-full border border-fb-primary/10">
              <div className="w-1.5 h-1.5 rounded-full bg-fb-primary animate-pulse" />
              <span className="text-[10px] font-black text-fb-primary uppercase tracking-widest">Driver Active</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-fb-outline-variant/30" />
            <p className="text-xs font-medium text-fb-on-surface-variant">
              Delivery tracking • <span className="font-bold text-fb-on-surface">{completedJobsCount}</span> Deliveries Completed Today
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 group cursor-pointer bg-white p-1 pr-5 rounded-full border border-fb-outline-variant/20 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full bg-fb-surface-container flex items-center justify-center text-fb-primary font-black shadow-inner overflow-hidden border border-fb-outline-variant/10">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${driverName}&backgroundColor=0f5238&textColor=ffffff`} alt={driverName} className="w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-fb-on-surface-variant uppercase tracking-widest leading-none">Delivery Partner</span>
            <span className="text-xs font-black text-fb-on-surface mt-1">{driverName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Delivery Jobs */}
        <div className="lg:col-span-3 lg:sticky lg:top-8 flex flex-col gap-4 h-fit">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black text-fb-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" />
              Delivery Jobs ({activeJobs.length})
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-black text-fb-primary">
              <Zap className="w-3 h-3 fill-current" />
              PRIORITIZED
            </div>
          </div>
          
          <div className="flex flex-col gap-3 pr-1">
            {activeJobs.length > 0 ? (
              activeJobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                const isHighPriority = (job.priorityScore || 0) > 80;
                
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={cn(
                      "group relative cursor-pointer p-4 rounded-[1.5rem] border transition-all duration-500",
                      isSelected
                        ? "bg-white border-fb-primary/20 shadow-ambient-2 ring-1 ring-fb-primary/5"
                        : "bg-fb-surface-container-lowest border-transparent hover:bg-white hover:border-fb-outline-variant/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} className="h-4.5 text-[8px] font-black px-2 py-0 border-none" />
                        {isHighPriority && (
                          <div className="w-2 h-2 rounded-full bg-fb-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.4)]" />
                        )}
                      </div>
                      <span className="text-[9px] font-black text-fb-on-surface-variant opacity-40 uppercase tracking-widest">
                        {job.id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className={cn(
                      "text-[13px] font-black leading-[1.2] transition-colors line-clamp-2 pr-4",
                      isSelected ? "text-fb-on-surface" : "text-fb-on-surface/70 group-hover:text-fb-on-surface"
                    )}>
                      {job.donationTitle}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-fb-on-surface-variant">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        {job.etaMinutes}m
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-fb-on-surface-variant">
                        <Navigation className="w-3.5 h-3.5 opacity-40" />
                        {job.distanceKm}km
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute -left-1 top-6 bottom-6 w-1.5 bg-fb-primary rounded-full shadow-[2px_0_10px_rgba(15,82,56,0.3)]" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20 border-2 border-dashed border-fb-outline-variant/30 rounded-[2rem]">
                <Truck className="w-10 h-10 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Queue Empty</p>
                <p className="text-[10px] mt-2 font-medium">Standing by for next mission...</p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Visual Console */}
        <div className="lg:col-span-6 lg:sticky lg:top-8 flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[500px]">
          <MapViewport 
            job={selectedJob} 
          />
        </div>

        {/* RIGHT COLUMN: Intelligence & Mission Control */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-fit min-w-0">
          {selectedJob ? (
            <>
              {/* Job ID Card */}
              <div className="p-6 rounded-[2rem] bg-white border border-fb-outline-variant/10 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-fb-primary/5 rounded-full blur-2xl group-hover:bg-fb-primary/10 transition-all duration-700" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-fb-primary" />
                    <span className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest leading-none">Donation</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono font-black text-fb-primary border-fb-primary/20 bg-fb-primary/5 rounded-lg h-5">
                    FB-{selectedJob.id.slice(-6).toUpperCase()}
                  </Badge>
                </div>
                <h2 className="text-xl font-black text-fb-on-surface leading-[1.1] tracking-tight font-[family-name:var(--font-heading)]">
                  {selectedJob.donationTitle}
                </h2>
                {selectedJob.donationPhotoUrl && (
                  <img src={selectedJob.donationPhotoUrl} alt={selectedJob.donationTitle} className="mt-5 h-32 w-full rounded-2xl object-cover" />
                )}
              </div>

              {/* AI Intelligence Panel */}
              <IntelligencePanel job={selectedJob} />

              {/* Real-time Progress Card */}
              <div className="p-6 rounded-[2rem] bg-white border border-fb-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[11px] font-black text-fb-on-surface-variant uppercase tracking-[0.2em]">
                    Delivery Status
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Live Status</span>
                  </div>
                </div>
                
                <div className="relative space-y-9">
                  {/* Vertical Progress Line */}
                  <div className="absolute left-[13.5px] top-2 bottom-2 w-[2px] bg-fb-outline-variant/10" />
                  
                  {statusFlow.map((s, i) => {
                    const currentIndex = statusFlow.indexOf(selectedJob.status);
                    const isComplete = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    
                    return (
                      <div key={s} className="relative flex items-center gap-6 pl-10">
                        <div className={cn(
                          "absolute left-0 w-7 h-7 rounded-full border-[3px] border-white shadow-ambient-1 transition-all duration-700 z-10 flex items-center justify-center",
                          isComplete ? "bg-fb-primary" : "bg-fb-surface-container",
                          isCurrent && "ring-[6px] ring-fb-primary/10 scale-125 bg-fb-primary"
                        )}>
                          {isComplete ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-fb-outline-variant/40" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.1em] transition-colors",
                            isCurrent ? "text-fb-primary" : isComplete ? "text-fb-on-surface" : "text-fb-on-surface-variant/40"
                          )}>
                            {statusLabels[s]}
                          </span>
                          {isCurrent && (
                            <p className="text-[9px] font-bold text-fb-on-surface-variant/60 leading-none">
                              Current step
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!terminalStatuses.includes(selectedJob.status) && (
                <div className="pt-2">
                  <Select
                    value={selectedJob.status}
                    onValueChange={(value) => handleStatusUpdate(selectedJob.id, value as DeliveryStatus)}
                    disabled={loading === selectedJob.id}
                  >
                    <SelectTrigger className="h-auto w-full rounded-[2rem] border-none bg-gradient-to-br from-[#0f5238] to-[#1b4332] p-6 text-white shadow-ambient-3 hover:scale-[1.01] active:scale-[0.98] transition-all flex flex-col items-start gap-5 relative overflow-hidden group">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                      
                      <div className="relative z-10 flex items-center gap-2">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                          <Zap className="w-4 h-4 text-[#95d5b2] fill-[#95d5b2]/20" />
                        </div>
                        <span className="text-[10px] font-black text-[#95d5b2] uppercase tracking-[0.2em]">Update Status</span>
                      </div>

                      <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="text-2xl font-black tracking-tight leading-none">
                          <SelectValue />
                        </div>
                        <div className="p-2 rounded-full bg-white/5 border border-white/10">
                          <ChevronRight className="w-5 h-5 text-[#95d5b2]" />
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-[2rem] border-fb-outline-variant/10 bg-white p-3 shadow-ambient-4 min-w-[240px]">
                      <div className="px-3 py-2 mb-2 border-b border-fb-outline-variant/5">
                        <p className="text-[9px] font-black text-fb-on-surface-variant uppercase tracking-widest opacity-40">Tactical Options</p>
                      </div>
                      {statusOptions.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="rounded-xl px-4 py-3 text-xs font-black text-fb-on-surface uppercase tracking-wider focus:bg-fb-primary/5 focus:text-fb-primary transition-colors cursor-pointer"
                        >
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-fb-surface-container-lowest/30 rounded-[2.5rem] border border-fb-outline-variant/10 text-center">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                <AlertCircle className="w-8 h-8 text-fb-outline-variant" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fb-on-surface-variant">Job Details</p>
              <p className="text-[11px] mt-2 font-medium text-fb-on-surface-variant/60 leading-relaxed px-4 italic">
                Select an active delivery job to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
