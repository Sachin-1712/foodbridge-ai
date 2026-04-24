import { Badge } from '@/components/ui/badge';
import { DonationStatus, DeliveryStatus, Urgency } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  open: { label: 'Open', className: 'bg-[#b1f0ce]/30 text-[#2D6A4F] border-[#2D6A4F]/20', dotColor: 'bg-[#2D6A4F]' },
  matched: { label: 'Matched', className: 'bg-[#ffdcbd]/30 text-[#7d562d] border-[#7d562d]/20', dotColor: 'bg-[#f59e0b] animate-pulse' },
  accepted: { label: 'Accepted', className: 'bg-[#b1f0ce]/30 text-[#0f5238] border-[#0f5238]/20', dotColor: 'bg-[#10b981]' },
  pickup_assigned: { label: 'Pickup Assigned', className: 'bg-[#e1e6c2]/40 text-[#464a30] border-[#464a30]/20', dotColor: 'bg-[#464a30]' },
  picked_up: { label: 'Picked Up', className: 'bg-fb-surface-container text-fb-on-surface-variant border-fb-outline-variant/30', dotColor: 'bg-fb-outline' },
  in_transit: { label: 'In Transit', className: 'bg-[#ffdcbd]/30 text-[#7d562d] border-[#7d562d]/20', dotColor: 'bg-[#7d562d]' },
  delivered: { label: 'Delivered', className: 'bg-[#b1f0ce]/30 text-[#0f5238] border-[#0f5238]/20', dotColor: 'bg-[#2D6A4F]' },
  cancelled: { label: 'Cancelled', className: 'bg-fb-surface-container text-fb-outline border-fb-outline-variant/30', dotColor: 'bg-fb-outline' },
  assigned: { label: 'Assigned', className: 'bg-[#b1f0ce]/20 text-[#2D6A4F] border-[#2D6A4F]/15', dotColor: 'bg-[#2D6A4F]' },
};

const urgencyConfig: Record<Urgency, { label: string; className: string; dotColor: string }> = {
  high: { label: 'Urgent', className: 'bg-[#ffdad6]/40 text-[#ba1a1a] border-[#ba1a1a]/20', dotColor: 'bg-[#ba1a1a] animate-pulse' },
  medium: { label: 'Medium', className: 'bg-[#ffdcbd]/30 text-[#7d562d] border-[#7d562d]/20', dotColor: 'bg-[#f59e0b]' },
  low: { label: 'Low', className: 'bg-fb-surface-container text-fb-on-surface-variant border-fb-outline-variant/30', dotColor: 'bg-fb-outline' },
};

export function StatusBadge({ status, className }: { status: DonationStatus | DeliveryStatus; className?: string }) {
  const config = statusConfig[status] || { label: status, className: '', dotColor: 'bg-fb-outline' };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium rounded-full px-3 py-1 gap-1.5', config.className, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      {config.label}
    </Badge>
  );
}

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const config = urgencyConfig[urgency];
  return (
    <Badge variant="outline" className={cn('text-xs font-medium rounded-full px-3 py-1 gap-1.5', config.className, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      {config.label}
    </Badge>
  );
}
