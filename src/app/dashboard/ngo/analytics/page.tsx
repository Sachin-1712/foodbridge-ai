import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNGOStats, getAnalyticsForNGO, getDonationsByNGO, getAllDonations, getNGOProfileByUserId } from '@/lib/store';
import { NGOAnalytics } from '@/components/ngo/ngo-analytics';
import { RevalidationTimer } from '@/components/shared/revalidation-timer';

export const dynamic = 'force-dynamic';

export default async function NGOAnalyticsPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'ngo') redirect(`/dashboard/${user.role}`);

  const stats = await getNGOStats(user.id);
  const analytics = await getAnalyticsForNGO(user.id);
  const donations = await getDonationsByNGO(user.id);
  const zoneDonations = await getAllDonations();
  const ngoProfile = await getNGOProfileByUserId(user.id);

  return (
    <>
      <NGOAnalytics
        stats={stats}
        analytics={analytics}
        donations={donations}
        zoneDonations={zoneDonations}
        ngoName={user.organizationName}
        ngoArea={ngoProfile?.area || user.area}
        ngoLatitude={ngoProfile?.latitude}
        ngoLongitude={ngoProfile?.longitude}
        lastUpdated={new Date().toISOString()}
      />
      <RevalidationTimer intervalMs={10000} />
    </>
  );
}
