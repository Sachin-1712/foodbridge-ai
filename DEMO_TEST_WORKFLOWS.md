# Demo Test Workflows

Last updated: 2026-05-03

## Phase 1 Workflow Test

Purpose: verify the core donor -> NGO -> delivery workflow with Supabase persistence and API role checks.

### Automated API Test Result

Status: Passed

Local app URL used: `http://localhost:3000`

Test data:

- Donation title: `Phase 1 Workflow Test 2026-05-03T21-04-37-013Z`
- Donation id: `4aa4acf8-f595-4241-ab49-025eb3e6194c`
- Delivery job id: `5d7d24d1-7a09-4c1b-a99b-36e04a0f3c08`
- Generated match suggestions: 2

Validated checks:

- NGO was blocked from creating a donor donation: `403`.
- Donor created a fresh donation.
- Donor donation view showed the donation as `open`.
- NGO marketplace showed the fresh donation.
- NGO accepted the donation.
- Accepted donation moved to `pickup_assigned`.
- Duplicate NGO accept was blocked: `409`.
- NGO current view showed the accepted donation.
- Delivery user saw the assigned job.
- Donor was blocked from updating delivery status: `403`.
- Delivery user updated status through:
  - `accepted`
  - `picked_up`
  - `in_transit`
  - `delivered`
- Donor view reflected `delivered`.
- NGO view reflected `delivered`.

## Manual Demo Steps For Phase 1

Use the current legacy demo accounts until the Phase 9 Sharebite login change is implemented:

- Donor: `donor@foodbridge.demo` / `demo123`
- NGO: `ngo@foodbridge.demo` / `demo123`
- Delivery: `delivery@foodbridge.demo` / `demo123`

Steps:

1. Log in as donor.
2. Create a new donation from the donor dashboard.
3. Confirm it appears in the donor dashboard as `Open`.
4. Log out and log in as NGO.
5. Confirm the donation appears in the NGO marketplace.
6. Open the donation and accept it.
7. Confirm it appears in the NGO in-progress/current view as `Pickup Assigned`.
8. Log out and log in as delivery.
9. Confirm the delivery job appears in the dispatch queue.
10. Advance the delivery status.
11. Return to donor and NGO dashboards.
12. Confirm the updated status appears after refresh.

## Phase 1 Build Check

Command:

```bash
npm run build
```

Result: Passed.

## Phase 3 Bangalore Demo Reseed Test

Purpose: verify that the demo dataset is localized to Bangalore and still supports the existing donor, NGO, delivery, and analytics views.

### Reseed Command

```bash
npm run seed:demo
```

Expected result:

- Demo-only rows are reset.
- Bangalore profiles, NGO profiles, donations, match suggestions, delivery jobs, and analytics snapshots are recreated.
- Existing demo login emails remain available until Phase 9 changes the login flow.

Actual result: Passed on 2026-05-03.

Seeded rows:

- Profiles: 14
- NGO profiles: 5
- Donations: 9
- Match suggestions: 8
- Delivery jobs: 4
- Analytics snapshots: 14

### Dashboard Checks

Use the current demo accounts:

- Donor: `donor@foodbridge.demo` / `demo123`
- NGO: `ngo@foodbridge.demo` / `demo123`
- Delivery: `delivery@foodbridge.demo` / `demo123`

Donor dashboard:

1. Log in as donor.
2. Confirm Koramangala Kitchen data appears.
3. Confirm `35 Veg Biryani Meal Boxes` appears as `Open`.
4. Confirm cancelled demo data is present only as historical/status data.

NGO marketplace:

1. Log in as NGO.
2. Confirm open donations include Bangalore areas:
   - Koramangala
   - Indiranagar
   - HSR Layout
   - Malleshwaram
3. Confirm match suggestions reference Bangalore NGOs.

Delivery dashboard:

1. Log in as delivery.
2. Confirm active jobs include:
   - `40 Corporate Lunch Packs`
   - `12 Juice Bottles`
   - `30 Mixed Veg Sandwiches`
3. Confirm completed jobs include:
   - `25 Paneer Butter Masala Portions`
4. Confirm pickup and drop-off map links are built from Bangalore addresses.

Analytics:

1. Log in as NGO.
2. Open analytics.
3. Confirm Bangalore-focused activity data appears.

### Build Check

Command:

```bash
npm run build
```

Result: Passed on 2026-05-03.

## Phase 4 Delivery Status Dropdown Test

Purpose: verify that delivery status dropdown updates sync to Supabase and are visible to donor and NGO views after refresh.

Local app URL used: `http://localhost:3000`

Test job:

- Donation: `30 Mixed Veg Sandwiches`
- Delivery job id: `88888888-8888-8888-8888-888888888888`
- Donation id: `cccc3333-4444-5555-6666-777777777777`

Validated checks:

- Delivery user changed status through:
  - `accepted`
  - `picked_up`
  - `in_transit`
  - `delivered`
- Delivery job status updated in Supabase after each API call.
- Related donation status synced to `delivered`.
- Donor view for `donor-electronic-city@sharebite.demo` reflected `delivered`.
- NGO view for `ngo2@foodbridge.demo` reflected `delivered`.
- Delivered job left the active delivery list.
- Delivery user changed status to `cancelled`; job left active delivery list.
- Test job was restored to `assigned`; donation returned to `pickup_assigned` for the demo baseline.

Build check:

```bash
npm run build
```

Result: Passed on 2026-05-03.
