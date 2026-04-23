import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getJobsByDeliveryPartner, getDonationById } from '@/lib/store';
import { DeliveryDashboard } from '@/components/delivery/delivery-dashboard';

export const dynamic = 'force-dynamic';

export default async function DeliveryPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'delivery') redirect(`/dashboard/${user.role}`);

  const rawJobs = await getJobsByDeliveryPartner(user.id);
  
  // Compute priority scores and reasoning
  const jobs = await Promise.all(rawJobs.map(async (job) => {
    const donation = await getDonationById(job.donationId);
    const urgency = donation?.urgencyLevel || 'low';
    
    // Heuristic AI priority score calculation
    let priorityScore = 50;
    let reasoningParts = [];
    
    if (urgency === 'emergency') {
      priorityScore += 40;
      reasoningParts.push('Critical emergency priority');
    } else if (urgency === 'high') {
      priorityScore += 25;
      reasoningParts.push('High urgency pickup');
    }
    
    if (job.distanceKm < 5) {
      priorityScore += 10;
      reasoningParts.push('Optimal short-distance route');
    } else {
      priorityScore -= 5;
    }
    
    // Cap score at 99
    priorityScore = Math.min(99, priorityScore);
    
    // Fallback if no specific reasoning
    if (reasoningParts.length === 0) {
      reasoningParts.push('Standard logistics flow');
    }

    return {
      ...job,
      priorityScore,
      aiReasoning: reasoningParts.join(' • ')
    };
  }));

  // Sort jobs by priority score descending
  jobs.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  return <DeliveryDashboard jobs={jobs} driverName={user.name} />;
}
