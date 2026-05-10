# 🏢 NGO Flow — Impact AI (Hackathon Study Guide)

> **Purpose:** Complete revision document for the NGO side of the Impact AI platform.  
> **Stack:** React + Vite · Firebase Auth + Firestore · Gemini AI (gemini-1.5-flash) · React Router v6 · Lucide Icons

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Authentication & Role System](#2-authentication--role-system)
3. [Route Map](#3-route-map)
4. [Dashboard Layout](#4-dashboard-layout)
5. [Tool-by-Tool Flow](#5-tool-by-tool-flow)
6. [Firestore Data Schema](#6-firestore-data-schema)
7. [AI Integration Points](#7-ai-integration-points)
8. [Component Breakdown](#8-component-breakdown)
9. [Key Points & Must Remembers](#9-key-points--must-remembers)
10. [Hackathon Counter Questions & Answers](#10-hackathon-counter-questions--answers)

---

## 1. System Overview

```
Landing Page (/)
   |
   v
Auth Page (/auth)  <--- Firebase Google / Email Auth
   |
   |---> NGO Role  ---> /dashboard  (DashboardLayout shell)
   |
   +---> Volunteer Role ---> /volunteer (separate flow)
```

**Impact AI** is a dual-role NGO + Volunteer coordination platform. The **NGO** is the task publisher and resource manager. They use AI tools to:
- Post and manage volunteer tasks
- Auto-plan events with AI
- Match volunteers using a skill-scoring engine
- Send bulk invitations
- Scan physical documents into structured data
- View a live heatmap of task activity
- Organize donor communications

---

## 2. Authentication & Role System

### How It Works

| Step | Action | Where |
|------|--------|--------|
| 1 | User signs in (Firebase Auth) | `AuthPage.jsx` |
| 2 | `AuthContext` listens via `onAuthStateChanged` | `AuthContext.jsx` |
| 3 | On login, fetches Firestore doc: `users/{uid}` | `AuthContext.jsx` |
| 4 | `userData.role` field determines routing | `RoleProtectedRoute.jsx` |
| 5 | NGO goes to `/dashboard`, Volunteer goes to `/volunteer` | `App.jsx` |

### Key Context Values
```js
const { currentUser, userData } = useAuth();
// currentUser = Firebase Auth user object (uid, email, etc.)
// userData    = Firestore users/{uid} document (role, ngoName, city, etc.)
```

### Guard Components

| Component | Guards | Redirects to |
|-----------|--------|--------------|
| `ProtectedRoute` | Any logged-in user | `/auth` if not logged in |
| `RoleProtectedRoute` | Specific role (e.g., `['ngo']`) | `/` if wrong role |

**CRITICAL PATTERN:** Dashboard shell uses `ProtectedRoute`, then each individual NGO tool uses `RoleProtectedRoute`. This prevents redirect loops where volunteers bouncing off `/dashboard` would re-trigger the protected route.

---

## 3. Route Map

```
/                              -> LandingPage
/auth                          -> AuthPage
/dashboard                     -> DashboardLayout (Protected)
  /dashboard (index)           -> DashboardHome
  /dashboard/manage-tasks      -> ManageTasks        [NGO only]
  /dashboard/post-task         -> PostTask            [NGO only]
  /dashboard/email-organizer   -> DonorEmailOrganizer [NGO only]
  /dashboard/volunteer-matcher -> VolunteerMatcher    [NGO only]
  /dashboard/event-scheduler   -> EventSchedulerAI   [NGO only]
  /dashboard/scan-document     -> ScanDocument        [NGO only]
  /dashboard/live-map          -> LiveHeatmap          [NGO only]
```

---

## 4. Dashboard Layout

**File:** `pages/ngo/DashboardLayout.jsx`

- Acts as a persistent **shell** wrapping all `/dashboard/*` routes via `<Outlet />`
- Contains the sidebar navigation linking to all 7 NGO tools
- Renders `<DashboardHome />` at the index route

---

## 5. Tool-by-Tool Flow

### 5.1 Dashboard Home (`/dashboard`)

**File:** `pages/ngo/DashboardHome.jsx`

```
DashboardHome
  +-- WelcomeBanner    -> Shows NGO name (from userData), live counts
  +-- NGOStatsGrid     -> Live Firestore counts (open tasks, accepted, completed)
  +-- RecentActivity   -> Last N tasks from Firestore
  +-- Quick Actions
       +-- Post New Task   -> /dashboard/post-task
       +-- Find Volunteers -> /dashboard/volunteer-matcher
       +-- Scan Document   -> /dashboard/scan-document
       +-- Live Heatmap teaser -> /dashboard/live-map
```

---

### 5.2 Post Task (`/dashboard/post-task`)

**File:** `pages/ngo/PostTask.jsx`

#### Flow Diagram
```
NGO visits PostTask
  |
  +-- Fills form: Title, Description, Category, Location, Urgency (0-100), Deadline
  |
  +-- [OPTIONAL] Clicks "Auto-Enhance" (AI Feature)
  |     |
  |     +-- Sends rough title + desc to Gemini -> returns polished title + description
  |
  +-- [LIVE PREVIEW] Right panel shows real-time volunteer card preview
  |
  +-- Submits form
        |
        +-- addDoc(db, 'tasks', {...})
              Fields: title, description, category, urgency, location, deadline,
                      status:'open', ngoId, ngoName, ngoCity, acceptedBy:null, createdAt
```

#### Form Fields Table

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | text | YES | AI can enhance |
| `description` | textarea | YES | AI can enhance · 500 chars recommended |
| `category` | text + chips | YES | 7 presets or custom |
| `location` | text | YES | e.g., "Bhopal, MP" |
| `urgency` | range slider 0-100 | NO | Default 50 · drives colored badge |
| `deadline` | date | NO | Optional |

#### Urgency Scale

| Score | Label | Color |
|-------|-------|-------|
| >= 80 | Critical | Red |
| >= 50 | High | Orange |
| >= 25 | Medium | Amber |
| < 25 | Low | Green |

#### Post-Success Options
- Post Another Task (resets form)
- Use AI to Find Volunteers (-> `/dashboard/volunteer-matcher`)
- Back to Dashboard

---

### 5.3 Manage Tasks (`/dashboard/manage-tasks`)

**File:** `pages/ngo/ManageTasks.jsx`

#### Flow
```
Loads all tasks WHERE ngoId == currentUser.uid
  |
  +-- Sorted by createdAt DESC
  +-- Displayed in tab view:
  |     +-- All Tasks
  |     +-- Accepted Tasks  (acceptedBy != null OR status == 'accepted')
  |     +-- Declined Tasks  (status == 'declined')
  |     +-- Completed Tasks (status == 'completed')
  |
  +-- Per-task Actions:
        +-- Mark Complete  -> updateDoc(status: 'completed')
        +-- Decline        -> updateDoc(status: 'declined')
        +-- Delete         -> deleteDoc()
```

#### Task Status Machine

```
open -> accepted -> completed
open -> declined
open -> deleted
accepted -> completed
```

#### Key Points
- Tasks sorted by `createdAt` descending (newest first)
- No real-time listener — uses one-time `getDocs()` (potential improvement: use `onSnapshot`)
- Delete requires `window.confirm` for safety

---

### 5.4 Volunteer Matcher (`/dashboard/volunteer-matcher`)

**File:** `pages/ngo/VolunteerMatcher.jsx`

#### Flow Diagram
```
Load:
  +-- All volunteers (users WHERE role == 'volunteer')
  +-- NGO's tasks (tasks WHERE ngoId == currentUser.uid)

Mode A — Manual Search:
  +-- Filter by name, skill, or location using search bar

Mode B — AI Match:
  +-- NGO selects a task (dropdown) OR types a keyword
  +-- Click "AI Match"
  +-- Scoring algorithm runs (client-side):
  |     score = 60 + (matchedSkills.length / skills.length) * 40
  |     baseline = random 40-60 for volunteers with no skill data
  +-- Volunteers sorted by score DESC
  +-- Matched skills highlighted in green badges

Bulk Actions:
  +-- NGO selects multiple volunteers (toggle)
  +-- "Invite to Task" -> addDoc(db, 'invites', {...})
        Fields: taskId, taskTitle, ngoId, ngoName, volunteerId, status:'pending', createdAt
```

#### Key Data Reads

| Collection | Query | Purpose |
|------------|-------|---------|
| `users` | `role == 'volunteer'` | Get all volunteers |
| `tasks` | `ngoId == currentUser.uid` | Get NGO's own tasks |

#### Matching Score Formula
```
If volunteer has matching skills:
  score = min(99, round(60 + (matchedSkills / totalSkills) * 40))

If no skills or no match:
  score = random 40-60 (baseline)
```

---

### 5.5 Event Scheduler AI (`/dashboard/event-scheduler`)

**File:** `pages/ngo/EventSchedulerAI.jsx`

#### 3-Step Flow
```
Step 1 — INPUT
  |   NGO enters: Event Name, Location, Goal/Description
  |
  v
Step 2 — PROCESSING (Gemini API call)
  |   Prompt -> AI generates:
  |     - timeline: [{ time, activity }]
  |     - roles:    [{ title, category, count, description, urgency }]
  |
  v
Step 3 — REVIEW & BULK POST
  |   NGO sees:
  |     - Visual timeline (alternating layout)
  |     - Required volunteer roles with counts & urgency
  |
  +-- "Bulk-Post Roles to Feed" Button
  |     +-- Creates: events/{eventId} document
  |     +-- Creates N tasks (one per role x count)
  |           Each task: isEventTask:true, eventId, eventName
  |
  +-- Step 4 — DONE Screen (success state)
```

#### Firestore Writes (Bulk Post)

| Collection | Document | Key Fields |
|------------|----------|------------|
| `events` | new auto-id | name, location, description, ngoId, timeline, roles |
| `tasks` | new auto-id x N | title, category, urgency, isEventTask:true, eventId, eventName |

#### MUST REMEMBER
- Uses `Promise.all()` to write all task docs in **parallel** (not sequential)
- A role with `count: 3` creates **3 separate task documents** in Firestore
- Categories must match: Education, Medical, Food, Environment, Disaster Relief, Housing, Other
- State machine: `input -> processing -> review -> posting -> done`

---

### 5.6 Scan Document (`/dashboard/scan-document`)

**File:** `pages/ngo/ScanDocument.jsx`

#### Flow
```
NGO uploads image (PNG/JPG/JPEG)
  |
  +-- Preview shown in dropzone
  |
  +-- "Scan & Extract Data" -> Gemini Vision API (gemini-1.5-flash)
        |   Converts image -> Base64 inlineData (FileReader API)
        |   Prompt: extract structured JSON from receipts, sign-up sheets, inventory
        |
        +-- Result displayed as formatted JSON in dark terminal panel
        +-- Export options:
              +-- Download as CSV/Excel
              +-- Download as JSON
```

#### Supported Document Types

| Type | Extracts |
|------|---------|
| Volunteer sign-up sheets | Names, emails, phone numbers |
| Donation receipts | Amounts, dates, items |
| Food inventory lists | Items, quantities |
| Whiteboard notes | Key points, meeting data |

#### Technical Note — Image to Gemini
```js
// fileToGenerativePart() converts File -> inlineData object
{
  inlineData: {
    data: base64String,   // FileReader result, split at comma
    mimeType: file.type   // e.g., "image/jpeg"
  }
}
```

---

### 5.7 Donor Email Organizer (`/dashboard/email-organizer`)

**File:** `pages/ngo/DonorEmailOrganizer.jsx`

- AI-powered tool to organize donor email campaigns
- Uses Gemini to draft, categorize, or improve donor communication
- Key use case: NGOs often struggle with donor retention and communication

---

### 5.8 Live Heatmap (`/dashboard/live-map`)

**File:** `pages/ngo/LiveHeatmap.jsx`

#### Flow
```
Loads all open tasks from Firestore
  |
  +-- Renders Leaflet.js map with task markers
        +-- Marker color = urgency level
        +-- Click marker -> task details popup
        +-- Legend for urgency colors
```

**KEY SELLING POINT:** Uses **Leaflet** (free, no Google Maps API key required). Visualizes task geographic distribution across India.

---

## 6. Firestore Data Schema

### `users/{uid}`
```json
{
  "role": "ngo",
  "adminFullName": "Riya Sharma",
  "city": "Mumbai",
  "email": "riya@ngo.org",
  "createdAt": "ISO timestamp"
}
```

### `tasks/{taskId}`
```json
{
  "title": "Volunteer Teachers Needed",
  "description": "...",
  "category": "Education",
  "urgency": 75,
  "location": "Bhopal, MP",
  "deadline": "2026-06-01",
  "status": "open",
  "ngoId": "uid",
  "ngoName": "Teach For India",
  "ngoCity": "Bhopal",
  "acceptedBy": null,
  "createdAt": "ISO timestamp",
  "isEventTask": false,
  "eventId": null,
  "eventName": null
}
```

### `invites/{inviteId}`
```json
{
  "taskId": "...",
  "taskTitle": "...",
  "ngoId": "...",
  "ngoName": "...",
  "volunteerId": "...",
  "status": "pending",
  "createdAt": "ISO timestamp"
}
```

### `events/{eventId}`
```json
{
  "name": "Beach Cleanup Drive",
  "location": "Juhu Beach, Mumbai",
  "description": "...",
  "ngoId": "...",
  "ngoName": "...",
  "timeline": [{ "time": "09:00 AM", "activity": "Briefing" }],
  "roles": [{ "title": "...", "category": "...", "count": 2, "urgency": 80 }],
  "createdAt": "ISO timestamp"
}
```

---

## 7. AI Integration Points

| Feature | Model | Input | Output |
|---------|-------|-------|--------|
| PostTask Auto-Enhance | gemini-1.5-flash | Rough title + description | Polished title + description (JSON) |
| EventScheduler Plan | gemini-1.5-flash | Event name + goal | Timeline + roles array (JSON) |
| ScanDocument | gemini-1.5-flash (vision) | Base64 image | Structured JSON data |
| Volunteer Matching | Client-side algorithm | Task keywords vs volunteer skills | Scored volunteer list |

**NOTE:** AI key is `VITE_GEMINI_API_KEY` stored in `client/.env`. All AI calls are client-side (no backend proxy for AI in current implementation).

### JSON Sanitization Pattern (used everywhere)
```js
const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
const data = JSON.parse(jsonStr);
```

---

## 8. Component Breakdown

### NGO Dashboard Components (`components/ngo/`)

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| `WelcomeBanner` | Shows NGO name + greeting | `useAuth()` userData |
| `NGOStatsGrid` | Live task counts (open/accepted/completed) | Firestore tasks collection |
| `RecentActivity` | Last N tasks posted | Firestore tasks collection |
| `NGOProfileCard` | NGO name, city, role badge | `useAuth()` userData |

### Shared UI (`components/ui/`)
- `ToastContext` — Global `showToast(message, type)` — used everywhere for success/error feedback
- Two types: `'success'` (green) and `'error'` (red)

---

## 9. Key Points & Must Remembers

### Architecture
- Dual-role app — same Firebase project, different routes per role
- Two-layer route protection: `ProtectedRoute` (auth check) + `RoleProtectedRoute` (role check) prevents redirect loops
- All AI is client-side — no separate AI microservice; uses `@google/generative-ai` directly in browser

### Firebase
- `onAuthStateChanged` is used (not `getAuth().currentUser`) — handles async auth state properly
- Firestore rules must allow `users` collection reads for authenticated users
- Tasks use `ngoId` field for ownership — all queries are `where('ngoId', '==', uid)`
- Denormalization pattern: `ngoName` + `ngoCity` are stored inside task documents (avoids joins)

### AI / Gemini
- All prompts request **raw JSON only** — sanitize with regex before parsing
- Vision model used for document scanning (multimodal input: text + image)
- Volunteer matching is **NOT a real AI call** — it's a keyword overlap scoring algorithm with a random baseline

### State Management
- No Redux / Zustand — all state is local `useState` + `AuthContext`
- `useAuth()` hook provides `currentUser` (Firebase Auth) and `userData` (Firestore profile)

### EventScheduler Critical Points
- `Promise.all()` for parallel writes — all tasks created simultaneously
- Role with `count: 3` creates 3 separate task documents
- Status machine: `input -> processing -> review -> posting -> done`
- All event tasks marked with `isEventTask: true` + `eventId`

### Forms
- PostTask has **live preview card** — exactly how volunteers see the task
- Submit button disabled until all required fields filled (`isValid` flag)
- Form reset clears to `INITIAL = { title: '', description: '', category: '', urgency: 50, location: '', deadline: '' }`

---

## 10. Hackathon Counter Questions & Answers

### Architecture / Design Questions

**Q: Why did you keep AI calls on the client-side instead of a backend?**
A: For rapid prototyping speed and since Gemini's JS SDK supports browser environments. In production, we'd move to a backend proxy to hide the API key and add rate-limiting, but for a hackathon demo this avoids infrastructure complexity.

---

**Q: What happens if the Gemini API key is exposed in the frontend bundle?**
A: That's a known trade-off for this prototype. The fix is to create a server-side endpoint (we have an Express server in `/server`) that acts as a proxy. The client calls `/api/ai/enhance-task` and the server holds the real key.

---

**Q: Why two separate guard components (`ProtectedRoute` + `RoleProtectedRoute`)? Why not one?**
A: One guard trying to handle both auth AND role causes an infinite redirect loop. If a volunteer hits `/dashboard`, a single guard checking `role == 'ngo'` would redirect to `/auth` -> which redirects back after login -> infinite loop. Separating them: the outer guard just checks "are you logged in?", the inner guard checks "are you the right role?"

---

**Q: How does data stay consistent if a volunteer accepts a task while the NGO is managing it?**
A: FindTasks uses `onSnapshot` (real-time listener) so the volunteer sees immediate updates. ManageTasks currently uses a one-time `getDocs` — a production fix would be to switch it to `onSnapshot` too so the NGO dashboard auto-updates.

---

### AI / Feature Questions

**Q: Is the "AI Volunteer Matching" actually using AI?**
A: The matching algorithm is a keyword overlap scorer — we tokenize the task description and score volunteers by how many of their listed skills match. The Gemini key check is there as a placeholder for a true semantic matching call. The intent is to replace the scorer with a real embedding-based similarity search in a production version.

---

**Q: What's the prompt engineering strategy in PostTask's Auto-Enhance?**
A: The prompt uses role-priming ("You are an expert copywriter for an NGO platform"), gives context (rough title, description, category), specifies exact output schema (JSON with `title` and `description`), and instructs the model to produce volunteer-attracting copy. The response is sanitized by stripping markdown code fences before JSON parsing.

---

**Q: What if Gemini returns invalid JSON in EventScheduler?**
A: The prompt explicitly says "NO markdown, NO code blocks" and we strip fences with regex. If `JSON.parse()` still fails, the `try/catch` catches it and shows a toast error — the UI falls back to the `input` state. In production, we'd add response validation using Zod before rendering.

---

**Q: How does document scanning work technically?**
A: We use the FileReader API to convert the uploaded image to Base64, then pass it as a Gemini `inlineData` part alongside a text prompt. The model (gemini-1.5-flash, multimodal) reads both and returns structured JSON. We then render it as formatted JSON and offer CSV/JSON export.

---

### Data / Firestore Questions

**Q: How would you scale this if 10,000 NGOs post tasks? Won't the volunteer feed be slow?**
A: Currently we use `where('status', '==', 'open')` with client-side sorting. For scale: (1) add a composite Firestore index on `status + urgency`, (2) use cursor-based pagination (`startAfter`), (3) consider Algolia or Typesense for full-text search on task titles/categories.

---

**Q: Why store `ngoName` and `ngoCity` inside the task document instead of joining from `users`?**
A: Denormalization — Firestore doesn't support joins. Embedding NGO info in the task avoids an extra read for every task card rendered. The trade-off is that if the NGO updates their name, tasks won't auto-update (acceptable for a hackathon, solvable with Cloud Functions in production).

---

**Q: How do you prevent one NGO from deleting another NGO's tasks?**
A: Currently the check is client-side (queries filter by `ngoId == currentUser.uid`). In production, Firestore Security Rules would enforce: `allow delete: if request.auth.uid == resource.data.ngoId;`

---

### Product / Business Questions

**Q: What's the core problem you're solving?**
A: NGOs in India operate with limited tech resources. They manage volunteers via WhatsApp, physical sign-up sheets, and email threads. Impact AI centralizes task posting, volunteer matching, event planning, and document digitization — reducing coordination overhead from hours to minutes.

---

**Q: How is your platform different from existing volunteer platforms like iVolunteer or GiveIndia?**
A: Those platforms are job-board style — volunteers browse, NGOs wait. We add: (1) AI-powered reverse matching (NGO finds volunteer), (2) real-time event role generation from a single description, (3) document scanning to digitize physical records, and (4) a live geographic heatmap of needs.

---

**Q: How would you monetize this?**
A: Freemium model: Basic task posting is free. Premium tier unlocks AI features (Event Scheduler, Document Scanner), advanced analytics, and white-label NGO portal. We could also offer a "Verified NGO" badge paid subscription and data insights to CSR departments of corporates.

---

**Q: What's your plan for volunteer retention?**
A: Impact Score, streak tracking, and task history on the volunteer profile create gamification hooks. The AI Coach on ViewTask reduces friction for first-time volunteers. Future roadmap: badges, leaderboards, and NGO ratings of volunteers.

---

*Last updated: 2026-05-10 | Impact AI Hackathon Study Guide*
