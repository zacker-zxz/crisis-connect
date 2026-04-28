# 🌍 Crisis Connect — Real-Time Volunteer Orchestration for Disaster Response

> **Google Solution Challenge 2026 Submission**
>
> _A full-stack platform that bridges the gap between NGOs managing ground-level crises and volunteers ready to deploy — powered by live geospatial mapping, Gemini AI situational analysis, and a deterministic matching engine called "Resonance."_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL-4264fb?logo=mapbox)](https://www.mapbox.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Architecture Overview](#-architecture-overview)
- [Google Technologies Used](#-google-technologies-used)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots & Demo](#-screenshots--demo)
- [How It Works — User Flow](#-how-it-works--user-flow)
- [The Resonance Engine (Deep Dive)](#-the-resonance-engine-deep-dive)
- [API Reference](#-api-reference)
- [UN SDGs Alignment](#-un-sdgs-alignment)
- [Scalability & Future Roadmap](#-scalability--future-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🔴 Problem Statement

When disasters strike — floods, earthquakes, industrial fires — the biggest bottleneck isn't the lack of willing volunteers. **It's coordination.**

- NGOs waste hours manually calling and texting volunteers, with no way to know who's available or what skills they have.
- Volunteers want to help but don't know where to go, which org needs them, or if their skillset even matches the need.
- Critical supplies run out silently because there's no predictive tracking.
- Ground-level situational awareness is fragmented — there's no shared operational picture.

Traditional approaches (WhatsApp groups, spreadsheets, phone trees) simply cannot keep up with the speed and chaos of real-world crises. The cost of this inefficiency is measured in lives.

---

## 💡 Our Solution

**Crisis Connect** is a two-sided real-time platform where:

1. **NGOs** post crisis missions with priority levels, skill requirements, and precise locations — then manage deployments from a live command dashboard.
2. **Volunteers** register their skills, availability, and location — then get algorithmically matched to the most impactful missions nearby.

The platform acts as an **intelligent orchestration layer** that eliminates the friction between "we need help" and "I want to help."

### What makes it different?

- **Not just a job board.** Our Resonance Engine computes marginal humanitarian impact per volunteer assignment, factoring in skill match, capacity gaps, priority urgency, and geographic proximity.
- **Not just a map.** Our live heatmap provides real-time geospatial triage — cluster analysis of active crises across an entire city, with Overpass API integration pulling nearby hospitals, police stations, and supply depots.
- **Not just text alerts.** Gemini AI can analyze uploaded images of crisis scenes to auto-generate mission details, severity ratings, and volunteer requirements.

---

## ✨ Key Features

### For NGOs (Organization Dashboard)

| Feature | Description |
|---|---|
| **Mission Deployment** | Create tasks with title, description, priority (Critical/Urgent/Medium/Low), required skills, volunteer count, and map-pinned locations |
| **Live Crisis Heatmap** | Mapbox GL heatmap showing all active missions color-coded by priority, with "MINE" markers for own missions |
| **Smart Inventory Oracle** | Predictive supply burn-rate calculator — estimates depletion windows based on active mission count and configurable per-item consumption rates |
| **Nearby Resource Finder** | Overpass API integration pulling real-time hospital, clinic, pharmacy, police station, and veterinary facility data within a 6km radius |
| **Volunteer Roster** | View and manage all volunteers who've joined via mission acceptance or direct NGO join requests, with approval/rejection workflows |
| **AI Image Analysis** | Upload a photo of a crisis scene → Gemini AI returns structured analysis: crisis type, severity, recommended skills, required supplies, and suggested volunteer count |
| **Social Impact Sharing** | Share organization impact scores to Twitter, Facebook, and Instagram with pre-formatted messages |
| **Weekly Schedule** | Calendar-style mission scheduling and timeline view |

### For Volunteers (Volunteer Dashboard)

| Feature | Description |
|---|---|
| **Guardian AI Recommendations** | Personalized mission recommendations powered by the Resonance Engine, showing impact potential percentages and deployment reasoning |
| **Resonance Field Page** | Full breakdown of the marginal impact scoring — see exactly how skill match, capacity gap, priority pressure, and proximity affect your deployment value |
| **Interactive Mission Feed** | Scrollable list of open missions with priority badges, skill tags, and one-click deployment — clicking a mission flies the heatmap to its coordinates |
| **Live Crisis Map** | Same powerful heatmap as NGOs, but from a volunteer's perspective — with distance calculations from your current position |
| **Active Deployment Tracking** | Cards showing your currently accepted missions with live status and briefing center links |
| **Community / Join NGO** | Browse registered NGOs, read their descriptions, and submit join requests (with 14-day cooldown on rejections) |
| **Skill Profile & Badges** | Manage your skills, view reliability scores, and track contribution hours |
| **Mission Briefing** | Per-mission detail pages with ETA timers, tactical briefing, and navigation support |

### Cross-Cutting

| Feature | Description |
|---|---|
| **Role-Based Auth** | JWT + HttpOnly cookies, bcrypt hashing, separate NGO/Volunteer flows |
| **Real-Time Notifications** | MongoDB-persisted cross-role notifications (mission acceptance alerts for NGOs, rejection reasons for volunteers) with polling sync |
| **Zod Validation** | Schema-level input validation on both auth and task creation endpoints |
| **Rate Limiting** | In-memory token-bucket rate limiter on AI endpoints (configurable window/max via env vars) |
| **Responsive Design** | Collapsible sidebar navigation, mobile-optimized layouts across all dashboards |

---

## 🏗 Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js SSR + CSR)                 │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Landing  │  │ NGO Dashboard│  │  Volunteer  │  │ Auth Pages │ │
│  │  Page    │  │   + Layouts  │  │  Dashboard  │  │ Sign In/Up │ │
│  └──────────┘  └──────────────┘  └─────────────┘  └────────────┘ │
│         │              │                │                │        │
│  ┌──────┴──────────────┴────────────────┴────────────────┘        │
│  │  Zustand Stores (authStore, notificationStore)                 │
│  │  Framer Motion Animations · Mapbox GL · Lucide Icons           │
│  └────────────────────────────────────────────────────────────────┘
└────────────────────────────┬───────────────────────────────────────┘
                             │  REST API (Next.js Route Handlers)
┌────────────────────────────┴───────────────────────────────────────┐
│                         SERVER (API Layer)                          │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────────┐  │
│  │ /auth/*  │ │ /tasks/* │ │ /gemini/*  │ │ /nearby-resources │  │
│  │ login    │ │ CRUD +   │ │ analyze    │ │ Overpass API proxy │  │
│  │ register │ │ accept   │ │ recommend  │ │ + curated data     │  │
│  │ profile  │ │ [id]     │ │ (Gemini AI)│ └────────────────────┘  │
│  └──────────┘ └──────────┘ └────────────┘                         │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐      │
│  │ /ngo-requests│ │/notifications│ │ /volunteer/resonance  │      │
│  │ join flow    │ │ CRUD + poll  │ │ Resonance Engine      │      │
│  └──────────────┘ └──────────────┘ └───────────────────────┘      │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Middleware: JWT verification, rate limiting, Zod validation│  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────────┘
                             │
┌────────────────────────────┴───────────────────────────────────────┐
│                     DATA / EXTERNAL SERVICES                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  MongoDB     │  │  Gemini AI   │  │  Mapbox GL + Overpass   │ │
│  │  (Mongoose)  │  │  (Google)    │  │  (OSM)                  │ │
│  │  Users       │  │  Image       │  │  Heatmap rendering      │ │
│  │  Tasks       │  │  Analysis    │  │  Geocoding              │ │
│  │  NGORequests │  │  Volunteer   │  │  Nearby resource lookup │ │
│  │  Notifications│ │  Matching    │  │                          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🟢 Google Technologies Used

| Technology | How We Use It |
|---|---|
| **Gemini AI** (`@google/generative-ai`) | **Image-based crisis analysis**: NGOs upload photos of disaster scenes → Gemini vision models return structured JSON with crisis type, severity, recommended volunteer skills, supply lists, and staffing estimates. **Volunteer matching narrative**: Gemini generates human-readable reasoning for why a specific volunteer should deploy to a specific mission. |
| **Gemini Model Auto-Discovery** | Our backend dynamically lists all available models on the API key via the `ListModels` REST endpoint, then picks the best vision-capable model using a heuristic preference cascade (image models → vision models → multimodal flash → legacy). This means the app gracefully handles model deprecations and rollouts without code changes. |
| **Multi-Key Failover** | Supports `GEMINI_API_KEY` + `GEMINI_API_KEY_BACKUP` with automatic failover on quota exhaustion (429 errors). Each key cycles through all candidate models before falling to the next key. |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, API routes, file-based routing |
| **Language** | TypeScript | End-to-end type safety |
| **Database** | MongoDB + Mongoose | Document store for users, tasks, notifications, requests |
| **Auth** | JWT (jsonwebtoken + jose) + bcryptjs | Stateless auth with HttpOnly cookies, edge-compatible verification |
| **AI** | Google Gemini (`@google/generative-ai`) | Vision analysis, volunteer recommendation |
| **Maps** | Mapbox GL JS + react-map-gl | Interactive heatmaps, markers, geocoding |
| **Geospatial** | Overpass API (OpenStreetMap) | Nearby hospital/police/clinic lookups |
| **State** | Zustand (with persist middleware) | Client-side auth + notification stores |
| **Animation** | Framer Motion | Page transitions, micro-interactions, scroll-linked effects |
| **Styling** | TailwindCSS 3 | Utility-first responsive design |
| **Validation** | Zod | Runtime schema validation for API inputs |
| **Icons** | Lucide React | Consistent icon system |

---

## 📁 Project Structure

```
crisis-connect/
├── app/
│   ├── api/                          # Next.js Route Handlers (REST API)
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST - login with email/password
│   │   │   ├── register/route.ts     # POST - create account (NGO or volunteer)
│   │   │   ├── me/route.ts           # GET  - fetch current session user
│   │   │   └── profile/route.ts      # PATCH - update user profile fields
│   │   ├── gemini/
│   │   │   ├── analyze/route.ts      # POST - upload image for AI crisis analysis
│   │   │   └── recommend/route.ts    # POST - get AI volunteer-task recommendation
│   │   ├── tasks/
│   │   │   ├── route.ts              # GET all / POST new task
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET / PATCH / DELETE single task
│   │   │       └── accept/route.ts   # POST - volunteer accepts a mission
│   │   ├── ngo-requests/route.ts     # GET / POST - volunteer join requests
│   │   ├── ngos/route.ts             # GET - list all registered NGOs
│   │   ├── notifications/route.ts    # GET / DELETE - notification management
│   │   ├── nearby-resources/route.ts # GET - Overpass + curated resource lookup
│   │   └── volunteer/
│   │       └── resonance/route.ts    # POST - Resonance Engine scoring
│   ├── ngo-dashboard/                # NGO-side pages
│   │   ├── layout.tsx                # Sidebar + notification drawer
│   │   ├── page.tsx                  # Main dashboard (stats, heatmap, tasks)
│   │   ├── create/page.tsx           # Create new mission form
│   │   ├── tasks/                    # Task list + edit pages
│   │   ├── heatmap/page.tsx          # Full-screen heatmap view
│   │   ├── resource-predictor/       # Smart Inventory Oracle page
│   │   ├── schedule/page.tsx         # Weekly mission calendar
│   │   ├── volunteers/page.tsx       # Volunteer roster management
│   │   └── settings/page.tsx         # Organization profile settings
│   ├── volunteer-dashboard/          # Volunteer-side pages
│   │   ├── layout.tsx                # Sidebar + notification drawer
│   │   ├── page.tsx                  # Main dashboard (heatmap, missions, AI)
│   │   ├── missions/                 # Mission feed + briefing pages
│   │   ├── heatmap/page.tsx          # Full-screen heatmap view
│   │   ├── resonance/page.tsx        # Resonance Field breakdown
│   │   ├── community/page.tsx        # Browse + join NGOs
│   │   ├── my-tasks/page.tsx         # Accepted mission history
│   │   ├── profile/page.tsx          # Personal profile + badges
│   │   └── settings/page.tsx         # Volunteer settings
│   ├── signin/page.tsx               # Sign in page
│   ├── signup/page.tsx               # Sign up page (role-aware)
│   ├── page.tsx                      # Landing page (hero, features, reviews)
│   ├── layout.tsx                    # Root layout (Inter font, metadata)
│   └── globals.css                   # Global styles + CSS variables
├── components/
│   ├── auth/AuthGuard.tsx            # Route protection wrapper
│   ├── maps/LiveHeatmap.tsx          # Mapbox heatmap + markers + sidebar
│   ├── ui/
│   │   ├── FeatureShowcase.tsx       # Landing page feature section
│   │   ├── Header.tsx                # Top navigation bar
│   │   └── Footer.tsx                # Site footer
│   ├── loading-screen.tsx            # Deployment loading overlay
│   └── ClientLayoutWrapper.tsx       # Client boundary for providers
├── lib/
│   ├── auth.ts                       # JWT helpers (sign, verify, cookies)
│   ├── mongodb.ts                    # Mongoose connection singleton
│   ├── resonanceEngine.ts           # ← The core matching algorithm
│   ├── env.ts                        # Zod-validated environment config
│   ├── rateLimiter.ts                # Token bucket rate limiter
│   ├── validation.ts                 # Zod schemas for auth + tasks
│   └── ngoTeamSeed.ts               # Seed data for NGO team roster UI
├── models/
│   └── index.ts                      # Mongoose schemas (User, Task, NGORequest, Notification)
├── store/
│   ├── authStore.ts                  # Zustand auth state (token, user, logout)
│   └── notificationStore.ts         # Zustand notification state (with persist)
├── scripts/
│   ├── gemini-smoke.js               # Quick test script for Gemini API key
│   └── list-gemini-models.js         # List available models on your key
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── .env.example                      # Template for required env vars
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or yarn/pnpm)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Mapbox** account — [sign up](https://account.mapbox.com/auth/signup/) for a free access token
- **Google AI Studio** — [get a Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/zacker-zxz/crisis-connect.git
cd crisis-connect

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Then fill in your actual keys (see section below)

# 4. Start the dev server
npm run dev
```

The app will be running at **http://localhost:3000**.

### Quick Smoke Test (Gemini)

```bash
# Verify your Gemini API key works
node scripts/gemini-smoke.js

# List all models available on your key
node scripts/list-gemini-models.js
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crisis-connect

# JWT secret — use a strong random string (32+ chars)
JWT_SECRET=your_super_secret_jwt_key_here

# Mapbox — needed for heatmaps and geocoding
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token

# Base URL for the app
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Gemini AI — needed for image analysis + recommendations
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY_BACKUP=your_backup_gemini_key  # optional failover

# Rate Limiting (optional, defaults shown)
RATE_LIMIT_WINDOW_MS=60000     # 1 minute window
RATE_LIMIT_MAX_REQUESTS=10     # max requests per window per IP
```

> **Note:** The app runs without Gemini keys — AI features will just show error states. The heatmap falls back to a bundled token for demo purposes, but you should use your own Mapbox key in production.

---

## 📸 Screenshots & Demo

### Landing Page
The landing page features a parallax hero with scroll-linked opacity transitions, an interactive feature showcase with tabbed navigation, impact testimonials, and a contact form — all animated with Framer Motion.

### NGO Dashboard
Command center with greeting banner, stat cards (active missions, total missions, impact score, filled slots), a quick-access Smart Inventory Oracle card, recent mission orchestrations list, and a full-width live crisis heatmap.

### Volunteer Dashboard
Personalized welcome banner showing matched skills, Guardian AI recommendation card with impact potential scoring, alternating dark/light stat cards, a split-layout with full-height heatmap + scrollable mission feed, and active deployment cards.

### Resonance Field
Full-page breakdown of the marginal impact scoring algorithm — shows impact potential %, projected field clearance delta, bottleneck classification, lead deployment recommendation, and a ranked breakdown table of all scored missions.

### Smart Inventory Oracle
Predictive supply depletion dashboard with per-item burn-rate cards, live warnings for the most critical supply, auto-generate donation request button, and an interactive map showing nearby emergency resources (hospitals, clinics, police, veterinary, warehouses, blackstore reserves).

---

## 🔄 How It Works — User Flow

### NGO Flow

```
Register as NGO → Set org name + description → Land on NGO Dashboard
    → "Post New Task" → Fill title, description, skills, location (map picker), priority
    → Task appears on heatmap + volunteer feeds
    → Volunteers accept → NGO gets notification → Manage roster
    → Upload crisis photo → Gemini auto-fills task details
    → Check Inventory Oracle → See supply depletion predictions
    → Review volunteer join requests → Approve / Reject (with reason)
```

### Volunteer Flow

```
Register as Volunteer → Set skills (First Aid, Logistics, etc.) + location
    → Land on Volunteer Dashboard → See personalized Guardian AI recommendation
    → Browse mission feed (sorted by priority) → Click to highlight on heatmap
    → "Deploy" → Accept mission → Redirected to mission briefing
    → Track active deployments → View ETA + tactical briefing
    → Browse "Community" tab → Request to join an NGO permanently
    → Visit Resonance Field → See full breakdown of impact scoring
```

---

## 🧠 The Resonance Engine (Deep Dive)

The **Resonance Engine** (`lib/resonanceEngine.ts`) is a deterministic scoring algorithm that runs entirely on the server — no external API calls required. It computes a **Marginal Impact Index** for each volunteer-task pair.

### Scoring Formula

For each task, four sub-scores are calculated:

```
Score = 0.38 × SkillMatch + 0.28 × CapacityStress + 0.22 × PriorityWeight + 0.12 × GeoProximity
```

| Factor | Weight | How It Works |
|---|---|---|
| **Skill Match** | 38% | Set intersection of volunteer's skills vs. task's required skills. No required skills → defaults to 0.65 |
| **Capacity Stress** | 28% | `(required - filled) / required` — tasks that are critically understaffed score higher |
| **Priority Weight** | 22% | Critical=1.0, Urgent=0.9, High=0.85, Medium=0.55, Low=0.4 |
| **Geo Proximity** | 12% | Haversine distance → exponential decay (`e^(-d/45)`) — closer = higher score |

### Output

- **Marginal Impact Index** (52–98): A normalized score representing the volunteer's projected impact
- **Recommended Task**: The highest-scoring task
- **Bottleneck Classification**: Whether the binding constraint is skill, capacity, priority, geo, or balanced
- **Projected Delta**: Estimated % improvement in field clearance if the volunteer deploys
- **Breakdown Table**: Top 6 tasks ranked with per-factor percentages

### Why Deterministic?

We intentionally avoid using LLMs for the actual ranking. AI hallucinations in deployment recommendations could send volunteers to the wrong place. The Resonance Engine gives the same output for the same inputs, every time. Gemini is used only to polish the human-readable reasoning text — the ranking itself never changes.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new user (NGO or volunteer) | Public |
| POST | `/api/auth/login` | Login, returns JWT + sets cookie | Public |
| GET | `/api/auth/me` | Get current authenticated user | Required |
| PATCH | `/api/auth/profile` | Update user profile fields | Required |

### Tasks

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | List all tasks (for heatmap + feeds) | Public |
| POST | `/api/tasks` | Create new task | NGO only |
| GET | `/api/tasks/[id]` | Get single task details | Public |
| PATCH | `/api/tasks/[id]` | Update task | NGO (owner) |
| DELETE | `/api/tasks/[id]` | Delete task | NGO (owner) |
| POST | `/api/tasks/[id]/accept` | Volunteer accepts mission | Volunteer |

### AI / Gemini

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/gemini/analyze` | Image → structured crisis analysis | Required |
| POST | `/api/gemini/recommend` | Tasks + skills → deployment recommendation | Required |

### Other

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/volunteer/resonance` | Compute Resonance Engine scores | Volunteer |
| GET | `/api/nearby-resources?lat=X&lng=Y` | Nearby hospitals, police, etc. | Public |
| GET | `/api/ngos` | List registered NGOs | Public |
| GET/POST | `/api/ngo-requests` | Volunteer join request flow | Varies |
| GET/DELETE | `/api/notifications` | Notification management | Required |

---

## 🌐 UN SDGs Alignment

Crisis Connect directly contributes to the following United Nations Sustainable Development Goals:

| SDG | How We Contribute |
|---|---|
| **SDG 1: No Poverty** | Helps route relief supplies and volunteers to the most economically vulnerable communities hit by disasters |
| **SDG 3: Good Health & Well-Being** | Nearby resource finder surfaces hospitals, clinics, and pharmacies. Skill-based matching prioritizes medical volunteers for health crises |
| **SDG 10: Reduced Inequalities** | Platform is free and open-source — any community organization can deploy it. Algorithmic matching prevents bias in volunteer allocation |
| **SDG 11: Sustainable Cities & Communities** | Real-time heatmaps enable urban disaster preparedness. Predictive inventory prevents supply chain failures during compound events |
| **SDG 13: Climate Action** | Floods, cyclones, and extreme weather events are the primary use case. Fast volunteer deployment reduces climate disaster impact |
| **SDG 17: Partnerships for the Goals** | The two-sided NGO ↔ Volunteer architecture is designed to foster cross-organizational collaboration at city scale |

---

## 📈 Scalability & Future Roadmap

### Current Limitations (v1)
- Notification sync is polling-based (5s interval) — not true WebSocket push
- Supply inventory data is mock/simulated (not connected to real warehouse systems yet)
- Impact scores and contribution hours are placeholder — need actual deployment time tracking
- Single-region deployment (no CDN / edge optimization)

### Planned for v2
- [ ] **WebSocket real-time notifications** via Socket.IO — eliminating polling
- [ ] **SMS/WhatsApp alerts** via Twilio for volunteers without constant app access
- [ ] **Offline-first PWA mode** — volunteers in low-connectivity disaster zones can cache missions
- [ ] **Multi-language support** — Hindi, Marathi, Tamil for India-wide deployment
- [ ] **Actual impact tracking** — geofence-based auto-check-in when volunteers arrive at mission location
- [ ] **Warehouse inventory integration** — connect to real supply chain APIs
- [ ] **Volunteer reputation system** — on-chain verification of deployment history
- [ ] **Admin analytics dashboard** — city-level heatmap replay, response time metrics, bottleneck analysis
- [ ] **Emergency SOS button** — one-tap distress signal with GPS broadcast to nearby active volunteers

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| **Aryan** | Full-Stack Development | [@ARYANN-07](https://github.com/ARYANN-07) |
| **Tejas Tayade** | Full-Stack Development | [@tejas030806](https://github.com/tejas030806) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Google Solution Challenge 2026**

_Because when every minute counts, coordination shouldn't be the bottleneck._

</div>
