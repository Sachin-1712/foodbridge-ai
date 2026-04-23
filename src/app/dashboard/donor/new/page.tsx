import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DonationForm } from '@/components/donor/donation-form';

export default async function NewDonationPage() {
  const user = await getSession();
  if (!user || user.role !== 'donor') redirect('/login');

  return <DonationForm donorArea={user.area} />;
}
