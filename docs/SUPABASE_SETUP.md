# Supabase Setup Guide for FoodBridge

## Overview
FoodBridge has been migrated from an in-memory data store to a persistent Supabase PostgreSQL database. This ensures that the demo state, user profiles, and donation flows persist across server restarts.

## Schema
The database uses a simplified relational schema optimized for the demo happy path.

### Tables
1. **profiles**: Stores user information, including role (`donor`, `ngo`, `delivery`). Passwords are in plain text for demo simplicity.
2. **ngo_profiles**: Stores additional metadata for NGOs such as acceptance rate and capacity.
3. **donations**: Core entity representing a food donation, tracking its status (`open`, `accepted`, `picked_up`, `delivered`).
4. **match_suggestions**: Stores generated NGO match recommendations for open donations based on location, capacity, and acceptance rate.
5. **delivery_jobs**: Tracks the assignment of a delivery partner to an accepted donation.
6. **analytics_snapshots**: Historical analytics data for NGOs.

## Environment Variables
The application requires the following environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: The Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for Supabase access.

## Architecture
- `src/lib/supabase.ts`: Initializes the Supabase client.
- `src/lib/store.ts`: Has been refactored to query Supabase directly using the `@supabase/supabase-js` client. The original TypeScript interfaces are preserved and mapped appropriately to database `snake_case` fields.

## Seeding
The initial demo data was migrated using `supabase-seed.js` to populate users, NGOs, and donations. `src/lib/seed.ts` is no longer needed for run-time data but serves as a reference for the original static arrays.
