# TaskFlow — MERN Stack Task Tracker

A production-quality full-stack Task Tracker built with **MongoDB, Express, React, and Node.js**. Demonstrates CRUD operations, REST API design, MongoDB integration, form validation, and responsive UI with dynamic updates.

---

## Project Structure

```
task-tracker/
├── backend/                    # Node.js + Express REST API
│   ├── models/
│   │   └── Task.js             # Mongoose schema & model
│   ├── routes/
│   │   └── tasks.js            # All task CRUD route handlers
│   ├── server.js               # Express app, middleware, DB connection
│   ├── .env                    # Environment variables (customize this)
│   └── package.json
│
├── frontend/                   # React.js SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── taskAPI.js      # Axios-based API service layer
│   │   ├── components/
│   │   │   ├── TaskForm.jsx    # Create / Edit modal with validation
│   │   │   ├── TaskCard.jsx    # Individual task card with actions
│   │   │   ├── StatsBar.jsx    # Summary statistics
│   │   │   ├── FilterBar.jsx   # Search, filter, sort controls
│   │   │   └── Toast.jsx       # Notification toasts
│   │   ├── hooks/
│   │   │   └── useTasks.js     # Custom hook: all task state logic
│   │   ├── App.js              # Root component, layout, orchestration
│   │   └── App.css             # Complete design system & styles
│   └── package.json
│
└── README.md
```

---

## Tech Stack

| Layer      | Technology              | Purpose                              |
|------------|-------------------------|--------------------------------------|
| Frontend   | React 18                | SPA with hooks, no Redux needed      |
| HTTP Client| Axios                   | API calls with interceptors          |
| Backend    | Node.js + Express 4     | REST API server                      |
| Database   | MongoDB + Mongoose      | Document storage with schema         |
| Styling    | Pure CSS (no framework) | Custom design system with CSS vars   |

---

## Features

### Core CRUD
- **Create** tasks with title, description, status, priority, due date, tags
- **Read** all tasks in a Kanban-style 3-column board (To Do / In Progress / Done)
- **Update** tasks via edit modal, or quick-advance status with one click
- **Delete** single tasks (with confirmation) or bulk-clear all completed

### REST API (Express)
| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/tasks`              | List tasks (filterable, sortable)  |
| GET    | `/api/tasks/stats`        | Aggregate counts by status/priority|
| GET    | `/api/tasks/:id`          | Single task                        |
| POST   | `/api/tasks`              | Create task                        |
| PUT    | `/api/tasks/:id`          | Full update                        |
| PATCH  | `/api/tasks/:id/status`   | Quick status change                |
| DELETE | `/api/tasks/:id`          | Delete one                         |
| DELETE | `/api/tasks?status=completed` | Bulk delete completed          |
| GET    | `/api/health`             | Health check                       |

### Form Validation
- Client-side: real-time per-field on blur, all fields on submit
- Server-side: Mongoose validators with descriptive error messages
- Errors surfaced inline below each input

### MongoDB / Mongoose
- Schema with enums, min/max lengths, default values, timestamps
- Compound indexes on `status + priority` and `createdAt`
- Virtual field `isOverdue`
- Aggregation pipeline for stats

### Dynamic UI
- Kanban board updates instantly without page refresh
- Debounced search (350ms) avoids excess API calls
- Stats counter updates after every mutation
- Toast notifications for all user actions
- Loading bar during API requests

---

## Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend

```bash
cd backend
npm install

# Edit .env if needed (default: localhost:27017)
# MONGODB_URI=mongodb://localhost:27017/tasktracker
# PORT=5000

npm start           # production
npm run dev         # development (nodemon hot-reload)
```

Backend will start at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

React app will open at **http://localhost:3000**

---

## Environment Variables (backend/.env)

```env
MONGODB_URI=mongodb://localhost:27017/tasktracker
PORT=5000
```

For MongoDB Atlas, replace the URI:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tasktracker
```

---

## Key Design Decisions

### Custom `useTasks` Hook
All state management lives in one custom hook (`src/hooks/useTasks.js`), keeping `App.js` clean and making the data layer independently testable.

### API Service Layer
`src/api/taskAPI.js` centralizes all HTTP calls. Axios interceptors normalize errors so components never need to parse error shapes.

### Optimistic-style Updates
After any mutation (create/update/delete), the local `tasks` state updates immediately—no re-fetch required—keeping the UI snappy.

### Server-side Filtering
Filtering and sorting happen in MongoDB (via query params) rather than in the browser, so the pattern scales to large datasets.

---

## Sample API Usage

```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Build login page","priority":"high","status":"todo","tags":["frontend"]}'

# Get all high-priority tasks, newest first
curl "http://localhost:5000/api/tasks?priority=high&sort=-createdAt"

# Mark a task complete
curl -X PATCH http://localhost:5000/api/tasks/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Get stats
curl http://localhost:5000/api/tasks/stats
```
