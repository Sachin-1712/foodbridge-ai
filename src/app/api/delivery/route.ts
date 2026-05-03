import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getJobsByDeliveryPartner,
  updateDeliveryJobStatus,
  updateDonationStatus,
  getJobById,
  getDonationById,
} from '@/lib/store';
import { DeliveryStatus, DonationStatus } from '@/types';

// Map delivery status → donation status
const deliveryToDonationStatus: Record<DeliveryStatus, DonationStatus> = {
  assigned: 'pickup_assigned',
  accepted: 'pickup_assigned',
  picked_up: 'picked_up',
  in_transit: 'in_transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'delivery') {
    return NextResponse.json({ error: 'Only delivery users can view delivery jobs' }, { status: 403 });
  }

  const rawJobs = await getJobsByDeliveryPartner(user.id);
  const jobs = await Promise.all(rawJobs.map(async (job) => {
    const donation = await getDonationById(job.donationId);
    return { ...job, donationPhotoUrl: donation?.photoUrl };
  }));
  return NextResponse.json({ jobs });
}

export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'delivery') {
    return NextResponse.json({ error: 'Only delivery users can update delivery jobs' }, { status: 403 });
  }

  const { jobId, status } = await request.json();

  if (!jobId || !status) {
    return NextResponse.json({ error: 'jobId and status are required' }, { status: 400 });
  }

  if (!Object.keys(deliveryToDonationStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid delivery status' }, { status: 400 });
  }

  const existingJob = await getJobById(jobId);
  if (!existingJob) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (existingJob.deliveryPartnerId !== user.id) {
    return NextResponse.json({ error: 'This delivery job is not assigned to the current user' }, { status: 403 });
  }

  const job = await updateDeliveryJobStatus(jobId, status as DeliveryStatus);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Sync donation status
  const donationStatus = deliveryToDonationStatus[status as DeliveryStatus];
  if (donationStatus) {
    await updateDonationStatus(job.donationId, donationStatus);
  }

  const updatedJob = await getJobById(jobId);
  return NextResponse.json({ job: updatedJob });
}
