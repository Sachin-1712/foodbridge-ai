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

## Phase 5 Complete: Donor Edit And Delete Before Pickup

Donors can now edit or delete their own donations only before pickup starts.

Phase 5 changes:

- Added donor card actions for eligible donations.
- Added an edit dialog for:
  - title
  - category
  - food type
  - quantity
  - unit
  - urgency
  - pickup location
  - pickup window
  - notes
  - vegetarian flag
- Added delete confirmation dialog.
- Added donor-only PATCH and DELETE checks in `/api/donations`.
- Enforced ownership checks so donors cannot edit or delete another donor's donation.
- Allowed edit/delete statuses: `open`, `accepted`, `pickup_assigned`.
- Blocked edit/delete statuses: `picked_up`, `in_transit`, `delivered`, `cancelled`.
- Synced edited donation title and pickup address to any related delivery job.
- Deleted related match suggestions and delivery jobs before deleting a donation.

Phase 5 verification:

- Donor created, edited, and deleted a fresh open donation.
- Wrong donor edit attempt was blocked with `403`.
- `picked_up`, `in_transit`, `delivered`, and `cancelled` edit/delete attempts were blocked with `409`.
- Edited a `pickup_assigned` donation and confirmed NGO and delivery API views reflected the new title/location.
- Restored the edited seeded donation, then ran `npm run seed:demo` to return Supabase to the Bangalore demo baseline.
- `npm run build` passed.

## Phase 6 Complete: Food Photo Upload

Donors can now attach food photos when creating a donation and replace the photo from the donor edit dialog.

Phase 6 changes:

- Added `Donation.photoUrl` and Supabase `donations.photo_url` mapping.
- Added photo upload and preview to the donor create form.
- Added photo replace and preview to the donor edit dialog.
- Stores uploaded image URLs in `donations.photo_url`.
- Displays food images in:
  - donor donation cards
  - NGO marketplace cards
  - NGO donation detail dialog
  - delivery job details
- Enriches delivery API/page job data with the related donation photo.
- Added `npm run storage:setup` for the `donation-photos` bucket.
- Added a safe upload fallback: if Supabase Storage is unavailable, small demo images are stored as data URLs in `photo_url`; if that also is not safe, the donation still saves without a photo and shows an error toast.

Phase 6 verification:

- `npm run storage:setup` attempted to create `donation-photos`, but Supabase rejected bucket creation with RLS because this environment only has the anon key.
- Created a donation with a persisted photo URL fallback and confirmed it appeared after donor refresh.
- Confirmed NGO marketplace API returned the same photo.
- Edited/replaced the donation photo and confirmed the new photo persisted.
- Confirmed delivery API returned `donationPhotoUrl` for a photo-enabled assigned job.
- Cleaned up the test donation and ran `npm run seed:demo` to restore the Bangalore demo baseline.
- `npm run build` passed.

## Phase 7 Complete: Donation Zones And Predictive Insights

NGO Analytics now includes a demo-friendly Donation Zones & Predictions section for Bangalore.

Phase 7 changes:

- Added city-wide zone analysis using current Supabase donation rows.
- Supported Bangalore zones:
  - Koramangala
  - Indiranagar
  - Jayanagar
  - Whitefield
  - HSR Layout
  - MG Road
  - Electronic City
  - JP Nagar
  - Malleshwaram
  - Marathahalli
  - Hebbal
- Added zone cards showing:
  - donation count
  - total quantity/meals
  - common food type
  - active/open donations
  - completed donations
  - predicted peak window
  - recommendation
- Added a polished Bangalore map-style panel with top zone markers.
- Added a top insight card summarizing the highest activity zone.
- Labeled the feature honestly as: "AI-assisted prediction based on recent donation patterns."

Prediction logic:

- Highest donation count = highest activity zone.
- Open/active urgent donations = needs immediate NGO attention.
- Most common food type = likely upcoming food type.
- Active donations = likely next pickup zone.
- Pickup/prepared/created time buckets produce Morning, Afternoon, and Evening labels; weak overnight data falls back to Evening for the demo.
- No trained ML model is used.

Phase 7 verification:

- `npm run seed:demo` passed.
- Supabase seed data produced 8 Bangalore donation zones.
- Local NGO Analytics page returned HTTP 200 and included the prediction label plus seeded zones.
- Empty-data handling is present with a no-zone-data state.
- `npm run build` passed.

Phase 7 UI refinement:

- Replaced the earlier fake zone panel with a Bangalore-centered map-style panel.
- Added clear labelled marker chips for top zones.
- Moved all zone items into one fixed-height scrollable list.
- Made zone cards compact while preserving area, count, common food, active count, peak window, and recommendation.
- Added a hydration-safe typewriter animation for the top insight with reduced-motion support.

Donation Zones layout cleanup:

- Replaced artificial overlaid marker chips with a cleaner Bangalore map context panel and an "Open in Google Maps" action.
- Added a transparent 0-100 rule-based prediction score for each zone:
  - recent donation count: 40%
  - active/open donations: 25%
  - urgent donations: 15%
  - repeated/common food category pattern: 10%
  - peak time consistency: 10%
- Added High, Medium, and Low predicted activity labels using the requested score bands.
- Added a "How prediction works" note that states the feature uses recent Bangalore donation patterns, not a trained ML model.
- Moved Top Partnerships, Impact Mix, Response Trends, and compact impact stats into the right analytics column.
- Kept the compact Top Insight typewriter animation inside the Donation Zones section.

## Phase 8 Complete: Role-Specific Sharebite AI Assistant

Sharebite AI now behaves differently for donors, NGOs, and delivery partners while keeping core actions deterministic.

Phase 8 changes:

- Added role-specific chatbot prompt chips:
  - Donor: create donation, edit rules, photo guidance, required details
  - NGO: today's donation update, accept-first priority, donation zones, match score
  - Delivery: next action, route help, status dropdown, urgent pickup
- Added a visible loading state: "Sharebite AI is thinking..." with animated dots.
- Disabled sends while waiting and added duplicate-send protection.
- Added a donor guided donation wizard in the chat panel.
- The donor wizard collects structured fields, shows a summary, and creates the donation only after confirmation.
- The wizard uses the existing `/api/donations` creation path, so Phase 1 role checks and match generation still apply.
- Added role-aware `/api/chat` behavior backed by the current session role.
- NGO answers use live Supabase data for open donations, match suggestions, donation zones, and analytics.
- Delivery answers use live delivery jobs plus related donation urgency to recommend the next pickup and route/status guidance.
- Gemini is optional and only rewrites deterministic answers. If Gemini is unavailable, rate-limited, or fails, deterministic fallback responses are returned.
- Expanded Bangalore seed data with more donors, a backup delivery user, more open/active/completed/cancelled donations, sample photo URLs, more match suggestions, more delivery jobs, and analytics snapshots for multiple NGOs.

Phase 8 verification:

- `npm run seed:demo` passed and recreated 18 profiles, 5 NGO profiles, 15 donations, 14 match suggestions, 6 delivery jobs, and 42 analytics snapshots.
- Programmatic donor creation through the same API path used by the chat wizard created a test donation and generated 5 matches.
- NGO chatbot "Give me today's donation update" returned live open donation counts and examples.
- NGO chatbot "Explain donation zones" returned a Bangalore zone summary from current donation rows.
- Delivery chatbot "What should I do next?" returned the next active pickup from current delivery jobs.
- Donor -> NGO -> delivery workflow test passed: donor created, NGO accepted, delivery job appeared, delivery set `in_transit`, and donor/NGO views reflected `in_transit`.
- `npm run seed:demo` was run after workflow testing to restore the Bangalore baseline.
- `npm run build` passed.

## Known Remaining Issues

- `npm run lint` still has pre-existing lint failures and was not made a Phase 1 blocker.
- One pre-existing inconsistent live demo row remains quarantined/documented instead of deleted.
- Supabase Storage bucket creation still requires service-role/admin setup; the app keeps the Phase 6 small-image fallback.
