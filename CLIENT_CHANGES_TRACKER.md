# Client Changes Tracker

Date created: 2026-05-03

Status key:

- `[ ]` Not started
- `[~]` Partly exists or needs cleanup
- `[x]` Completed

## Requested Changes

- [x] 1. Simplify language
  - Replaced dense operational wording with clear demo-friendly labels.
  - Completed examples:
    - "Efficient Altruism Starts Here" to "Share Extra Food Easily"
    - "Plant-Based Registry" to "Vegetarian Food"
    - "Deployment Parameters" to "Pickup Details"
    - "Priority Protocol" to "Pickup Urgency"
    - "Operational Directives" to "Notes"
    - "Strategic Advisor" to "AI Suggestion"
    - "Impact Intelligence" to "Donation Insights"
    - "Mission Segment" to "Donation"
    - "Route Intelligence" to "Route Suggestion"
    - "Intelligence Node" to "Sharebite AI"

- [~] 2. Minor UI polish
  - The app already has a polished dashboard UI.
  - Needs final spacing, copy clarity, dropdown/upload styling, and consistency pass after functional phases.

- [~] 3. Localize places to India/Bangalore
  - Live Supabase data is already partly Bangalore-localized.
  - Local seed scripts and docs still contain London/Covent Garden data.
  - Planned Bangalore areas include Koramangala, Indiranagar, Jayanagar, Whitefield, HSR Layout, MG Road, Electronic City, JP Nagar, Malleshwaram, Marathahalli, and Hebbal.

- [ ] 4. Status update dropdown
  - Current delivery dashboard uses click-to-advance buttons.
  - Planned statuses:
    - Open
    - Accepted
    - Pickup Assigned
    - Picked Up
    - In Transit
    - Delivered
    - Cancelled

- [ ] 5. Donation zones + map/prediction insights
  - Not implemented.
  - Planned for NGO Analytics and optionally Delivery map panel.
  - Should be labeled: "AI-assisted prediction based on recent donation patterns."

- [~] 6. Food photo upload
  - Supabase `donations.photo_url` column already exists.
  - No Supabase Storage bucket exists.
  - No create/edit UI upload or card image display exists.
  - Preferred bucket name: `donation-photos`.

- [~] 7. Role-specific chatbot
  - Chat panel has role-specific greeting text.
  - `/api/chat` does not receive or use role context yet.
  - Phase 2 updated chatbot labels, fallback text, and Gemini system prompt to use Sharebite naming.
  - Role-specific API behavior is still planned for Phase 8.

- [x] 8. Rename website to Sharebite
  - Visible app branding, metadata, chatbot labels, README, and setup/deployment docs now use Sharebite.
  - Database table names should not be renamed unless necessary.

- [~] 9. Role-based login/access control
  - Dashboard pages redirect users based on `profiles.role`.
  - Login currently auto-logs in from role cards using legacy demo emails.
  - Phase 1 added API role checks for donor donation creation, NGO accept/reject, and delivery job updates.
  - Login still needs selected-role verification in Phase 9.
  - Planned demo accounts:
    - `donor@sharebite.demo` / `demo123`
    - `ngo@sharebite.demo` / `demo123`
    - `delivery@sharebite.demo` / `demo123`

- [ ] 10. Donor edit/delete before pickup
  - Not implemented.
  - Planned editable fields:
    - title
    - food type/category
    - quantity
    - urgency
    - pickup address
    - pickup window/time
    - notes
    - vegetarian flag
  - Donor can edit/delete only when status is `open`, `accepted`, or `pickup_assigned`.
  - Donor cannot edit/delete when status is `picked_up`, `in_transit`, or `delivered`.

## Phase Progress

- [x] Phase 0 - Inspect repo and Supabase database.
- [x] Phase 0 - Create `IMPLEMENTATION_AUDIT.md`.
- [x] Phase 0 - Create `CLIENT_CHANGES_TRACKER.md`.
- [x] Phase 1 - Stabilize cross-role donation workflow.
- [x] Phase 2 - Rename app to Sharebite and simplify copy.
- [ ] Phase 3 - Localize demo data for Bangalore.
- [ ] Phase 4 - Add status dropdown.
- [ ] Phase 5 - Add donor edit and delete controls.
- [ ] Phase 6 - Add food photo upload.
- [ ] Phase 7 - Add donation zones and predictive insights.
- [ ] Phase 8 - Improve role-specific Sharebite AI assistant.
- [ ] Phase 9 - Add role-verified demo login.
- [ ] Phase 10 - Final UI polish and deployment readiness.

## Current Phase 0 Notes

- `npm run build` passed during inspection.
- `npm run lint` failed with pre-existing lint issues.
- One inconsistent live demo row was found where an NGO user appears as the donor. Per user confirmation, Phase 1 should quarantine/document this and prevent repeats rather than deleting data now.
- Supabase Storage currently has no buckets.
- The database already has a `photo_url` column, which can support Phase 6 after app types and upload flow are added.

## Current Phase 1 Notes

- Added API role checks so only donors can create donations, only NGOs can accept/reject donations, and only delivery users can update delivery jobs.
- Normalized `ngo_profiles.supported_food_types` so matching works when Supabase returns an array or stringified JSON.
- NGO acceptance now uses a delivery user lookup instead of a hard-coded delivery partner id.
- Duplicate delivery jobs are prevented by reusing/updating an existing job for the donation if one exists.
- Donation status is set to `pickup_assigned` when a delivery job is assigned, then delivery updates sync it through `picked_up`, `in_transit`, and `delivered`.
- NGO current/in-progress view now includes `pickup_assigned`.
- Phase 1 workflow test passed with donation `4aa4acf8-f595-4241-ab49-025eb3e6194c` and delivery job `5d7d24d1-7a09-4c1b-a99b-36e04a0f3c08`.

## Current Phase 2 Notes

- Renamed visible app branding to Sharebite across login, sidebar/mobile header, metadata, chatbot labels, README, deployment docs, and setup/design docs.
- Simplified high-friction copy across donor, NGO, delivery, analytics, and chatbot surfaces while preserving the current Stitch UI structure.
- Updated chatbot fallback and Gemini system prompt to use Sharebite naming.
- No database table names, seed data, uploads, donation zones, dropdown status controls, or login behavior were changed.
- `npm run build` passed after the Phase 2 copy changes.
