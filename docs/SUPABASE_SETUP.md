# Sharebite Supabase Setup

This document outlines the Supabase schema and setup required for the Sharebite MVP.

## Schema Overview

The following tables are used to support the Donor → NGO → Delivery workflow:

### 1. `profiles`
Stores user profile information.
- `id`: UUID (Primary Key)
- `email`: Text
- `role`: Text ('donor', 'ngo', 'delivery')
- `name`: Text
- `organization_name`: Text (NGOs only)
- `created_at`: Timestamp

### 2. `donations`
Stores food donation details.
- `id`: UUID (Primary Key)
- `donor_id`: UUID (Foreign Key to profiles)
- `title`: Text
- `description`: Text
- `category`: Text
- `quantity`: Text
- `pickup_address`: Text
- `urgency`: Text ('low', 'medium', 'high')
- `status`: Text ('available', 'pickup_assigned', 'picked_up', 'in_transit', 'delivered')
- `created_at`: Timestamp
- `accepted_by_ngo_id`: UUID (Foreign Key to profiles)

### 3. `delivery_jobs`
Stores delivery assignments.
- `id`: UUID (Primary Key)
- `donation_id`: UUID (Foreign Key to donations)
- `delivery_partner_id`: UUID (Foreign Key to profiles)
- `status`: Text ('assigned', 'accepted', 'picked_up', 'in_transit', 'delivered')
- `pickup_address`: Text
- `delivery_address`: Text
- `distance_km`: Numeric
- `estimated_duration_mins`: Integer
- `created_at`: Timestamp

## Environment Variables

Ensure the following variables are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Seeding Data

A seed script is available at `scripts/supabase-seed.js`. Run it using:
```bash
node scripts/supabase-seed.js
```
This script populates the database with demo users (Donor, NGO, Delivery Partner) and sample donations to ensure a functional starting point for demonstrations.
