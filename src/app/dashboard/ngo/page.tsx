import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNGOStats, getOpenDonations, getDonationsByNGO, getMatchesForNGO, getMatchesForDonation } from '@/lib/store';
import { NGODashboard } from '@/components/ngo/ngo-dashboard';

export const dynamic = 'force-dynamic';

export default async function NGOPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'ngo') redirect(`/dashboard/${user.role}`);

  const stats = await getNGOStats(user.id);
  const openDonations = await getOpenDonations();
  const acceptedDonations = await getDonationsByNGO(user.id);
  
  // Enrich open donations with match scores for this NGO
  const enrichedDonations = await Promise.all(openDonations.map(async (d) => {
    const matches = await getMatchesForDonation(d.id);
    const ngoMatch = matches.find((m) => m.ngoId === user.id);
    return {
      ...d,
      matchScore: ngoMatch?.score,
      matchReason: ngoMatch?.reason,
    };
  }));

  return (
    <NGODashboard
      stats={stats}
      openDonations={enrichedDonations}
      acceptedDonations={acceptedDonations}
      ngoName={user.organizationName}
    />
  );
}
