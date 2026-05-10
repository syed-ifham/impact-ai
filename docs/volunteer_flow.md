# 🙋 Volunteer Flow — Impact AI (Hackathon Study Guide)

> **Purpose:** Complete revision document for the Volunteer side of the Impact AI platform.  
> **Stack:** React + Vite · Firebase Auth + Firestore · Gemini AI (gemini-1.5-flash) · React Router v6 · Lucide Icons

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Authentication & Role System](#2-authentication--role-system)
3. [Route Map](#3-route-map)
4. [Page-by-Page Flow](#4-page-by-page-flow)
5. [Component Breakdown](#5-component-breakdown)
6. [Firestore Data Interactions](#6-firestore-data-interactions)
7. [AI Integration Point (ViewTask Coach)](#7-ai-integration-point-viewtask-coach)
8. [Invite System Flow](#8-invite-system-flow)
9. [Key Points & Must Remembers](#9-key-points--must-remembers)
10. [Hackathon Counter Questions & Answers](#10-hackathon-counter-questions--answers)

---

## 1. System Overview

```
/auth  (Login / Sign Up)
   |
   +-- role == 'volunteer'
   |
   v
/volunteer (VolunteerHome — Dashboard)
   |
   +-- /volunteer/find-tasks    (Browse all open tasks)
   |         |
   |         +-- /volunteer/task/:taskId  (ViewTask + AI Coach)
   |
   +-- /volunteer/events        (Browse events with volunteer roles)
   |
   +-- /volunteer/profile       (Stats, skills, task history)
```

The **Volunteer** is the task consumer. Their journey is:
1. Register and set up profile (skills, location)
2. Browse the live task feed OR receive an invite from an NGO
3. View task details + optionally ask the AI Coach for preparation guidance
4. Accept the task (one-click)
5. Track activity and impact score on their profile

---

## 2. Authentication & Role System

### Volunteer Firestore Profile (`users/{uid}`)
```json
{
  "role": "volunteer",
  "fullName": "Aman Singh",
  "email": "aman@gmail.com",
  "location": "Delhi",
  "skills": ["First Aid", "Teaching", "Data Entry"],
  "tasksCompleted": 4,
  "hoursGiven": 12,
  "impactScore": 320,
  "streak": 5,
  "createdAt": "ISO timestamp"
}
```

### Role Guard
- All volunteer routes use `RoleProtectedRoute allowedRoles={['volunteer']}`
- If an NGO tries to access `/volunteer`, they are redirected to `/`
- If unauthenticated user hits `/volunteer`, redirected to `/auth`

### Auth Context
```js
const { currentUser, userData } = useAuth();
// currentUser.uid   — used in Firestore queries
// userData.fullName — displayed in welcome banners
// userData.skills   — used in NGO's AI matching
// userData.role     — used by RoleProtectedRoute
```

---

## 3. Route Map

```
/volunteer                          -> VolunteerHome       [Volunteer only]
/volunteer/find-tasks               -> FindTasks           [Volunteer only]
/volunteer/task/:taskId             -> ViewTask            [Volunteer only]
/volunteer/events                   -> VolunteerEvents     [Volunteer only]
/volunteer/profile                  -> VolunteerProfile    [Volunteer only]
```

**Note:** All volunteer routes are top-level (`/volunteer/*`), NOT nested under `/dashboard`. The volunteer has their own nav (`VolunteerNav`) instead of the NGO sidebar.

---

## 4. Page-by-Page Flow

### 4.1 Volunteer Home (`/volunteer`)

**File:** `pages/volunteer/VolunteerHome.jsx`

#### Layout Structure
```
VolunteerHome
  |
  +-- VolunteerNav (top navigation bar with links)
  |
  +-- Welcome Banner
  |     - Background hero image with dark overlay
  |     - Displays: "Welcome back, {userData.fullName}!"
  |
  +-- StatsRow (live from Firestore)
  |     - Tasks Completed, Invites Pending, Active Tasks, Impact Score
  |
  +-- AI Promotion Banner
  |     - Promotes AI Coach feature (available in ViewTask)
  |     - CTA: "Try it on a Task" -> /volunteer/find-tasks
  |
  +-- Two-Column Layout
        +-- Left (2/3): TaskFeed (live open tasks from Firestore)
        +-- Right (1/3): 
              +-- ProfileWidget (avatar, name, "View Profile" link)
              +-- ImpactWidget (impact score gauge)
              +-- Map teaser ("Needs in your area" -> future feature)
```

#### Key Behavior
- `TaskFeed` uses `onSnapshot` — real-time updates as NGOs post new tasks
- All task cards in the feed link to `/volunteer/task/:taskId`
- Stats are fetched from Firestore user document + tasks query on mount

---

### 4.2 Find Tasks (`/volunteer/find-tasks`)

**File:** `pages/volunteer/FindTasks.jsx`

#### Flow
```
Page loads -> onSnapshot listener on tasks WHERE status == 'open'
  |
  +-- Raw tasks sorted client-side by urgency DESC (highest first)
  |
  +-- Hero search bar at top (full-width)
  |     Filter fields: title, category, location, ngoName
  |
  +-- Results grid of TaskCard components
  |
  +-- [Optional] URL query param: ?event=<eventId>
        Filter tasks WHERE eventId matches -> shows tasks for a specific event
```

#### Search Behavior
```js
// Real-time filter on the client-side:
filteredTasks = tasks.filter(task => {
  if (eventIdFilter && task.eventId !== eventIdFilter) return false;
  if (!searchQuery.trim()) return true;
  return (
    task.title.includes(query) ||
    task.category.includes(query) ||
    task.location.includes(query) ||
    task.ngoName.includes(query)
  );
});
```

#### Key Points
- Uses `onSnapshot` (real-time) — tasks appear instantly when NGOs post them
- Sort: client-side by `urgency` descending (no Firestore index needed for this field alone)
- Empty state: shows a friendly "No tasks found" card with "Clear Search" button
- Sort dropdown exists in UI (Highest Urgency / Newest First / Closest to Me) but only urgency sort is implemented

---

### 4.3 View Task (`/volunteer/task/:taskId`)

**File:** `pages/volunteer/ViewTask.jsx`

#### Full Flow Diagram
```
URL: /volunteer/task/abc123
  |
  +-- Fetch task: getDoc(db, 'tasks', taskId)
  |     IF not found -> showToast('Task not found') + redirect to /volunteer/find-tasks
  |
  +-- Main Layout (65% / 35% split on desktop):
  |
  |   [LEFT — Content]
  |   +-- Title Card
  |   |     - Category badge (blue for regular, purple for Event Role)
  |   |     - Task title (h1)
  |   |     - Location + Organizer (NGO name) meta row
  |   |
  |   +-- Mission Details Card
  |   |     - Full description (whitespace-pre-wrap preserved)
  |   |
  |   +-- "Ask Impact AI" Card (dark themed)
  |         - Initial state: description + "Generate Success Guide" button
  |         - Click -> Gemini API call with task details as context
  |         - Loading state: spinner + "Analyzing requirements..."
  |         - Result state: formatted AI guidance displayed in dark panel
  |
  |   [RIGHT — Action Panel (sticky sidebar)]
  |   +-- Status Overview Card
  |   |     - Urgency meter (progress bar, color-coded)
  |   |     - Deadline (if set)
  |   |     - Event name (if isEventTask)
  |   |
  |   +-- Accept Button (or "You're Assigned!" if already accepted)
  |         - Regular task: "Accept This Task" (indigo)
  |         - Event task: "Join Event Team" (purple)
  |         - On click: updateDoc(tasks/taskId, { status:'accepted', acceptedBy: uid, acceptedAt })
  |
  +-- Help notice: "Contact the organizer via your dashboard"
```

#### Accept Task Logic
```js
await updateDoc(doc(db, 'tasks', task.id), {
  status: 'accepted',
  acceptedBy: currentUser.uid,
  acceptedAt: new Date().toISOString(),
});
// Local state update: task.status = 'accepted', task.acceptedBy = currentUser.uid
// Button changes to: "You're Assigned!" (green, disabled)
```

#### Event Task vs Regular Task

| Property | Regular Task | Event Task |
|----------|-------------|------------|
| `isEventTask` | false | true |
| `eventId` | null | event document ID |
| `eventName` | null | "Beach Cleanup Drive" |
| Accept button | "Accept This Task" (indigo) | "Join Event Team" (purple) |
| Category badge | blue | purple |

---

### 4.4 Volunteer Events (`/volunteer/events`)

**File:** `pages/volunteer/VolunteerEvents.jsx`

- Lists all events posted by NGOs (fetched from `events` collection)
- Each event card links to `/volunteer/find-tasks?event=<eventId>`
  - This filters FindTasks to show only roles for that specific event
- Shows: event name, location, NGO name, number of roles, timeline preview

---

### 4.5 Volunteer Profile (`/volunteer/profile`)

**File:** `pages/volunteer/VolunteerProfile.jsx`

#### Layout
```
VolunteerProfile
  |
  +-- Cover gradient header (emerald/teal/cyan)
  +-- Avatar (initials from fullName)
  +-- Name, username handle (@firstname_lastname), location
  +-- Role badge: "Volunteer"
  |
  +-- Stats Row (4 metrics):
  |     +-- Tasks Completed  (from userData.tasksCompleted)
  |     +-- Hours Given      (from userData.hoursGiven)
  |     +-- Impact Score     (from userData.impactScore)
  |     +-- Streak           (from userData.streak, in days)
  |
  +-- Skills (from userData.skills array)
  |     - Displayed as pill badges
  |
  +-- Activity Feed
        - All tasks where acceptedBy == currentUser.uid
        - Shows: task title, category badge, location, acceptedAt date, status
```

#### Data Fetched
```js
// 1. User stats from Firestore
getDoc(doc(db, 'users', currentUser.uid))

// 2. Accepted tasks
query(collection(db, 'tasks'), where('acceptedBy', '==', currentUser.uid))
```

---

## 5. Component Breakdown

### Navigation Component
**`components/volunteer/VolunteerNav.jsx`**
- Top navigation bar (NOT sidebar — different from NGO's DashboardLayout)
- Links: Home, Find Tasks, Events, Profile
- Displays user avatar initials + name
- "Sign Out" option

### Task Components

| Component | File | Purpose |
|-----------|------|---------|
| `TaskCard` | `components/volunteer/TaskCard.jsx` | Individual task card in FindTasks feed. Links to /volunteer/task/:id |
| `TaskFeed` | `components/volunteer/TaskFeed.jsx` | Live feed of open tasks (real-time). Used in VolunteerHome |

### Sidebar Widgets

| Component | File | Data Source |
|-----------|------|-------------|
| `StatsRow` | `components/volunteer/StatsRow.jsx` | Live counts from Firestore (accepted tasks, pending invites) |
| `ProfileWidget` | `components/volunteer/ProfileWidget.jsx` | `useAuth()` userData — name, initials, link to profile |
| `ImpactWidget` | `components/volunteer/ImpactWidget.jsx` | `userData.impactScore` — displayed as gauge/score |

### TaskCard Key Details
```
TaskCard
  +-- Urgency color strip (top border)
  +-- Category badge
  +-- Urgency score circle
  +-- Task title
  +-- Description (line-clamp-2)
  +-- Location + Deadline meta
  +-- NGO name
  +-- "View Task" button -> /volunteer/task/:taskId
```

---

## 6. Firestore Data Interactions

### Reads Summary

| Page | Collection | Query Type | Method |
|------|------------|-----------|--------|
| VolunteerHome > TaskFeed | `tasks` | `status == 'open'` | `onSnapshot` (real-time) |
| FindTasks | `tasks` | `status == 'open'` | `onSnapshot` (real-time) |
| ViewTask | `tasks` | single doc by ID | `getDoc` (one-time) |
| VolunteerProfile > Stats | `users` | single doc by uid | `getDoc` (one-time) |
| VolunteerProfile > Activity | `tasks` | `acceptedBy == uid` | `getDocs` (one-time) |
| StatsRow | `invites` | `volunteerId == uid, status == 'pending'` | `getDocs` (one-time) |
| VolunteerEvents | `events` | all events | `getDocs` (one-time) |

### Writes Summary

| Action | Collection | Operation | Fields Written |
|--------|------------|-----------|----------------|
| Accept Task | `tasks/{taskId}` | `updateDoc` | status, acceptedBy, acceptedAt |

---

## 7. AI Integration Point (ViewTask Coach)

**File:** `pages/volunteer/ViewTask.jsx` — `handleAskAi()`

### What It Does
The AI Coach provides a personalized preparation guide for any volunteer task.

### Prompt Structure
```
You are an expert volunteer coordinator and AI coach.
Analyze this volunteer task:
Title: {task.title}
Category: {task.category}
Location: {task.location}
Description: {task.description}

Provide a structured, highly actionable guide with sections:
1. "🎯 Primary Objective" — One-sentence success summary
2. "🎒 What to Prepare/Bring" — 3-4 bullet points
3. "✅ Step-by-Step Execution" — 3-4 clear on-site steps
4. "⚠️ Crucial Dos & Don'ts" — 2 tips (one Do, one Don't)

Keep formatting clean using standard text with emojis. No markdown code blocks.
```

### Response Rendering
- **No JSON parsing** — raw text response is rendered as `whitespace-pre-wrap` in a dark panel
- UI transitions: `idle -> loading -> result`
- Loading state shows: "Analyzing requirements & generating your guide..."
- Error fallback: toast notification + no state change

### UI States of the AI Card
```
State 1 (idle):
  Dark card + description + "Generate Success Guide" button

State 2 (loading):
  Dark card + spinner + "Analyzing requirements..." text

State 3 (result):
  Dark card + "AI COACH PLAYBOOK" header + formatted guidance text
```

---

## 8. Invite System Flow

### How NGO Sends Invites
```
NGO (VolunteerMatcher) -> selects task + volunteers -> clicks "Invite to Task"
  |
  +-- addDoc(db, 'invites', {
        taskId, taskTitle, ngoId, ngoName,
        volunteerId, status:'pending', createdAt
      })
```

### How Volunteer Sees Invites
```
StatsRow component (VolunteerHome)
  |
  +-- getDocs(query(invites WHERE volunteerId==uid AND status=='pending'))
  |
  +-- Count displayed as "X Pending Invites" stat
```

### Invite Status Machine
```
pending -> (volunteer accepts) -> accepted
pending -> (volunteer declines) -> declined
```

**NOTE:** In current implementation, volunteers can see invite count in StatsRow but there is no dedicated "Invites" page to view and respond to individual invites. This is a known gap/future feature.

---

## 9. Key Points & Must Remembers

### Routing
- Volunteer routes are `/volunteer/*` — completely separate from `/dashboard/*`
- VolunteerHome is the entry point — NOT nested inside DashboardLayout
- ViewTask uses dynamic route: `/volunteer/task/:taskId` (taskId from `useParams()`)
- Event filtering: `/volunteer/find-tasks?event=<eventId>` via `useSearchParams()`

### Real-time vs One-time Reads
- TaskFeed and FindTasks use `onSnapshot` — volunteers always see latest tasks
- Profile and stats use `getDocs` / `getDoc` — fetched once on mount
- ViewTask uses `getDoc` — fetched once (task details don't need real-time for this UX)

### Task Acceptance
- Single `updateDoc` call — sets `status: 'accepted'`, `acceptedBy: uid`, `acceptedAt: ISO`
- Button changes immediately via local state update (no re-fetch required)
- `isEvent` flag on task changes button text and color
- Once accepted, button becomes disabled green badge "You're Assigned!"

### AI Coach (ViewTask)
- API key must be present in `client/.env` as `VITE_GEMINI_API_KEY`
- Uses `gemini-1.5-flash` text-only model (not vision)
- Response is raw text — no JSON parsing
- One response per task view — no regeneration option in current implementation

### Profile / Stats
- `impactScore`, `tasksCompleted`, `hoursGiven`, `streak` are stored in the Firestore user doc
- Currently these are NOT auto-updated when a task is accepted/completed (manual seeding or Cloud Functions needed)
- Skills array (`userData.skills`) feeds into the NGO's AI Volunteer Matching algorithm

### Invite System Gap
- Invites are created by NGO and counted for the volunteer
- No UI for volunteer to view/accept/decline individual invites yet
- `status: 'pending'` count shown in StatsRow

### Event Tasks
- Event tasks show purple badge instead of blue
- Accept button says "Join Event Team" instead of "Accept This Task"
- Event tasks have `eventId` and `eventName` — allows grouping on events page
- Volunteer can also find event tasks via: `/volunteer/find-tasks?event=<eventId>`

---

## 10. Hackathon Counter Questions & Answers

### Feature / UX Questions

**Q: What's the volunteer user journey from start to finish?**
A: Sign up -> set skills/location -> land on dashboard (VolunteerHome) -> browse real-time task feed or get invited by NGO -> click task -> read description + get AI coaching -> accept task with one click -> task shows in profile activity feed. The entire flow takes under 5 minutes.

---

**Q: How does a volunteer know what tasks are right for them?**
A: Two ways: (1) Passive — the TaskFeed shows all open tasks sorted by urgency, with clear category badges and location info. (2) Active — NGOs use the AI Volunteer Matcher to find and invite skill-matched volunteers directly. The AI scores matches based on keyword overlap between task description and volunteer skills.

---

**Q: What's the AI Coach feature and why is it valuable?**
A: First-time volunteers often feel overwhelmed — "What should I bring? How do I handle this situation?" The AI Coach analyzes the task details and generates a personalized, actionable preparation guide with sections for Objective, What to Bring, Step-by-Step Execution, and Dos & Don'ts. It lowers the barrier for first-time participation.

---

**Q: Can a volunteer accept the same task multiple times or accept an already-accepted task?**
A: No — when a task is accepted, `status` changes to `'accepted'`. FindTasks only queries `WHERE status == 'open'`, so the task disappears from the feed. The accept button on ViewTask changes to a disabled "You're Assigned!" badge — no second click possible.

---

**Q: What happens when two volunteers try to accept the same task simultaneously?**
A: This is a race condition. Currently there's no server-side transaction — both `updateDoc` calls could succeed, with the last write winning. In production, we'd use a Firestore transaction (`runTransaction`) that checks if `acceptedBy` is still null before committing.

---

### Technical Questions

**Q: Why does FindTasks use `onSnapshot` instead of `getDocs`?**
A: Real-time experience — volunteers need to see tasks appear instantly as NGOs post them without refreshing. `onSnapshot` sets up a persistent WebSocket-based listener. The cleanup function (`return () => unsub()`) ensures the listener is removed when the component unmounts to prevent memory leaks.

---

**Q: How does the `?event=` URL parameter work in FindTasks?**
A: We use React Router's `useSearchParams()` hook. If `eventId = searchParams.get('event')` is non-null, we add a filter `task.eventId !== eventId -> return false`. The Events page links to this URL so volunteers see only roles relevant to a specific event.

---

**Q: How does the profile page know which tasks belong to a volunteer?**
A: We query `tasks WHERE acceptedBy == currentUser.uid`. The `acceptedBy` field is set to the volunteer's `uid` when they accept a task. This is a standard Firestore query — no complex join needed because the volunteer's uid is denormalized into the task document.

---

**Q: Why store `skills` as an array in the user document? What are the trade-offs?**
A: Array fields in Firestore support `array-contains` queries, so we can query "all volunteers with skill X" efficiently. The trade-off: Firestore doesn't support `array-contains-any` with more than 10 values, and skills are currently matched client-side anyway. For production, a proper search index (Algolia) on volunteer skills would be better.

---

**Q: What does the `StatsRow` component actually calculate?**
A: It fetches two things: (1) count of tasks where `acceptedBy == currentUser.uid` — to show active/accepted tasks count, (2) count of invites where `volunteerId == currentUser.uid AND status == 'pending'` — to show pending invites. Combined with `userData.tasksCompleted` and `impactScore` from the user document.

---

### Data / Architecture Questions

**Q: How does the volunteer's task history persist after a task is marked complete?**
A: The task document `status` changes to `'completed'` (done by NGO in ManageTasks). The `acceptedBy` field remains set to the volunteer's uid. The profile page queries ALL tasks where `acceptedBy == uid` regardless of status — so completed tasks show in activity feed too.

---

**Q: Are volunteer skills used anywhere beyond the NGO matcher?**
A: Currently yes — the NGO's AI Volunteer Matcher reads `userData.skills` from the Firestore `users` collection to compute match scores. Skills are set during registration (in AuthPage) and shown on the volunteer profile. Future use: skill-based task recommendations in the volunteer feed.

---

**Q: How would you add a notification system for invite responses?**
A: We'd add a Firestore `notifications` collection. When an NGO sends an invite, a Cloud Function triggered on `invites` document creation would create a notification document for the volunteer. The volunteer's app would use `onSnapshot` on their notifications — a real-time badge counter. Push notifications via Firebase Cloud Messaging for mobile.

---

### Product Questions

**Q: How do volunteers build credibility on the platform?**
A: Impact Score + task history on the profile page. Each completed task increments `tasksCompleted` and `hoursGiven`. The `impactScore` is a composite metric. The streak field encourages continued engagement. These stats are visible to NGOs in the VolunteerMatcher — volunteers with higher scores and more skills get higher match scores.

---

**Q: What prevents fake volunteer profiles from gaming the system?**
A: Current implementation relies on Firebase Auth for identity verification. For production: (1) Aadhaar/ID verification integration, (2) NGO rating of volunteers post-task, (3) minimum task completion requirement before appearing in matcher. The `impactScore` can't be manually inflated since it's updated only via Cloud Functions triggered by actual task completions.

---

**Q: How would you handle volunteer no-shows or task abandonment?**
A: Currently there's no mechanism — once accepted, there's no "un-accept". In production: (1) A "Request Release" button on ViewTask that sets `status: 'release_requested'`, (2) NGO can approve and reopen the task, (3) Repeated no-shows penalize the impactScore and appear on the profile. This incentivizes commitment.

---

**Q: Why did you build a separate volunteer UI instead of one unified dashboard?**
A: The NGO and volunteer workflows are fundamentally different. NGOs need a dense, tool-heavy dashboard (sidebar nav, multiple data tools). Volunteers need a simple, mobile-friendly experience (full-width nav, card-based feed). Merging them would compromise both UX. The separate routing also makes role enforcement explicit and clean.

---

*Last updated: 2026-05-10 | Impact AI Hackathon Study Guide*
