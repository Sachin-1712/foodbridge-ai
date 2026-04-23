import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNGOStats, getAnalyticsForNGO, getDonationsByNGO } from '@/lib/store';
import { NGOAnalytics } from '@/components/ngo/ngo-analytics';

export const dynamic = 'force-dynamic';

export default async function NGOAnalyticsPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'ngo') redirect(`/dashboard/${user.role}`);

  const stats = await getNGOStats(user.id);
  const analytics = await getAnalyticsForNGO(user.id);
  const donations = await getDonationsByNGO(user.id);

  return (
    <NGOAnalytics
      stats={stats}
      analytics={analytics}
      donations={donations}
      ngoName={user.organizationName}
    />
  );
}
