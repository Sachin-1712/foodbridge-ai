# Sharebite Demo MVP — Product Requirements Document

## 1. Project Summary

Sharebite is a demo-ready food waste redistribution web application inspired by the clarity and low-friction workflow of Too Good To Go, but adapted for donation redistribution rather than consumer resale. The app connects food donors, NGOs, and delivery partners through three role-based dashboards. The goal is not a production system. The goal is a polished final-year-project MVP that convincingly demonstrates the core workflow end to end.

This PRD intentionally narrows the original brief into a buildable demo scope:
- Donor posts surplus food
- System ranks likely NGO matches
- NGO accepts a donation
- Delivery partner receives a job and updates status
- Donor and NGO see progress and impact
- AI assists with chatbot support and lightweight analytics summaries

## 2. Context From Brief

The uploaded brief defines Sharebite as an AI-powered food waste management system with three core modules:
- Client / Donor
- Delivery Partner
- NGO / Recipient

It also calls for four AI-oriented features:
- AI chatbot
- Donor–NGO smart matching
- Delivery route optimization
- Waste analytics summary

The brief suggests a classic React + Node + MySQL stack, but the client has explicitly approved using any stack that is fastest for a convincing demo MVP.

## 3. Product Goal

Deliver a professional-looking, working demo that shows teachers:
1. the platform solves a real problem
2. the three roles are clearly separated
3. the happy path works from posting to delivery completion
4. AI features are meaningfully represented
5. the app looks modern and intentional, not like a rushed student CRUD build

## 4. Success Criteria

The MVP is successful if:
- all 3 dashboards work with seeded demo accounts
- a full donor → NGO → delivery flow can be demoed in under 5 minutes
- statuses update consistently across views
- charts and impact metrics are visible
- chatbot responds with relevant platform guidance
- the UI feels polished and coherent on a laptop
- the app can be run locally and ideally deployed after polish

## 5. Non-Goals

These are explicitly out of scope for the first demo build:
- enterprise-grade security hardening
- robust signup and approval workflows
- live GPS tracking
- real traffic-based route optimization
- real-time websockets everywhere
- complex notification infrastructure
- mobile app
- fraud prevention, donor verification, NGO compliance workflows
- advanced ML training or embeddings pipelines
- deep analytics accuracy beyond seeded/demo data

## 6. Product Inspiration

Use Too Good To Go as UX inspiration for:
- simple listing creation
- time-window-based pickup logic
- clear status tracking
- quick discovery of nearby opportunities
- visible environmental impact and saved-meal metrics

Do not clone their exact UX or branding. Use the inspiration to keep the flow simple, modern, and easy to demo.

## 7. User Roles

### 7.1 Donor
Example users:
- restaurant
- bakery
- event organizer
- household donor

Core needs:
- quickly list surplus food
- indicate quantity and urgency
- know who accepted it
- track delivery progress
- see social/environmental impact

### 7.2 NGO / Recipient
Core needs:
- view relevant nearby donations
- quickly understand what is available
- accept or reject based on capacity
- see incoming schedule
- view simple insights and trends

### 7.3 Delivery Partner
Core needs:
- see assigned pickup and drop jobs
- view pickup and drop sequence
- update delivery progress
- follow a route suggestion or open maps quickly

## 8. Proposed Tech Stack for Fastest MVP Delivery

This is the recommended build stack for the demo:

### Frontend + Backend
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts for analytics charts

### Data
- Supabase Postgres
- Prisma ORM or direct Supabase queries
- Seed script for realistic demo data

### Auth
Two acceptable options:
1. Fastest: demo credentials with role-based session mock
2. Slightly stronger: Better Auth or NextAuth with seeded users

Recommended for first pass:
- start with demo credentials and role guard
- upgrade only if time remains

### AI
- OpenAI API for:
  - chatbot
  - analytics summary
  - optional match explanation text

Fallback if API key is missing:
- deterministic mock responses

### Maps / Routing
- Google Maps embed or deep link
- simple route ordering logic in app
- no full optimization engine in v1

### Deployment
- local first
- deployment later after core flow stabilizes

## 9. Product Principles

1. Demo first, architecture second  
2. Happy path over edge cases  
3. One codebase, minimal overhead  
4. Seeded realism beats empty-state purity  
5. AI should support the story, not block delivery  
6. Every screen should be immediately understandable in a demo  

## 10. Core User Journeys

### Journey A: Donor posts surplus food
1. Donor logs in
2. Donor fills donation form
3. Donation is saved with status `open`
4. System generates ranked NGO suggestions
5. Donor sees listing in dashboard with pending status

### Journey B: NGO accepts donation
1. NGO logs in
2. NGO sees feed of available donations
3. NGO opens donation detail
4. NGO sees smart match score / reason
5. NGO accepts donation
6. Donation status becomes `accepted`
7. Delivery task is created

### Journey C: Delivery completes task
1. Delivery partner logs in
2. Delivery dashboard shows assigned pickup
3. Delivery partner views route card
4. Delivery partner updates status:
   - accepted
   - picked_up
   - in_transit
   - delivered
5. Donor and NGO dashboards reflect updates

### Journey D: Analytics + AI support
1. NGO opens analytics dashboard
2. NGO sees charts and impact cards
3. NGO views an AI-generated trend summary
4. Any user can ask the chatbot platform questions

## 11. MVP Feature Set

## 11.1 Authentication
### Required
- login page
- 3 seeded demo accounts
- role-based redirects
- protected dashboard routes

### Nice to have
- “continue as demo donor / NGO / delivery” quick login buttons

## 11.2 Donor Dashboard
### Required
- overview cards:
  - total donations
  - meals donated
  - NGOs helped
  - impact score
- create donation form
- recent donation list
- donation status badges
- donation detail drawer/modal

### Donation form fields
- title
- food type
- category
- quantity
- unit
- cooked/prepared at
- expiry / urgency
- pickup window
- donor location / area
- notes
- vegetarian / non-vegetarian flag
- image optional

### Optional
- “recommended NGO” preview after submit

## 11.3 NGO Dashboard
### Required
- donation feed
- filters:
  - category
  - urgency
  - distance
- smart ranked list
- accept / reject action
- incoming schedule
- accepted donations list

### Required detail view
- donor name
- food type
- quantity
- urgency
- pickup window
- rough distance
- smart match reason

## 11.4 Delivery Dashboard
### Required
- assigned jobs list
- pickup card
- drop card
- status timeline
- route summary
- open in Google Maps button

### Manual status actions
- accept job
- mark picked up
- mark in transit
- mark delivered

## 11.5 AI Chatbot
### Required
- floating assistant or dedicated help panel
- preloaded platform knowledge
- answers:
  - how to create a listing
  - what statuses mean
  - how matching works
  - what to do if a donation is urgent

### Fallback
- prewritten FAQ responses if API unavailable

## 11.6 Smart Matching
### Required
A score-based engine that ranks NGOs based on:
- distance
- food category compatibility
- urgency
- NGO capacity
- historical acceptance ratio
- pickup window compatibility

This does not need ML in v1.
A deterministic weighted score is enough.

### Example output
- NGO A — 92 match
- NGO B — 84 match
- NGO C — 71 match

### Optional
- LLM-generated 1-line explanation:
  “Ranked highest because this NGO is nearby, currently accepting cooked meals, and has strong urgent-response history.”

## 11.7 Route Suggestion
### Required
- simple route card
- donor → NGO sequence
- estimated distance and ETA
- open Google Maps link

### Simplification
No dynamic multi-stop traffic optimization needed for v1.
If multiple tasks exist, use nearest-first or urgency-first ordering.

## 11.8 NGO Analytics
### Required
- metrics cards:
  - donations received this week
  - meals rescued
  - top donor type
  - average acceptance time
- 2–3 simple charts:
  - donations by day
  - donations by category
  - acceptance trend
- AI insight box summarizing trends

### Example insight
“Cooked meal donations peak on weekends, while bakery items are most commonly accepted in the evening.”

## 12. Information Architecture

### Public routes
- `/`
- `/login`

### Role routes
- `/dashboard/donor`
- `/dashboard/ngo`
- `/dashboard/delivery`

### Supporting routes
- `/dashboard/donor/new`
- `/dashboard/ngo/feed`
- `/dashboard/delivery/jobs`
- `/api/chat`
- `/api/analytics/summary`
- `/api/match/:donationId`
- `/api/maps/route/:jobId`

## 13. Suggested UI Direction

Design language:
- clean, modern, impact-driven
- light background or muted neutral theme with strong accent colors
- premium dashboard polish, not generic AI gradients
- cards with good spacing and hierarchy
- strong typography, meaningful status colors
- subtle motion only where useful

Visual cues:
- green / teal for impact and rescued food
- amber / red for urgency
- blue / indigo for logistics
- NGO analytics should feel trustable and operational
- donor experience should feel optimistic and social-impact-oriented

## 14. Data Model

## 14.1 User
- id
- name
- email
- password_hash or demo-only token
- role (`donor`, `ngo`, `delivery`)
- organization_name
- phone
- area
- created_at

## 14.2 NGOProfile
- id
- user_id
- supported_food_types
- max_daily_capacity
- area
- latitude
- longitude
- acceptance_rate
- active_status

## 14.3 Donation
- id
- donor_id
- title
- category
- food_type
- quantity
- unit
- urgency (`low`, `medium`, `high`)
- prepared_at
- expires_at
- pickup_start
- pickup_end
- location_name
- latitude
- longitude
- notes
- status (`open`, `matched`, `accepted`, `pickup_assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`)
- created_at

## 14.4 MatchSuggestion
- id
- donation_id
- ngo_id
- score
- reason
- rank

## 14.5 DeliveryJob
- id
- donation_id
- donor_id
- ngo_id
- delivery_partner_id
- pickup_address
- drop_address
- eta_minutes
- distance_km
- status (`assigned`, `accepted`, `picked_up`, `in_transit`, `delivered`)
- created_at
- updated_at

## 14.6 AnalyticsSnapshot
- id
- ngo_id
- date
- donations_received
- meals_rescued
- avg_acceptance_time
- top_category
- summary_text

## 15. Matching Logic

Use a transparent weighted formula.

### Example weights
- distance: 35%
- category fit: 20%
- urgency readiness: 20%
- current capacity: 15%
- historical reliability: 10%

### Formula sketch
`total_score = distance_score + category_score + urgency_score + capacity_score + reliability_score`

Rules:
- closer NGO = higher score
- unsupported category = heavy penalty
- no capacity = disqualify
- urgent donations prefer NGOs with strong urgent-response history

## 16. Demo Seed Data

Seed the app with:
- 1 donor account
- 2 NGO accounts
- 1 delivery account
- 8–12 example donations
- 6 delivery jobs across statuses
- enough analytics rows to populate charts
- at least 1 urgent cooked meal case for the demo

### Demo accounts
- donor@foodbridge.demo / demo123
- ngo@foodbridge.demo / demo123
- delivery@foodbridge.demo / demo123

Optional extra:
- second NGO to show ranking comparisons

## 17. AI Behavior Requirements

## 17.1 Chatbot prompt behavior
The chatbot should:
- answer only platform-related questions
- stay concise
- guide users to the next action
- explain statuses in simple language
- avoid making promises about real delivery logistics

## 17.2 Analytics summary prompt behavior
Input:
- aggregated data from analytics query
Output:
- 2–4 sentence operational summary
- include one recommendation if possible

## 17.3 Match explanation prompt behavior
Input:
- donation info
- ranked NGO candidates
Output:
- short explanation of why the top NGO was ranked first

## 18. Edge Cases To Handle Lightly

Must handle:
- no donations yet
- no NGO matches found
- no delivery jobs assigned
- missing AI key
- simple loading and error states

Can be simplified:
- duplicate submissions
- overlapping pickup windows
- stale session recovery
- multi-delivery re-optimization

## 19. Acceptance Criteria

### Functional
- donor can create a donation
- NGO can see and accept it
- delivery job appears
- delivery status can be updated
- dashboards reflect the current state
- analytics render
- chatbot works or cleanly falls back

### UX
- app is responsive enough for laptop demo
- pages load with visible structure and hierarchy
- statuses are color-coded and readable
- no obviously broken routes or placeholder screens

### Technical
- project runs from documented commands
- `.env.example` exists
- seed script works
- main flow is testable without manual DB editing

## 20. Build Plan

## Phase 1 — Foundation
- scaffold Next.js app
- set up Tailwind and shadcn
- create app shell and role routing
- set up database and seeds
- build demo login

## Phase 2 — Core Workflow
- donor form and donor list
- NGO feed and accept action
- delivery dashboard and status controls
- state propagation across dashboards

## Phase 3 — AI + Analytics
- chatbot endpoint
- analytics charts
- summary insight box
- match reasoning text
- map deep links

## Phase 4 — Polish
- empty states
- loaders
- toasts
- route guards
- consistent spacing and status badges
- demo rehearsal

## 21. Demo Script

Use this exact story in the final demo:

1. Log in as donor
2. Create a new urgent donation:
   - “30 Veg Meals”
   - urgent
   - pickup within 1 hour
3. Show that the donation appears in donor history
4. Switch to NGO dashboard
5. Show the ranked donation at or near the top
6. Open detail and explain why it was matched
7. Accept the donation
8. Switch to delivery dashboard
9. Show new assigned pickup
10. Open route card and Google Maps button
11. Move through status updates
12. Return to donor dashboard and show completion
13. Open NGO analytics and AI summary
14. Ask chatbot: “Why was this NGO matched first?”

Target length:
4 to 5 minutes

## 22. Risk Register and Fallbacks

### Risk: AI API not ready
Fallback:
- mock chatbot responses
- mock analytics summary
- preserve UI and feature story

### Risk: Google Maps API friction
Fallback:
- use maps deep links instead of embedded API
- keep route card internal

### Risk: auth taking too long
Fallback:
- use seeded demo login with simple credentials
- protect routes with session cookie or mock auth

### Risk: database setup delay
Fallback:
- use local JSON/mock repository for first UI pass
- wire real DB after flow works

## 23. Definition of Done

This project is done for demo MVP when:
- the app can be opened and logged into with demo accounts
- the main three dashboards are present and polished
- the happy path works end to end
- the demo can be performed without touching the database manually
- there are no major broken pages or unfinished dead ends
- the product tells a believable, professional story

## 24. Final Instruction To Builder

This is a demo-first academic MVP. Build for credibility, clarity, and smooth presentation. Prefer working, polished shortcuts over ambitious architecture.
