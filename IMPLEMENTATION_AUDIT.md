# Implementation Audit

Date: 2026-05-03

## Current Schema Summary

Supabase was inspected through the configured Supabase client because no Supabase MCP tool was available in this session.

Observed tables:

- `profiles`: 4 rows. Columns: `id`, `name`, `email`, `password`, `role`, `organization_name`, `phone`, `area`, `avatar_url`, `created_at`.
- `ngo_profiles`: 2 rows. Columns: `id`, `user_id`, `name`, `supported_food_types`, `max_daily_capacity`, `area`, `latitude`, `longitude`, `acceptance_rate`, `active_status`.
- `donations`: 5 rows. Columns: `id`, `donor_id`, `title`, `category`, `food_type`, `quantity`, `unit`, `urgency`, `prepared_at`, `expires_at`, `pickup_start`, `pickup_end`, `location_name`, `latitude`, `longitude`, `notes`, `is_vegetarian`, `status`, `accepted_by_ngo_id`, `created_at`, `photo_url`.
- `delivery_jobs`: 3 rows. Columns: `id`, `donation_id`, `donor_id`, `ngo_id`, `delivery_partner_id`, `pickup_address`, `drop_address`, `eta_minutes`, `distance_km`, `status`, `donation_title`, `created_at`, `updated_at`.
- `match_suggestions`: 2 rows. Columns: `id`, `donation_id`, `ngo_id`, `score`, `reason`, `rank`.
- `analytics_snapshots`: 0 rows.

Inferred relationships:

- `ngo_profiles.user_id` references `profiles.id`.
- `donations.donor_id` references `profiles.id`.
- `donations.accepted_by_ngo_id` references `profiles.id`.
- `delivery_jobs.donation_id` references `donations.id`.
- `delivery_jobs.donor_id`, `delivery_jobs.ngo_id`, and `delivery_jobs.delivery_partner_id` reference `profiles.id`.
- `match_suggestions.donation_id` references `donations.id`.
- `match_suggestions.ngo_id` references `profiles.id`.

Storage:

- No Supabase Storage buckets currently exist.
- `donations.photo_url` exists in the database, but the TypeScript `Donation` type and mapper do not currently expose it.

Current status values in live data:

- Donation statuses found: `delivered`, `open`, `picked_up`.
- Delivery job statuses found: `delivered`, `picked_up`.
- TypeScript also defines donation statuses `matched`, `accepted`, `pickup_assigned`, `in_transit`, and `cancelled`, and delivery statuses `assigned`, `accepted`, and `in_transit`.

## Current App Flow Summary

Routes:

- Public routes: `/`, `/login`.
- Dashboards: `/dashboard/donor`, `/dashboard/donor/new`, `/dashboard/ngo`, `/dashboard/ngo/analytics`, `/dashboard/delivery`.
- API routes: `/api/auth`, `/api/donations`, `/api/delivery`, `/api/chat`.

Auth and access:

- Auth is demo-only cookie auth using `foodbridge-session-v2`.
- Login checks `profiles.email` and plain text demo password.
- Dashboard layout requires a session.
- Individual dashboard pages redirect users away from the wrong role.
- Middleware only checks whether a session cookie exists; it does not verify role or profile integrity.

Donation create flow:

- Donor form posts `action: create` to `/api/donations`.
- API inserts a donation with status `open`.
- API generates match suggestions after insert.
- Donor dashboard reads donations by `donor_id`.

NGO accept/reject flow:

- NGO dashboard reads open donations through `getOpenDonations()`.
- Open donations are enriched with match score and reason.
- NGO accept posts `action: accept` to `/api/donations`.
- API updates the donation to `accepted` and assigns `accepted_by_ngo_id`.
- API then creates a `delivery_jobs` row.
- Reject is acknowledged but not persisted.

Delivery flow:

- Delivery dashboard reads jobs assigned to the current delivery partner.
- Delivery status buttons advance through `assigned`, `accepted`, `picked_up`, `in_transit`, `delivered`.
- `/api/delivery` updates the delivery job status and maps that status back to the donation status.
- Donor, NGO, and delivery dashboards use `RevalidationTimer` to refresh periodically.

Chatbot:

- Chat panel receives `userRole`, but the current `/api/chat` request does not pass role context to the API.
- `/api/chat` attempts Gemini when `GEMINI_API_KEY` exists.
- Fallback responses are deterministic FAQ text.
- Chatbot copy still uses the old app naming and generic role behavior.

Seed and docs:

- `scripts/seed.js`, `scripts/supabase-seed.js`, and `src/lib/seed.ts` still contain London/Covent Garden data.
- Live Supabase data is already partly Bangalore-localized, so the database and local seed scripts are out of sync.
- Existing docs still use old app branding and include stale schema descriptions.

## What Is Currently Working

- `npm run build` passes.
- The main app routes compile under Next.js 16.
- Demo login exists for donor, NGO, and delivery accounts.
- Role dashboard redirects exist at the page level.
- Donor creation, NGO marketplace, NGO acceptance, delivery job creation, and delivery status syncing are already partly implemented.
- Google Maps deep links and embedded map previews exist in the delivery dashboard.
- Gemini chatbot route exists and has a deterministic fallback.
- Dashboard periodic refresh is already implemented.

## Broken Or Risky Areas

- `npm run lint` currently fails with pre-existing errors across seed scripts, chatbot API typing, store mappers, and UI components.
- API routes do not strongly enforce role-specific actions:
  - `/api/donations` create does not check that the current user is a donor.
  - `/api/donations` accept/reject does not check that the current user is an NGO.
  - `/api/delivery` does not check that the current user is a delivery partner or owns the job.
- Live Supabase contains one inconsistent demo row where an NGO user created a donation and related delivery job as the donor.
- `ngo_profiles.supported_food_types` is returned as a stringified JSON value, but app matching logic treats it as an array.
- `getOpenDonations()` includes `open` and `matched`, but current live open donation has no match suggestions.
- NGO in-progress tab currently filters `accepted`, `picked_up`, and `in_transit`, but omits `pickup_assigned`.
- Donation acceptance can create delivery jobs without first checking whether a job already exists for that donation.
- Donation acceptance uses a hard-coded delivery partner id.
- Donation and delivery statuses are split into separate enums and can drift.
- `donations.photo_url` exists in Supabase, but app code does not use it yet.
- No Supabase Storage bucket exists for food photos.
- `analytics_snapshots` is empty, so analytics currently depends on dynamic fallback or accepted donation history.
- Existing seed scripts use different id formats and stale locations.
- `.env.local` is ignored by git, as required.

## Data Missing Or Out Of Sync

- Missing storage bucket: `donation-photos`.
- Missing app type support for `donations.photo_url`.
- Missing clean Bangalore seed script aligned with current live schema.
- Missing analytics snapshot seed rows.
- Missing role-verified Sharebite demo accounts and emails.
- Missing current status/docs files requested for later phases, such as `CURRENT_STATUS.md` and `DEMO_TEST_WORKFLOWS.md`.
- Existing `DEMO_WORKFLOWS.md` was referenced in the IDE tabs, but no matching file was found during repo file search.

## Requested Features Already Partly Present

- Simplify language: not implemented; app still uses dense operational wording.
- Minor UI polish: UI is polished, but copy and some controls need simplification.
- Bangalore localization: partially present in live Supabase, not present in local seed scripts or most docs.
- Status update dropdown: not present; delivery uses click-to-advance buttons.
- Donation zones and prediction insights: not present.
- Food photo upload: database has `photo_url`, but no storage bucket or UI flow exists.
- Role-specific chatbot: partially present in initial panel copy only; API prompt is not role-specific.
- Rename website to Sharebite: not present.
- Role-based login/access control: page-level redirects exist, but login is auto role-card based and APIs do not verify selected role/action role.
- Donor edit/delete before pickup: not present.

## Safest Implementation Order

1. Phase 1 - Stabilize core donor to NGO to delivery workflow.
   - Add API role checks.
   - Normalize `supported_food_types` mapping.
   - Prevent duplicate delivery jobs on accept.
   - Ensure donation and delivery statuses stay synchronized.
   - Include `pickup_assigned` in NGO in-progress views.
   - Test with a fresh valid donor-created donation.
   - Do not delete the inconsistent live demo row; quarantine it as known bad data.

2. Phase 2 - Rename visible branding to Sharebite and simplify copy.
   - Do not rename database tables.
   - Keep this mostly UI copy and metadata only.

3. Phase 3 - Localize demo data and seed scripts for Bangalore.
   - Replace London data in scripts and docs.
   - Build a safe reseed path that is explicit about demo rows.

4. Phase 4 - Add status dropdown.
   - Normalize status values before adding the dropdown UI.

5. Phase 5 - Add donor edit/delete before pickup.
   - Enforce both UI disablement and API/server blocking.

6. Phase 6 - Add food photo upload.
   - Prefer Supabase Storage bucket `donation-photos`.
   - Reuse existing `photo_url` or migrate to a clearly named app field.

7. Phase 7 - Add donation zones and predictive insights.
   - Use deterministic Bangalore-area grouping first.
   - Add Gemini summary only if stable.

8. Phase 8 - Improve role-specific chatbot.
   - Pass role context to `/api/chat`.
   - Update system prompt and fallback text.

9. Phase 9 - Add role-verified demo login.
   - Verify selected role against `profiles.role`.
   - Keep auth demo-friendly.

10. Phase 10 - Final UI polish and deployment readiness.
    - Update docs and run full demo workflow.
