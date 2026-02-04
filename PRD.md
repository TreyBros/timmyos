# TimmyOS Product Requirements Document

## 1. Executive Summary

TimmyOS is a real-time dashboard that provides complete visibility into Clawdbot agent operations. It visualizes system health, memory architecture, task management, and agent activity in a beautiful, modern interface.

**Core Value Proposition:**
- See everything Timmy does in real-time
- Monitor system health to prevent crashes
- Visualize memory across local files and Knowcore
- Track tasks, sessions, and agent network activity
- Execute quick actions without CLI commands

---

## 2. Feature Requirements

### P0 - Core Dashboard (Must Have)

#### 2.1 System Health Monitor
**Purpose:** Prevent Jetson crashes by monitoring resources

**Features:**
- Real-time RAM usage gauge (critical for 8GB Jetson)
- CPU temperature display with color-coded alerts
- Disk usage with log file size warnings
- Uptime counter
- Network connectivity status

**Data Sources:**
- `/proc/meminfo` - RAM statistics
- `/sys/class/thermal/thermal_zone0/temp` - Temperature
- `df -h` - Disk usage
- `uptime` - System uptime

**Visual Design:**
- Card-based layout with gradient backgrounds
- Green/Yellow/Red status indicators
- Mini sparkline charts showing trends
- Alert banner when RAM > 85%

#### 2.2 Memory Visualization
**Purpose:** Show what's in my brain (local + Knowcore)

**Features:**
- Split view: Local Memory vs Knowcore (TIMMYS BRAIN)
- File browser for `memory/*.md` files
- Knowcore chunk count and recent additions
- Search across all memory sources
- Memory graph showing connections between concepts

**Data Sources:**
- `/home/treyti/clawd/memory/` directory
- Knowcore API (`/api/v1/retrieve`)
- `MEMORY.md` curated facts

**Visual Design:**
- Two-column layout (Local | Cloud)
- File cards with preview snippets
- Knowledge graph visualization (D3.js)
- Search bar with instant results

#### 2.3 Task Board Integration
**Purpose:** Visual kanban for tracking work

**Features:**
- Display tasks from `/home/treyti/clawd/kanban/tasks.json`
- Columns: Todo | In Progress | Done
- Drag-and-drop task movement
- Quick add new task
- Priority colors (High = red, Medium = yellow, Low = blue)

**Visual Design:**
- Trello-style kanban board
- Task cards with descriptions
- Progress indicators
- "Add Task" floating button

#### 2.4 Session Activity Stream
**Purpose:** See what I'm doing right now

**Features:**
- Real-time message feed
- Current session status
- Recent tool calls (exec, read, write)
- Session duration and message count
- Live typing indicator when processing

**Data Sources:**
- Clawdbot session data
- Tool call logs
- Current working context

**Visual Design:**
- Terminal-like feed with timestamps
- Color-coded by message type (User/Assistant/Tool)
- Collapsible tool outputs
- "Live" pulse indicator

### P1 - Advanced Features (Should Have)

#### 2.5 Agent Network (Moltbook)
**Purpose:** Track my social presence on the agent internet

**Features:**
- Moltbook profile card (TimmyTheFox)
- Recent posts with engagement stats
- Agent network visualization (who follows me)
- Quick post composer
- Enigma connection status

**Data Sources:**
- Moltbook API
- `~/.config/moltbook/credentials.json`

**Visual Design:**
- Social media-style feed
- Profile header with avatar
- Post cards with like/reply counts
- Network graph of connected agents

#### 2.6 Skills & Capabilities
**Purpose:** Show what I can do

**Features:**
- Grid of installed skills (knowcore, weather, github, etc.)
- Skill status indicators (Ready/Error/Disabled)
- Last used timestamp
- Quick skill test buttons

**Data Sources:**
- `/home/treyti/clawd/skills/` directory
- Skill manifest files

**Visual Design:**
- Icon grid with tooltips
- Status badges
- Skill detail modal on click

#### 2.7 Scheduled Jobs (Cron)
**Purpose:** Visibility into automated tasks

**Features:**
- List of active cron jobs
- Next run countdown
- Last run status (success/failure)
- Quick enable/disable toggle

**Data Sources:**
- `crontab -l`
- Clawdbot cron job list
- Job run history

**Visual Design:**
- Timeline view
- Status dots
- Run history log

#### 2.8 Quick Actions Panel
**Purpose:** Execute common tasks without CLI

**Features:**
- Run health check
- Post to Moltbook
- Check Knowcore status
- View gateway status
- Trigger heartbeat manually
- Clear logs / free up space

**Visual Design:**
- Button grid
- Confirmation dialogs
- Toast notifications for results

### P2 - Premium Features (Nice to Have)

#### 2.9 FishBrain Project Tracker
**Purpose:** Monitor AI fishing assistant development

**Features:**
- Module completion status (capture, detector, inference, overlay)
- Data collection stats
- Hardware connection status
- Demo video player

**Data Sources:**
- `/home/treyti/clawd/fishbrain/` directory
- Git commits
- Test results

#### 2.10 VAPI Integration
**Purpose:** Voice agent call monitoring

**Features:**
- VAPI connection status
- Recent call logs
- "Abby" voice agent configuration
- Webhook endpoint status

**Data Sources:**
- VAPI dashboard API
- Webhook logs

#### 2.11 Predictive Alerts
**Purpose:** Prevent problems before they happen

**Features:**
- RAM usage trending → alert if heading toward OOM
- Temperature trending → alert if overheating
- Disk space → alert if logs filling up
- Crash prediction based on patterns

**Visual Design:**
- Alert sidebar
- Configurable thresholds
- Alert history

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (fast dev server)
- Tailwind CSS (styling)
- Recharts (charts)
- Lucide React (icons)
- React Query (data fetching)
- Zustand (state management)

**Backend:**
- Node.js + Express
- WebSocket for real-time updates
- Knowcore SDK integration
- File system watchers
- System command execution

**Data Fetching:**
- REST API for most data
- WebSocket for real-time updates
- Server-Sent Events for live activity stream

### 3.2 Backend API Endpoints

```
GET  /api/health           → System health (RAM, CPU, temp, disk)
GET  /api/memory/local     → Local memory files listing
GET  /api/memory/knowcore  → Knowcore chunks count
GET  /api/tasks            → Kanban tasks
GET  /api/sessions         → Active sessions
GET  /api/skills           → Installed skills
GET  /api/cron             → Scheduled jobs
GET  /api/moltbook         → Moltbook profile/posts
POST /api/actions/:action  → Execute quick actions
WS   /ws/realtime          → WebSocket for live updates
```

### 3.3 Data Flow

```
┌─────────────────────────────────────────────┐
│              TimmyOS Dashboard               │
│  (React + WebSocket + REST API calls)        │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌────▼────┐    ┌────▼────┐
│Express│    │WebSocket│    │Knowcore │
│Server │    │ Server  │    │  API    │
└───┬───┘    └────┬────┘    └────┬────┘
    │             │              │
    └─────────────┴──────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌────▼────┐    ┌────▼────┐
│System │    │  Files  │    │ Clawdbot│
│ Stats │    │  (FS)   │    │ Gateway │
└───────┘    └─────────┘    └─────────┘
```

---

## 4. UI/UX Design

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  🧠 TimmyOS                                    [🔔] [👤]│
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ SYSTEM │    MAIN CONTENT AREA (responsive grid)         │
│ HEALTH │    ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│        │    │  Memory  │ │  Tasks   │ │ Sessions │     │
│ ┌────┐ │    └──────────┘ └──────────┘ └──────────┘     │
│ │RAM │ │    ┌──────────┐ ┌──────────┐                   │
│ │CPU │ │    │ Moltbook │ │  Skills  │                   │
│ │Temp│ │    └──────────┘ └──────────┘                   │
│ │Disk│ │                                                │
│ └────┘ │                                                │
│        │                                                │
│ QUICK  │    ACTIVITY STREAM (bottom panel)              │
│ACTIONS │    [timestamp] User: message                   │
│        │    [timestamp] Timmy: response                 │
│ [Btn1] │    [timestamp] → Tool: exec(...)               │
│ [Btn2] │                                                │
│ [Btn3] │                                                │
└────────┴────────────────────────────────────────────────┘
```

### 4.2 Design System

**Colors:**
- Primary: `#6366f1` (indigo)
- Success: `#22c55e` (green)
- Warning: `#eab308` (yellow)
- Danger: `#ef4444` (red)
- Background: `#0f172a` (dark slate)
- Card: `#1e293b` (lighter slate)
- Text: `#f8fafc` (white)
- TextMuted: `#94a3b8` (gray)

**Typography:**
- Font: Inter (system fallback)
- Headings: 600 weight
- Body: 400 weight
- Monospace: JetBrains Mono (for code/logs)

**Components:**
- Cards with `border-radius: 12px`
- Subtle shadows and borders
- Smooth transitions (200ms)
- Hover states with scale/transform

### 4.3 Responsive Breakpoints

- Desktop: 3-column grid
- Tablet: 2-column grid  
- Mobile: 1-column stack
- Sidebar collapses to hamburger menu on mobile

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Vite + React + TS)
- [ ] Design system (Tailwind config)
- [ ] Backend Express server
- [ ] System health endpoint
- [ ] Basic dashboard layout

**Deliverable:** Working health monitor with RAM/CPU/temp

### Phase 2: Core Features (Week 2)
- [ ] Memory file browser
- [ ] Knowcore integration
- [ ] Task board (read-only)
- [ ] Session activity feed
- [ ] WebSocket for real-time updates

**Deliverable:** Full dashboard with all P0 features

### Phase 3: Interactivity (Week 3)
- [ ] Drag-and-drop task board
- [ ] Quick actions panel
- [ ] Add/edit tasks
- [ ] Moltbook integration
- [ ] Skills display

**Deliverable:** Interactive dashboard with write capabilities

### Phase 4: Polish (Week 4)
- [ ] Knowledge graph visualization
- [ ] Predictive alerts
- [ ] Mobile responsiveness
- [ ] Dark/light mode toggle
- [ ] Performance optimization

**Deliverable:** Production-ready TimmyOS v1.0

---

## 6. Success Criteria

### 6.1 Performance
- Dashboard loads in < 2 seconds
- Real-time updates propagate in < 500ms
- Handles 100+ tasks without lag
- Works on Jetson Nano (limited resources)

### 6.2 Reliability
- 99% uptime for dashboard
- Graceful degradation if services down
- Auto-reconnect WebSocket
- Clear error messages

### 6.3 User Experience
- All data visible without scrolling
- One-click access to common actions
- Mobile-friendly for phone checks
- Beautiful enough to show off

### 6.4 Functionality
- All P0 features working
- System alerts prevent crashes
- Memory search returns relevant results
- Tasks sync with kanban board

---

## 7. Data Sources Summary

| Feature | Source | Method | Update Frequency |
|---------|--------|--------|------------------|
| RAM/CPU/Temp | `/proc/` files | File read | Every 5 seconds |
| Local Memory | `memory/*.md` | File system | On file change |
| Knowcore | Knowcore API | HTTP API | On user action |
| Tasks | `kanban/tasks.json` | File read | On change |
| Sessions | Clawdbot gateway | Gateway API | Real-time |
| Skills | `skills/` directory | File system | On startup |
| Cron Jobs | `crontab` | Command | Manual refresh |
| Moltbook | Moltbook API | HTTP API | Every 5 minutes |

---

## 8. Future Roadmap

**v1.1:**
- FishBrain project tracker
- VAPI call logs
- Session replay
- Export memory to PDF

**v1.2:**
- Multi-agent support
- Remote access via Tailscale
- Voice commands
- Custom widgets

**v2.0:**
- Plugin architecture
- Third-party integrations
- Mobile app
- AI-powered insights

---

## 9. Appendix

### A. File Structure
```
timmyos/
├── src/
│   ├── components/
│   │   ├── SystemHealth/
│   │   ├── MemoryBrowser/
│   │   ├── TaskBoard/
│   │   ├── ActivityStream/
│   │   └── QuickActions/
│   ├── hooks/
│   ├── stores/
│   ├── api/
│   └── App.tsx
├── server/
│   ├── index.ts
│   ├── routes/
│   └── websocket.ts
├── public/
└── package.json
```

### B. Environment Variables
```
TIMMYOS_PORT=3333
KNOWCORE_API_KEY=kc_live_...
MOLTBOOK_API_KEY=moltbook_sk_...
CLAWDBOT_GATEWAY_URL=ws://127.0.0.1:18789
```

### C. Running Locally
```bash
# Install dependencies
npm install

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
npm run dev

# Open browser
open http://localhost:3333
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-04  
**Author:** Timmy (Clawdbot Agent)
