# FoodBridge Design System — Stitch Specification

> Single source of truth for the FoodBridge UI, extracted from the Stitch design prototype exports.

---

## Color Palette (Material 3 — Extended)

### Core
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0f5238` | Primary actions, links, CTAs |
| `primary-container` | `#2d6a4f` | Active nav items, icon backgrounds, sidebar accent |
| `primary-fixed` | `#b1f0ce` | Match-score badges, light accents |
| `primary-fixed-dim` | `#95d4b3` | ETA badges, inverse-primary, muted accents |
| `on-primary` | `#ffffff` | Text on primary surfaces |
| `on-primary-container` | `#a8e7c5` | Sidebar logo text on dark green |
| `on-primary-fixed` | `#002114` | Text on primary-fixed surfaces |

### Secondary (Warm Amber)
| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#7d562d` | Delivery/partner buttons |
| `secondary-container` | `#ffca98` | Amber accent backgrounds |
| `secondary-fixed` | `#ffdcbd` | Warm light backgrounds |
| `on-secondary` | `#ffffff` | Text on secondary |

### Tertiary (Olive)
| Token | Hex | Usage |
|---|---|---|
| `tertiary` | `#464a30` | NGO role buttons |
| `tertiary-container` | `#5d6246` | NGO accent containers |
| `tertiary-fixed` | `#e1e6c2` | Olive light backgrounds |
| `on-tertiary` | `#ffffff` | Text on tertiary |

### Surfaces & Backgrounds
| Token | Hex | Usage |
|---|---|---|
| `background` / `surface` | `#f9f9f6` | Page background |
| `surface-container-lowest` | `#ffffff` | Cards, modals |
| `surface-container-low` | `#f4f4f0` | Chat bubbles (bot), subheaders |
| `surface-container` | `#eeeeeb` | Input backgrounds |
| `surface-container-high` | `#e8e8e5` | Hover states, separators |
| `surface-container-highest` | `#e2e3df` | Secondary containers |
| `surface-dim` | `#dadad7` | Disabled states |
| `surface-variant` | `#e2e3df` | Chip & badge backgrounds |

### Text (On-Surface)
| Token | Hex | Usage |
|---|---|---|
| `on-surface` | `#1a1c1a` | Primary text |
| `on-surface-variant` | `#404943` | Secondary text, descriptions |
| `on-background` | `#1a1c1a` | Body text |
| `outline` | `#707973` | Placeholder text, subtle borders |
| `outline-variant` | `#bfc9c1` | Card borders, dividers |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `error` | `#ba1a1a` | Error states, urgent badges |
| `error-container` | `#ffdad6` | Error backgrounds |
| `on-error` | `#ffffff` | Text on error |

---

## Typography

### Font Families
- **Headings**: `Plus Jakarta Sans` — weights 400, 500, 600, 700, 800
- **Body / Labels**: `Work Sans` — weights 400, 500, 600

### Scale
| Token | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| `h1` | 40px | 700 | 1.2 | Page titles |
| `h2` | 32px | 600 | 1.3 | Section headers |
| `h3` | 24px | 600 | 1.4 | Card titles, chat header |
| `body-lg` | 18px | 400 | 1.6 | Lead paragraphs |
| `body-md` | 16px | 400 | 1.6 | Default body text |
| `label-caps` | 12px | 600 | 1.0 | Uppercase labels (letter-spacing: 0.05em) |
| `status-badge` | 14px | 500 | 1.0 | Badge text |

---

## Spacing

| Token | Value | Usage |
|---|---|---|
| `unit` | 4px | Base unit |
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Small gaps |
| `md` | 16px | Default padding |
| `lg` | 24px | Section spacing |
| `gutter` | 24px | Grid gutters |
| `xl` | 48px | Large sections |
| `container-max` | 1440px | Max content width |

---

## Border Radius

| Token | Value |
|---|---|
| `DEFAULT` | 0.25rem (4px) |
| `lg` | 0.5rem (8px) |
| `xl` | 0.75rem (12px) |
| `full` | 9999px |

---

## Shadows

| Level | Value | Usage |
|---|---|---|
| Ambient 1 | `0 4px 12px rgba(45,106,79, 0.04)` | Cards, KPI tiles |
| Ambient 2 | `0 8px 24px rgba(45,106,79, 0.08)` | Elevated cards, hover |
| Ambient 3 | `0 8px 32px rgba(45,106,79, 0.12)` | AI widget, chat bubbles |
| Sidebar | `shadow-xl` (Tailwind) | Fixed sidebar |
| FAB | `0 8px 24px rgba(45,106,79, 0.25)` | Floating action button |

---

## Component Patterns

### Sidebar (Desktop)
- Width: `w-64` (256px)
- Background: `white`, border-right `border-slate-200`
- Logo: `w-10 h-10` rounded-lg with `bg-primary-container`
- Active item: `bg-[#2D6A4F]/10 text-[#2D6A4F] font-semibold`
- Inactive item: `text-slate-600 hover:bg-slate-100`
- CTA button: `bg-primary-container text-on-primary` full-width, rounded-lg
- Font: Plus Jakarta Sans 14px

### KPI Cards (Bento Grid)
- Grid: `grid-cols-2 md:grid-cols-4`
- Card: `bg-surface-container-lowest p-6 rounded-xl`
- Shadow: ambient-shadow-1
- Border: `border border-outline-variant/30`
- Label: `font-label-caps text-label-caps uppercase text-on-surface-variant`
- Value: `font-h1 text-h1 text-on-surface`
- Trend badge: `text-sm font-semibold bg-primary-container/10 px-2 py-1 rounded`

### Status Badges (Pill)
- Shape: `rounded-full px-3 py-1.5`
- Dot indicator: `w-2 h-2 rounded-full` before text
- Font: `font-status-badge text-status-badge`
- Accepted: `bg-[#D1FAE5] text-[#065F46]` dot `bg-[#10B981]`
- Picked Up: `bg-[#E2E8F0] text-[#475569]` dot `bg-[#64748B]`
- Matched: `bg-[#FEF3C7] text-[#92400E]` dot `bg-[#F59E0B] animate-pulse`

### Chat / AI Assistant
- Container: max-width `max-w-4xl`, centered
- Bot avatar: `w-8 h-8 rounded-full bg-primary-container`
- Bot bubble: `bg-surface-container-low rounded-2xl rounded-tl-sm p-md border border-surface-container`
- User bubble: `bg-primary text-on-primary rounded-2xl rounded-tr-sm p-md`
- Input: `bg-surface-container rounded-full py-4 pl-14 pr-16` with send FAB on right
- Quick replies: `rounded-full border border-outline-variant px-4 py-2`

### Role Selection Cards (Login)
- Grid: `grid-cols-1 md:grid-cols-3`
- Card: `bg-surface-container-lowest rounded-xl p-xl` with subtle shadow
- Icon circle: `w-16 h-16 rounded-full` per-role tinted
- CTA: `w-full h-12 rounded-full font-label-caps`
- Hover: `-translate-y-1` with shadow increase and icon scale

---

## Layout Rules

1. **Sidebar** is `fixed left-0 top-0 w-64` on desktop (`md:flex`), hidden on mobile.
2. **Main content** uses `md:ml-64` to offset for sidebar.
3. **Mobile** shows TopAppBar + BottomNavBar instead of sidebar.
4. **Content padding**: `p-6 md:p-gutter lg:p-xl`
5. **Max content width**: `max-w-container-max mx-auto`
6. **AI Widget**: Fixed FAB at bottom-right with expandable bubble.
