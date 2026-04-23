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
  getMatchesForNGO,
  getDonationsByNGO,
  createDeliveryJob,
  getUserById,
  getNGOProfileByUserId,
  getAllNGOProfiles,
} from '@/lib/store';
import { Donation } from '@/types';

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
    const donation: Donation = {
      id: `don-${Date.now()}`,
      donorId: user.id,
      title: body.title,
      category: body.category,
      foodType: body.foodType,
      quantity: parseInt(body.quantity),
      unit: body.unit,
      urgency: body.urgency,
      preparedAt: body.preparedAt || new Date().toISOString(),
      expiresAt: body.expiresAt || new Date(Date.now() + 6 * 3600000).toISOString(),
      pickupStart: body.pickupStart || new Date().toISOString(),
      pickupEnd: body.pickupEnd || new Date(Date.now() + 3 * 3600000).toISOString(),
      locationName: body.locationName || user.area,
      latitude: body.latitude || 51.5117,
      longitude: body.longitude || -0.124,
      notes: body.notes || '',
      isVegetarian: body.isVegetarian || false,
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
    const donation = await getDonationById(body.donationId);
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    await updateDonationStatus(body.donationId, 'accepted', user.id);

    // Auto-create delivery job
    const donor = await getUserById(donation.donorId);
    const ngoProfile = await getNGOProfileByUserId(user.id);

    const job = {
      id: `job-${Date.now()}`,
      donationId: donation.id,
      donorId: donation.donorId,
      ngoId: user.id,
      deliveryPartnerId: 'user-delivery-1',
      pickupAddress: donation.locationName,
      dropAddress: ngoProfile?.area || user.area,
      etaMinutes: Math.floor(Math.random() * 15) + 15,
      distanceKm: Math.round((Math.random() * 5 + 2) * 10) / 10,
      status: 'assigned' as const,
      donationTitle: donation.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createDeliveryJob(job);

    return NextResponse.json({ donation: await getDonationById(body.donationId), job });
  }

  // Reject donation
  if (body.action === 'reject') {
    // Just acknowledge — in demo we don't track rejections
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
