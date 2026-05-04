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

## Phase 5 Donor Edit/Delete Test

Purpose: verify donors can edit or delete only their own pre-pickup donations, and that protected statuses are blocked.

Local app URL used: `http://localhost:3000`

Validated checks:

- Donor created a fresh open donation:
  - `Phase 5 Editable Test`
- Donor edited the open donation:
  - Title changed to `Phase 5 Edited Test`
  - Quantity changed to `11`
  - Pickup location changed to a Bangalore address
- Donor deleted the edited open donation.
- Deleted donation no longer appeared in donor API view.
- Wrong donor edit attempt returned `403`.
- Locked status attempts returned `409`:
  - `picked_up`
  - `in_transit`
  - `delivered`
  - `cancelled`
- Pickup-assigned edit propagation was tested on `30 Mixed Veg Sandwiches`:
  - NGO API view reflected the edited title and quantity.
  - Delivery API view reflected the edited title and pickup address.
  - Seeded donation was restored afterward.
- `npm run seed:demo` was run after tests to restore the Bangalore demo baseline.

Build check:

```bash
npm run build
```

Result: Passed on 2026-05-04.

## Phase 6 Food Photo Upload Test

Purpose: verify donation photos persist and appear across donor, NGO, and delivery views.

Storage setup:

```bash
npm run storage:setup
```

Result: bucket creation was attempted, but Supabase returned an RLS error with the current anon-only environment. The app fallback stores small demo images in `donations.photo_url`.

Validated checks:

- Donor created `Phase 6 Photo Test` with a photo URL fallback.
- Donor API view returned the saved `photoUrl` after refresh.
- NGO marketplace API view returned the same `photoUrl`.
- Donor edited the donation and replaced the photo.
- Donor API view returned the replacement `photoUrl`.
- Delivery API returned `donationPhotoUrl` for a photo-enabled assigned job.
- Test donation was deleted.
- `npm run seed:demo` was run after tests to restore the Bangalore demo baseline.

Build check:

```bash
npm run build
```

Result: Passed on 2026-05-04.

## Phase 7 Donation Zones Test

Purpose: verify NGO Analytics shows Bangalore donation zones and rule-based predictions from current Supabase donation rows.

Setup:

```bash
npm run seed:demo
```

Result: Passed. Bangalore seed data produced 8 zones with donation rows.

Validated checks:

- Zone calculation used current `donations` rows from Supabase.
- Grouping used Bangalore area names from `location_name`.
- At least 3 zones appeared; seed data produced:
  - Koramangala
  - Indiranagar
  - Jayanagar
  - Whitefield
  - HSR Layout
  - MG Road
  - Electronic City
  - Malleshwaram
- Top zone was based on highest donation count.
- Active/open and urgent rows influenced attention recommendations.
- Common food type and predicted peak window were derived from donation rows.
- NGO Analytics page returned HTTP 200 locally.
- Page included the label: `AI-assisted prediction based on recent donation patterns.`
- Empty-data handling exists through a no-zone-data state.

Build check:

```bash
npm run build
```

Result: Passed on 2026-05-04.

## Phase 8 Role-Specific Sharebite AI Test

Purpose: verify that Sharebite AI changes behavior by role, keeps core actions deterministic, and still preserves the donor -> NGO -> delivery workflow.

Setup:

```bash
npm run seed:demo
```

Result: Passed. The reseed created 18 profiles, 15 donations, 14 match suggestions, 6 delivery jobs, and 42 analytics snapshots.

Validated chatbot checks:

- Donor chat creation path:
  - The chat panel now collects donation details step by step and calls the existing donation creation API only after confirmation.
  - Programmatic API validation created `Phase 8 Chat Wizard Test Meals` through the same API path.
  - The created donation generated 5 match suggestions.
  - The test donation was deleted after validation.
- NGO chat:
  - `Give me today's donation update` returned current open donation counts and live examples.
  - `Explain donation zones` returned a Bangalore zone summary based on current donation rows.
- Delivery chat:
  - `What should I do next?` returned the next active pickup from current delivery jobs.
- Loading UX:
  - Chat input disables while waiting.
  - Send button shows loading state.
  - Assistant bubble shows `Sharebite AI is thinking...` with animated dots.
  - Duplicate sends are guarded while a request is in flight.

Validated workflow regression:

- Donor created `Phase 8 Workflow Test Lunch Packs`.
- Donor dashboard API saw the donation.
- NGO marketplace API saw the donation.
- NGO accepted the donation.
- Delivery dashboard API saw the created delivery job.
- Delivery updated the job to `in_transit`.
- Donor and NGO API views both reflected donation status `in_transit`.
- `npm run seed:demo` was run again after the workflow test to restore the Bangalore demo baseline.

Build check:

```bash
npm run build
```

Result: Passed on 2026-05-04.
