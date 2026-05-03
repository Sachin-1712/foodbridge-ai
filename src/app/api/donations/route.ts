import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createDonation,
  getAllDonations,
  getDonationsByDonor,
  getOpenDonations,
  updateDonationStatus,
  getDonationById,
  generateMatchSuggestions,
  getMatchesForDonation,
  getDonationsByNGO,
  createDeliveryJob,
  getNGOProfileByUserId,
  getAllNGOProfiles,
  getFirstDeliveryPartner,
  getJobByDonationId,
  updateDeliveryJobForDonation,
} from '@/lib/store';
import { DeliveryJob, Donation } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'open') {
    const donations = await getOpenDonations();
    // Attach match info for NGO view
    const enriched = await Promise.all(donations.map(async (d) => {
      const matches = await getMatchesForDonation(d.id);
      const ngoMatch = matches.find((m) => m.ngoId === user.id);
      return { ...d, matchScore: ngoMatch?.score, matchReason: ngoMatch?.reason };
    }));
    return NextResponse.json({ donations: enriched });
  }

  if (view === 'donor') {
    const donations = await getDonationsByDonor(user.id);
    return NextResponse.json({ donations });
  }

  if (view === 'ngo') {
    const donations = await getDonationsByNGO(user.id);
    return NextResponse.json({ donations });
  }

  if (view === 'matches') {
    const donationId = searchParams.get('donationId');
    if (donationId) {
      const matches = await getMatchesForDonation(donationId);
      const profiles = await getAllNGOProfiles();
      // Enrich with NGO names
      const enriched = matches.map((m) => {
        const profile = profiles.find((p) => p.userId === m.ngoId);
        return { ...m, ngoName: profile?.name || 'Unknown NGO' };
      });
      return NextResponse.json({ matches: enriched });
    }
  }

  const donations = await getAllDonations();
  return NextResponse.json({ donations });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Create donation
  if (body.action === 'create') {
    if (user.role !== 'donor') {
      return NextResponse.json({ error: 'Only donors can create donations' }, { status: 403 });
    }

    // Helper to convert HH:MM to ISO timestamp for today
    const timeToISO = (timeStr: string | undefined, hoursOffset = 0) => {
      if (!timeStr || !timeStr.includes(':')) {
        return new Date(Date.now() + hoursOffset * 3600000).toISOString();
      }
      const [hours, minutes] = timeStr.split(':').map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    const donation: Donation = {
      id: crypto.randomUUID(),
      donorId: user.id,
      title: body.donation.title,
      category: body.donation.category,
      foodType: body.donation.foodType,
      quantity: Number(body.donation.quantity),
      unit: body.donation.unit,
      urgency: body.donation.urgency,
      preparedAt: timeToISO(body.donation.preparedAt),
      expiresAt: timeToISO(body.donation.expiresAt, 6), // Default 6h if missing
      pickupStart: timeToISO(body.donation.pickupStart),
      pickupEnd: timeToISO(body.donation.pickupEnd, 3),   // Default 3h if missing
      locationName: body.donation.locationName || user.area,
      latitude: body.donation.latitude || 51.5117,
      longitude: body.donation.longitude || -0.124,
      notes: body.donation.notes || '',
      isVegetarian: body.donation.isVegetarian || false,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    const created = await createDonation(donation);
    
    // Generate match suggestions
    const matches = await generateMatchSuggestions(created);

    return NextResponse.json({ donation: created, matches });
  }

  // Accept donation (NGO action)
  if (body.action === 'accept') {
    if (user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGOs can accept donations' }, { status: 403 });
    }

    const donation = await getDonationById(body.donationId);
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (!['open', 'matched'].includes(donation.status)) {
      return NextResponse.json(
        { error: 'Donation is no longer available for acceptance' },
        { status: 409 }
      );
    }

    const deliveryPartner = await getFirstDeliveryPartner();
    if (!deliveryPartner) {
      return NextResponse.json(
        { error: 'No delivery partner is available for assignment' },
        { status: 500 }
      );
    }

    const ngoProfile = await getNGOProfileByUserId(user.id);

    const jobPayload: DeliveryJob = {
      id: crypto.randomUUID(),
      donationId: donation.id,
      donorId: donation.donorId,
      ngoId: user.id,
      deliveryPartnerId: deliveryPartner.id,
      pickupAddress: donation.locationName,
      dropAddress: ngoProfile?.area || user.area,
      etaMinutes: Math.floor(Math.random() * 15) + 15,
      distanceKm: Math.round((Math.random() * 5 + 2) * 10) / 10,
      status: 'assigned' as const,
      donationTitle: donation.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingJob = await getJobByDonationId(donation.id);
    const job = existingJob
      ? await updateDeliveryJobForDonation(donation.id, jobPayload)
      : await createDeliveryJob(jobPayload);

    await updateDonationStatus(body.donationId, 'pickup_assigned', user.id);

    return NextResponse.json({ donation: await getDonationById(body.donationId), job });
  }

  // Reject donation
  if (body.action === 'reject') {
    if (user.role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGOs can reject donations' }, { status: 403 });
    }

    // Just acknowledge — in demo we don't track rejections
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
