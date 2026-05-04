import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getAnalyticsForNGO,
  getDonationById,
  getDonationsByNGO,
  getJobsByDeliveryPartner,
  getMatchesForDonation,
  getNGOProfileByUserId,
  getNGOStats,
  getOpenDonations,
  getAllDonations,
} from '@/lib/store';
import { DeliveryJob, Donation, UserRole } from '@/types';

const categoryLabels: Record<string, string> = {
  cooked_meals: 'cooked meals',
  bakery: 'bakery',
  fresh_produce: 'fresh produce',
  packaged: 'packaged food',
  dairy: 'dairy',
  beverages: 'beverages',
  other: 'other food',
};

const bangaloreZones = [
  'Koramangala',
  'Indiranagar',
  'Jayanagar',
  'Whitefield',
  'HSR Layout',
  'MG Road',
  'Electronic City',
  'JP Nagar',
  'Malleshwaram',
  'Marathahalli',
  'Hebbal',
];

const activeDeliveryStatuses = ['assigned', 'accepted', 'picked_up', 'in_transit'];

const roleFallback: Record<UserRole, string> = {
  donor: 'I can help you create donations, explain what details are needed, suggest urgency/category, and explain when you can edit or delete a donation.',
  ngo: 'I can summarize current open donations, recommend what to accept first, explain match scores, and describe Bangalore donation zones from live donation rows.',
  delivery: 'I can help with your next pickup, route priority, Google Maps usage, status dropdown updates, and what to do after pickup.',
};

const roleSystemPrompt: Record<UserRole, string> = {
  donor: 'You are Sharebite AI for a donor. Help create donations, explain photo upload, edit/delete rules, urgency, category, pickup window, and notes. Do not invent database actions.',
  ngo: 'You are Sharebite AI for an NGO. Summarize live donation data, match scores, donation zones, analytics, and acceptance priorities. Do not claim trained machine learning.',
  delivery: 'You are Sharebite AI for a delivery partner. Explain active jobs, route priority, Google Maps links, status dropdown updates, pickup, transit, and delivery steps.',
};

const latestUserText = (messages: any[]) => {
  const lastUserMessage = messages?.filter((m: any) => m.role === 'user').pop();
  return lastUserMessage?.parts?.[0]?.text || lastUserMessage?.content || '';
};

const labelCategory = (category: string) => categoryLabels[category] || category.replace('_', ' ');

const formatDonation = (donation: Donation) => (
  `${donation.title} from ${donation.locationName} (${donation.quantity} ${donation.unit}, ${donation.urgency} urgency)`
);

const isTodayOrRecent = (iso: string) => {
  const created = new Date(iso).getTime();
  return Date.now() - created < 24 * 3600000;
};

const urgencyWeight = (urgency: Donation['urgency']) => {
  if (urgency === 'high') return 3;
  if (urgency === 'medium') return 2;
  return 1;
};

const detectZone = (donation: Donation) => {
  const text = donation.locationName.toLowerCase();
  return bangaloreZones.find((zone) => text.includes(zone.toLowerCase()));
};

const getWindowLabel = (donation: Donation) => {
  const hour = new Date(donation.pickupStart || donation.preparedAt || donation.createdAt).getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  return 'Evening';
};

const topCount = (items: string[]) => {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
};

const buildZoneSummary = (donations: Donation[]) => {
  const rows = bangaloreZones
    .map((zone) => {
      const zoneDonations = donations.filter((donation) => detectZone(donation) === zone);
      const active = zoneDonations.filter((donation) => ['open', 'accepted', 'pickup_assigned', 'picked_up', 'in_transit'].includes(donation.status));
      const urgent = active.filter((donation) => donation.urgency === 'high');
      const commonFood = topCount(zoneDonations.map((donation) => donation.foodType || labelCategory(donation.category)))?.[0] || 'mixed food';
      const peakWindow = topCount(zoneDonations.map(getWindowLabel))?.[0] || 'Evening';

      return {
        zone,
        count: zoneDonations.length,
        active: active.length,
        urgent: urgent.length,
        commonFood,
        peakWindow,
      };
    })
    .filter((zone) => zone.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.active - a.active;
    });

  return rows;
};

async function maybeGeminiRewrite(baseReply: string, role: UserRole, question: string, messages: any[]) {
  if (!process.env.GEMINI_API_KEY) return baseReply;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const history = (messages || [])
      .filter((m: any) => m.parts?.[0]?.text || m.content)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.parts?.[0]?.text || m.content || '' }],
      }))
      .filter((m: any) => m.parts[0].text.trim())
      .slice(-4);

    if (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          ...history,
          {
            role: 'user',
            parts: [{
              text: `User question: ${question}\n\nDeterministic Sharebite answer to preserve exactly:\n${baseReply}\n\nRewrite this answer in simple, concise language for the ${role} role. Do not add new facts, do not claim trained machine learning, and do not change any action instructions.`,
            }],
          },
        ],
        systemInstruction: {
          parts: [{ text: roleSystemPrompt[role] }],
        },
        generationConfig: {
          maxOutputTokens: 450,
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) return baseReply;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || baseReply;
  } catch {
    return baseReply;
  } finally {
    clearTimeout(timeout);
  }
}

async function donorAnswer(question: string) {
  const q = question.toLowerCase();

  if (q.includes('edit') || q.includes('delete')) {
    return 'You can edit or delete your own donation only before pickup starts. Allowed statuses are Open, Accepted, and Pickup Assigned. Once it is Picked Up, In Transit, Delivered, or Cancelled, edits and deletes are blocked to keep NGO and delivery records reliable.';
  }

  if (q.includes('photo') || q.includes('image') || q.includes('upload')) {
    return 'Upload a clear photo of the packed food from the donation form. Show the actual food and packaging, avoid blurry photos, and do not include private customer information. Sharebite stores the photo URL with the donation so NGOs and delivery partners can inspect it.';
  }

  if (q.includes('detail') || q.includes('needed') || q.includes('field')) {
    return 'A strong donation needs: food title, category or food type, quantity and unit, pickup address, pickup window, urgency, vegetarian yes/no, and short notes. The chat wizard can collect these, then create the donation through the existing donation API.';
  }

  if (q.includes('urgency') || q.includes('category')) {
    return 'Use High urgency when the food expires soon or pickup must happen within a short window. Use Medium for same-day pickup, and Low when there is more time. Category should describe the main food type, such as cooked meals, bakery, fresh produce, packaged food, dairy, or beverages.';
  }

  return roleFallback.donor;
}

async function ngoAnswer(question: string, userId: string) {
  const q = question.toLowerCase();
  const openDonations = await getOpenDonations();
  const allDonations = await getAllDonations();
  const ngoDonations = await getDonationsByNGO(userId);

  if (q.includes('today') || q.includes('update') || q.includes('available') || q.includes('open')) {
    const recentOpen = openDonations.filter((donation) => isTodayOrRecent(donation.createdAt));
    const urgent = recentOpen.filter((donation) => donation.urgency === 'high');
    const examples = recentOpen.slice(0, 4).map(formatDonation).join('\n- ');

    if (recentOpen.length === 0) {
      return 'There are no open donations from the last 24 hours right now. Keep the marketplace open; new donor rows will appear as soon as they are created.';
    }

    return `Today's open donation update: ${recentOpen.length} open donation${recentOpen.length === 1 ? '' : 's'} are available, including ${urgent.length} urgent item${urgent.length === 1 ? '' : 's'}.\n\nTop available rows:\n- ${examples}`;
  }

  if (q.includes('accept first') || q.includes('which donation') || q.includes('priority') || q.includes('urgent')) {
    const scored = await Promise.all(openDonations.map(async (donation) => {
      const matches = await getMatchesForDonation(donation.id);
      const match = matches.find((row) => row.ngoId === userId);
      return {
        donation,
        score: (match?.score || 60) + urgencyWeight(donation.urgency) * 10 + (isTodayOrRecent(donation.createdAt) ? 5 : 0),
        matchScore: match?.score,
        reason: match?.reason,
      };
    }));
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    if (!best) {
      return 'There are no open donations to accept right now.';
    }

    return `Accept "${best.donation.title}" first. It is ${best.donation.urgency} urgency from ${best.donation.locationName}, with ${best.donation.quantity} ${best.donation.unit} available.${best.matchScore ? ` Your match score is ${best.matchScore}/100.` : ''} ${best.reason || 'It is recommended because urgency, current availability, and pickup timing are favorable.'}`;
  }

  if (q.includes('zone') || q.includes('prediction')) {
    const zones = buildZoneSummary(allDonations);
    const top = zones[0];
    const urgentZone = zones.find((zone) => zone.urgent > 0);

    if (!top) {
      return 'Donation zones will appear after Bangalore donations are created. The prediction is rule-based, not a trained ML model.';
    }

    return `Donation zones are rule-based and use recent Bangalore donation rows. ${top.zone} is the highest activity zone with ${top.count} donation${top.count === 1 ? '' : 's'}, common food type ${top.commonFood}, and a likely ${top.peakWindow.toLowerCase()} pickup pattern.${urgentZone ? ` ${urgentZone.zone} needs attention because it has ${urgentZone.urgent} urgent active donation${urgentZone.urgent === 1 ? '' : 's'}.` : ''} Prediction is based on recent donation count, active donations, urgency, common food type, and pickup-time patterns.`;
  }

  if (q.includes('match score') || q.includes('match')) {
    return 'Match score is a demo-friendly ranking from 0 to 100. It considers distance, NGO supported food types, urgency readiness, available capacity, and historical acceptance rate. A higher score means the donation is a better fit for your NGO to accept quickly.';
  }

  if (q.includes('analytics') || q.includes('summary') || q.includes('impact')) {
    const profile = await getNGOProfileByUserId(userId);
    const stats = await getNGOStats(userId);
    const analytics = profile ? await getAnalyticsForNGO(userId) : [];
    const latest = analytics[analytics.length - 1];
    const deliveredMeals = ngoDonations.filter((donation) => donation.status === 'delivered').reduce((sum, donation) => sum + donation.quantity, 0);

    return `${profile?.name || 'Your NGO'} currently has ${ngoDonations.length} accepted donation record${ngoDonations.length === 1 ? '' : 's'} and ${deliveredMeals || stats.mealsRescued} rescued meals in the demo data. The latest analytics snapshot shows ${latest?.donationsReceived || 0} donations received and ${latest?.avgAcceptanceTime || stats.avgAcceptanceMinutes} minutes average acceptance time.`;
  }

  return roleFallback.ngo;
}

async function deliveryAnswer(question: string, userId: string) {
  const q = question.toLowerCase();
  const jobs = await getJobsByDeliveryPartner(userId);
  const enriched = await Promise.all(jobs.map(async (job) => ({
    job,
    donation: await getDonationById(job.donationId),
  })));
  const active = enriched
    .filter((row) => activeDeliveryStatuses.includes(row.job.status))
    .sort((a, b) => {
      const urgentDelta = urgencyWeight(b.donation?.urgency || 'low') - urgencyWeight(a.donation?.urgency || 'low');
      if (urgentDelta !== 0) return urgentDelta;
      return new Date(a.job.createdAt).getTime() - new Date(b.job.createdAt).getTime();
    });
  const next = active[0];

  if (q.includes('next') || q.includes('what should i do') || q.includes('pickup')) {
    if (!next) {
      return 'You do not have an active delivery job right now. Completed and cancelled jobs stay in the completed section.';
    }

    return `Your next pickup is "${next.job.donationTitle}" from ${next.job.pickupAddress}. Current status is ${next.job.status.replace('_', ' ')}. Open Google Maps from the job card, collect the food, then update the dropdown to Picked Up.`;
  }

  if (q.includes('urgent')) {
    const urgent = active.find((row) => row.donation?.urgency === 'high');
    if (!urgent) {
      return 'No active delivery job is marked high urgency right now. Prioritize the oldest assigned job or the shortest pickup window.';
    }

    return `The urgent active job is "${urgent.job.donationTitle}" from ${urgent.job.pickupAddress}. Handle this first because the donation is marked high urgency by the donor.`;
  }

  if (q.includes('route') || q.includes('map')) {
    if (!next) {
      return 'No active route is available right now. When a job appears, use the Google Maps link on the delivery card for pickup and drop-off navigation.';
    }

    return `For your current route, start at ${next.job.pickupAddress}, then deliver to ${next.job.dropAddress}. The job card includes the Google Maps action. Sharebite does not replace Maps; it tells you which job to prioritize and which status to update.`;
  }

  if (q.includes('status') || q.includes('dropdown')) {
    return 'Use the status dropdown on each active delivery job. Move from Assigned or Accepted to Picked Up after collection, then In Transit while travelling, then Delivered after handoff. The donor and NGO dashboards refresh from the synced Supabase status.';
  }

  if (q.includes('after pickup') || q.includes('picked up')) {
    return 'After pickup, confirm the food count and packaging, update the dropdown to Picked Up, start the route to the NGO, then update to In Transit. Mark Delivered only after the NGO receives the food.';
  }

  return roleFallback.delivery;
}

async function getDeterministicAnswer(question: string, role: UserRole, userId?: string) {
  if (role === 'donor') return donorAnswer(question);
  if (role === 'ngo' && userId) return ngoAnswer(question, userId);
  if (role === 'delivery' && userId) return deliveryAnswer(question, userId);
  return roleFallback[role];
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { messages, role: requestedRole } = await request.json();
    const user = await getSession();
    const role = (user?.role || requestedRole || 'donor') as UserRole;
    const lastText = latestUserText(messages);

    if (!lastText) {
      return NextResponse.json({ reply: roleFallback[role] || 'Please ask me a Sharebite question.' });
    }

    const baseReply = await getDeterministicAnswer(lastText, role, user?.id);
    const reply = await maybeGeminiRewrite(baseReply, role, lastText, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(`[Chat API ${requestId}] Route error:`, err);
    return NextResponse.json(
      { reply: 'Sharebite AI hit a temporary issue. The app workflow is still available from the dashboard controls.' },
      { status: 200 }
    );
  }
}
