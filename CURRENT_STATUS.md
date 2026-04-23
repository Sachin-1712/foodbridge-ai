# FoodBridge MVP - Current Status

## Core Architecture
- **Framework**: Next.js 15 App Router
- **Database**: Supabase (PostgreSQL) connected via MCP
- **Styling**: Tailwind CSS + Stitch Design System tokens
- **UI Components**: Custom components built with `lucide-react` for icons and consistent Stitch styling.
- **Authentication**: Simple demo-mode auth (role-based cookies `foodbridge-session-v2`) bypassing Supabase Auth for MVP simplicity.

## Implemented Features

### 1. Donor Dashboard
- **Create Donations**: Working form, pushes to Supabase `donations` table.
- **View Status**: Tracks the lifecycle of donations (Open -> Matched -> Accepted -> In Transit -> Delivered).

### 2. NGO Dashboard
- **Marketplace Feed**: Displays open donations.
- **Accept/Reject Flow**: NGOs can accept donations which immediately creates a `delivery_job` in Supabase.
- **Analytics**: Basic snapshot views using `recharts` to show meals rescued and other metrics over time.

### 3. Delivery Dashboard
- **Active Jobs**: Real-time view of `delivery_jobs` matching the driver's ID.
- **AI-Assisted Priority Reasoning**: 
  - *Heuristic AI*: Computes a 0-100 priority score based on urgency, expiry window, and distance (e.g. emergency tags add +40 points, <5km distance adds +10 points). 
  - *Explainability*: Displays a clear "AI Route Insight" card detailing why the route is prioritized.
- **Google Maps Integration**:
  - Embedded "AI-Assisted Route" deep link that dynamically opens Google Maps with the donor's pickup address as origin and NGO's drop-off address as destination.
- **Status Updates**: Drivers can update job status (Picked Up -> In Transit -> Delivered).

### 4. Global AI Assistant (Chatbot)
- **Status**: Live (if `GEMINI_API_KEY` is present in `.env.local`)
- **Integration**: `api/chat/route.ts` calls Google's `gemini-2.5-flash` model.
- **Fallback Logic**: If the Gemini API key is missing or the request fails, it gracefully degrades to a deterministic FAQ mode to ensure demo stability.

## Known Limitations / Demo Hacks
1. **Row Level Security (RLS)** is temporarily disabled on Supabase tables to allow the anonymous key to read/write seamlessly during the demo.
2. **Google Maps** routes use standard external links instead of complex embedded Directions API rendering to ensure reliability and avoid billing setups.
3. **Passwords** are stored in plain text for demo ease.
4. **AI Reasoning** for routes is heuristic (rule-based math) rather than live ML inference to ensure fast, predictable demonstration.
