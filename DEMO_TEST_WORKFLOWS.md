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

Use the current FoodBridge demo accounts until the Phase 9 Sharebite login change is implemented:

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
