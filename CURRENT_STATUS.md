# Current Status

Last updated: 2026-05-03

## Phase 1 Complete: Core Workflow Reliability

The donor -> NGO -> delivery workflow has been stabilized without renaming, redesigning, reseeding, adding uploads, or adding new client-facing features.

## What Changed

- Added server-side API role checks:
  - Donors can create donations.
  - NGOs can accept or reject donations.
  - Delivery users can view and update delivery jobs.
- Normalized `ngo_profiles.supported_food_types` in the Supabase mapper so matching works whether the database returns an array or stringified JSON.
- Replaced the hard-coded delivery partner id with a lookup for the seeded delivery user, falling back to the first delivery profile if needed.
- Prevented duplicate delivery jobs by checking for an existing job for the donation before creating a new one.
- Kept donation and delivery statuses synchronized:
  - Accepted NGO donation assignment sets donation status to `pickup_assigned`.
  - Delivery statuses continue syncing donation status through `picked_up`, `in_transit`, and `delivered`.
- Included `pickup_assigned` in the NGO in-progress/current donation list.

## Verification

- `npm run build` passed.
- Programmatic local API workflow test passed against `http://localhost:3000`.
- Test donation: `4aa4acf8-f595-4241-ab49-025eb3e6194c`.
- Test delivery job: `5d7d24d1-7a09-4c1b-a99b-36e04a0f3c08`.

Verified scenarios:

- Donor created a fresh donation.
- Donation appeared in the donor view as `open`.
- Donation appeared in the NGO marketplace.
- NGO accepted the donation.
- Donation moved to `pickup_assigned`.
- Delivery job was created and visible to the delivery user.
- Duplicate NGO accept was blocked with `409`.
- NGO attempting donor create was blocked with `403`.
- Donor attempting delivery update was blocked with `403`.
- Delivery user updated the job through `accepted`, `picked_up`, `in_transit`, and `delivered`.
- Donor and NGO donation views reflected final status `delivered`.

## Phase 2 Complete: Sharebite Rename And Simpler Copy

Visible app branding has been renamed to Sharebite without changing database table names, seed data, login behavior, upload behavior, donation zones, or status controls.

Phase 2 changes:

- Renamed app metadata and visible app branding to Sharebite.
- Updated login, sidebar/mobile header, chatbot labels, README, deployment docs, setup docs, and design docs.
- Simplified donor, NGO, delivery, analytics, and chatbot wording while keeping the current Stitch UI style.
- Replaced the requested phrases:
  - "Efficient Altruism Starts Here" -> "Share Extra Food Easily"
  - "Plant-Based Registry" -> "Vegetarian Food"
  - "Deployment Parameters" -> "Pickup Details"
  - "Priority Protocol" -> "Pickup Urgency"
  - "Operational Directives" -> "Notes"
  - "Strategic Advisor" -> "AI Suggestion"
  - "Impact Intelligence" -> "Donation Insights"
  - "Mission Segment" -> "Donation"
  - "Route Intelligence" -> "Route Suggestion"
  - "Intelligence Node" -> "Sharebite AI"

Phase 2 verification:

- `npm run build` passed.

## Phase 3 Complete: Bangalore Demo Data And Safe Reseed

Demo data has been localized to Bangalore without adding dropdowns, uploads, donation zones, login changes, or UI redesign work.

Phase 3 changes:

- Updated Supabase demo seed data to use Bangalore areas, organizations, addresses, and analytics summaries.
- Added a safe demo reseed command: `npm run seed:demo`.
- Kept the current legacy demo login emails in place until Phase 9.
- Seeded useful examples for `open`, `accepted`, `pickup_assigned`, `in_transit`, `delivered`, and `cancelled` statuses.
- Added Bangalore delivery jobs and match suggestions so donor, NGO, delivery, and analytics views have meaningful demo data.
- Updated demo workflow and seeding docs.

Phase 3 verification:

- `npm run seed:demo` passed and recreated 14 profiles, 5 NGO profiles, 9 donations, 8 match suggestions, 4 delivery jobs, and 14 analytics snapshots.
- Supabase verification confirmed Bangalore donor, NGO, delivery, donation, delivery job, and analytics rows.
- `npm run build` passed after the reseed/doc updates.

## Phase 4 Complete: Delivery Status Dropdown

Delivery partners can now update each active delivery job from a status dropdown instead of using click-to-advance buttons.

Phase 4 changes:

- Added delivery status option `cancelled`.
- Replaced the delivery dashboard action button with a dropdown containing:
  - `Assigned`
  - `Accepted`
  - `Picked Up`
  - `In Transit`
  - `Delivered`
  - `Cancelled`
- Kept the existing delivery API role check intact.
- Synced delivery job statuses to donation statuses:
  - `assigned` and `accepted` -> `pickup_assigned`
  - `picked_up` -> `picked_up`
  - `in_transit` -> `in_transit`
  - `delivered` -> `delivered`
  - `cancelled` -> `cancelled`
- Kept the delivery journey timeline driven by the selected status.
- Treats delivered and cancelled jobs as completed so they leave the active queue after refresh.

Phase 4 verification:

- Programmatic local API test passed against `http://localhost:3000`.
- Delivery user changed `30 Mixed Veg Sandwiches` through `accepted`, `picked_up`, `in_transit`, and `delivered`.
- Donor and NGO API views both reflected `delivered` for the synced donation.
- Delivered job left the active delivery list.
- `cancelled` status update was accepted and removed the job from active delivery jobs.
- Test job was restored to `assigned`; related donation is back to `pickup_assigned`.
- `npm run build` passed.

## Known Remaining Issues

- `npm run lint` still has pre-existing lint failures and was not made a Phase 1 blocker.
- One pre-existing inconsistent live demo row remains quarantined/documented instead of deleted.
- No photo upload/storage work was done; this is planned for Phase 6.
