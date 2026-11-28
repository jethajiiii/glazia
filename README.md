# 🎨 Glazia — Mini Design Canvas

> **Technical Assignment: Full Stack Developer Internship — Windoors**  
> A production-grade, interactive 2D canvas editor that allows users to create, manipulate, customize, save, and reload vector graphics designs with real-time state management and cloud persistence.

---

## 🔗 Live Deployments

- **🌐 Live Web Application (Frontend)**: [https://glazia-kappa.vercel.app/](https://glazia-kappa.vercel.app/)
- **🚀 Cloud API Service (Backend)**: [https://glazia.onrender.com/](https://glazia.onrender.com/)
- **🏥 API Health Check**: [https://glazia.onrender.com/health](https://glazia.onrender.com/health)
- **📦 GitHub Repository**: [https://github.com/jethajiiii/glazia](https://github.com/jethajiiii/glazia)

---

## ✨ Features

### 🖌️ Core Features
| Feature | Details |
|---|---|
| **Interactive Canvas** | 800 × 600 px React Konva stage with support for pan, zoom, and freeform placement |
| **Shape Creation** | Create Rectangles, Circles, Text boxes, and Sticky Notes from an accessible floating toolbar |
| **Object Manipulation** | Click-to-select with full multi-handle Konva Transformer for dragging, resizing, and rotation |
| **Real-time Properties Panel** | Live two-way sync: coordinates ($X, Y$), dimensions (width, height, radius), rotation angle, curated 9-color palette, and hex input |
| **Canvas CRUD** | Create new canvases, rename titles, save state, browse existing designs, and delete canvases |
| **Full Persistence** | Full element fidelity stored and restored from MongoDB (type, geometry, colors, rotation, text, font size) |
| **Data-Loss Guard** | Live "Unsaved Changes" indicator, `beforeunload` browser warnings, and dirty-state confirmation before switching canvases |

### 🌟 Bonus & Advanced Capabilities
| Feature | Details |
|---|---|
| **Layer Management** | Full z-index ordering (Bring Forward, Send Backward, Bring to Front, Send to Back) + interactive Layers Tree panel |
| **Undo / Redo** | 50-entry state history stack (`Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z`) with compound drag/transform grouping |
| **Zoom & Pan Controls** | Smooth mouse-wheel zoom (10% to 500%), canvas panning, bottom floating zoom dock with reset (`Ctrl+0`) |
| **Grid & Snapping** | Toggleable 20px dot/grid background with active geometric snap-to-grid alignment |
| **High-Res PNG Export** | One-click stage export at 2× pixel ratio with automated transformer handle hiding and sanitized filenames |
| **Auto-Save System** | Debounced 3-second background auto-save to cloud with status indicators in header |
| **Keyboard Shortcuts** | Delete (`Backspace`/`Delete`), Nudge (`Arrow keys`, `Shift+Arrow`), Undo/Redo, Zoom shortcuts |
| **Resilience & Testing** | React `ErrorBoundary` with fallback UI, 121 client unit tests, 35 server tests, and 0 lint warnings |

---

## 🏗 System Architecture

### Frontend Architecture (`client/`)
```
UI Components (React 18 + CSS Modules / Vanilla CSS)
       │
Custom Hooks (useCanvasActions · useAutoSave · useZoomPan · useKeyboardShortcuts)
       │
Zustand Store (Single source of truth — elements, selection, history stack, canvas metadata)
       │
React Konva Stage (Stage → Grid Layer → Shape Layer → Selection Transformer)
       │
HTTP Client (fetch with AbortController, auto-retries, uniform error unwrapping)
       │
Express API Gateway (https://glazia.onrender.com/api)
```

### Save / Load Data Flow
```
[SAVE ACTION]
User clicks "Save" / Auto-save triggers
  → useCanvasActions.save()
    → canvasApi.update(id, { name, elements })
      → PUT /api/canvases/:id
        → Express Rate Limiter & Helmet
          → Zod Validation Middleware (validates discriminated element schema)
            → CanvasService.update()
              → MongoDB Atlas (CanvasModel.findByIdAndUpdate)

[LOAD ACTION]
User selects canvas in CanvasListModal
  → useCanvasActions.open(id)
    → AbortController cancels any pending in-flight requests
      → GET /api/canvases/:id
        → CanvasService.getById()
          → MongoDB Atlas
            → store.loadCanvas(canvas) (hydrates Zustand store, resets dirty state)
```

### Backend Architecture (`server/`)
```
Express Server (src/app.js)
  │
  ├── Security Middleware (Helmet headers, dynamic CORS whitelist, Rate Limiting)
  ├── Request Logging (Morgan) & JSON Body Parser (10mb limit)
  │
  └── Express Router (/api)
        ├── Health Check Routes (GET /health, GET /api/health)
        │
        └── Canvas Routes (/api/canvases)
              │
              ├── Zod Request Validation (Validates canvas name and element shapes)
              ├── Controller Layer (Thin parsing and response formatting)
              ├── Service Layer (Business logic, MongoDB ObjectId checks)
              └── Mongoose Model (Discriminated schemas for rect, circle, text)
                    └── MongoDB Atlas Cluster
```

---

## 🛠 Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 18, Vite 6 |
| **Canvas Rendering** | React Konva, Konva.js |
| **Client State Management** | Zustand 5 with custom History & Selectors |
| **Styling & Icons** | Clean Custom Design System (Excalidraw aesthetic), Google Material Symbols |
| **Backend Runtime** | Node.js 20+ (ES Modules), Express 4 |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 (Discriminated schemas) |
| **Validation** | Zod (End-to-end schema validation) |
| **Security & Hardening** | Helmet, CORS, Express-Rate-Limit, Safe Body Limits |
| **Testing** | Vitest 2, Supertest, React Testing Library, `mongodb-memory-server` |
| **Deployment** | Vercel (Frontend SPA), Render (Backend API Web Service) |

---

## 📁 Repository Structure

```
glazia/
├── README.md                      ← Master combined project documentation
├── mini-design-canvas/
│   ├── package.json               ← Monorepo workspace root (client + server scripts)
│   ├── README.md                  ← Workspace documentation
│   ├── .gitignore
│   │
│   ├── client/                    ← React 18 + React Konva frontend
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── vitest.config.js
│   │   ├── vercel.json            ← Vercel client-side routing rewrites
│   │   ├── .env.example
│   │   └── src/
│   │       ├── api/               ← httpClient, canvasApi
│   │       ├── components/
│   │       │   ├── canvas/        ← CanvasStage, shapes, SelectionTransformer
│   │       │   ├── canvasList/    ← CanvasListModal, NewCanvasModal
│   │       │   ├── header/        ← App Header, title editing, save indicator
│   │       │   ├── properties/    ← PropertiesPanel, LayersPanel
│   │       │   ├── toolbar/       ← Floating tools, note tool, shape buttons
│   │       │   └── ui/            ← Button, Modal, Toast, ErrorBoundary
│   │       ├── constants/         ← Defaults, element types, colors
│   │       ├── hooks/             ← useZoomPan, useKeyboardShortcuts, useAutoSave
│   │       ├── store/             ← useEditorStore (Zustand), history, selectors
│   │       ├── styles/            ← layout.css, global design system
│   │       └── utils/             ← exportStage, gridUtils, debounce, arrayOrder
│   │
│   └── server/                    ← Node.js + Express REST API backend
│       ├── package.json
│       ├── .env.example
│       ├── tests/                 ← Vitest + Supertest integration tests
│       │   ├── canvas.api.test.js
│       │   ├── canvasService.test.js
│       │   └── hardening.test.js
│       └── src/
│           ├── index.js           ← HTTP server entry point & graceful shutdown
│           ├── app.js             ← Express app setup, CORS, Helmet, routes
│           ├── config/            ← env.js (Zod typed config), db.js (MongoDB)
│           ├── controllers/       ← canvasController.js
│           ├── middleware/        ← validateBody, errorHandler, notFound
│           ├── models/            ← Canvas.js (Mongoose discriminated schemas)
│           ├── routes/            ← Express routers
│           ├── schemas/           ← Zod canvas & element schemas
│           └── services/          ← canvasService.js
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- A **MongoDB** database:
  - Local: `mongodb://localhost:27017/glazia`
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/jethajiiii/glazia.git
cd glazia/mini-design-canvas
```

### Step 2: Install Dependencies
This project uses **npm workspaces**. Running `npm install` at the workspace root installs all dependencies for both client and server:
```bash
npm install
```

### Step 3: Configure Environment Variables

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```
Fill in your configuration:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/glazia
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
BODY_LIMIT=10mb
```

**Frontend (`client/.env`):**
```bash
cp client/.env.example client/.env
```
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4: Run Development Servers

You can run both client and server simultaneously using workspace scripts:

```bash
# Terminal 1: Backend API (runs on port 5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on port 5173)
npm run dev:client
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing & Verification

The project includes thorough automated test suites covering both the frontend client and backend server:

```bash
# Run all client tests (121 tests)
npm run test:client

# Run all server tests (35 tests using in-memory MongoDB)
npm run test:server

# Run the complete test suite across all packages
npm test

# Run ESLint across client and server
npm run lint

# Build client for production
npm run build:client
```

### Test Coverage Highlights:
- **Client (121 tests)**: Zustand store actions, undo/redo history stack, transform calculations, array ordering, grid snapping, export logic, error boundary fallbacks, debounce handlers.
- **Server (35 tests)**: REST API CRUD endpoints, Zod schema validation, invalid input handling, rate limiting enforcement, body size boundaries, Mongoose discriminators, 404 & error handlers.

---

## 📡 REST API Documentation

**Base API URL**: `https://glazia.onrender.com/api` (or `http://localhost:5000/api` locally)

All endpoints return a uniform JSON envelope:
```json
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Detailed error explanation",
  "details": [ ... ]
}
```

### 1. Health Checks
- **`GET /health`** or **`GET /api/health`**
  - Confirms server process is healthy and reports uptime.
  - **Response 200 OK**:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-11-28T09:21:20.756Z",
      "uptime": 96.84
    }
    ```

### 2. Canvas CRUD Endpoints

#### `GET /api/canvases`
Lists all saved canvases (summary view without full element payloads for high performance).
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "6b09df080d348e64250bc5c4",
        "name": "Project Mockup",
        "updatedAt": "2026-11-28T08:50:22.891Z"
      }
    ]
  }
  ```

#### `POST /api/canvases`
Creates a new design canvas.
- **Request Body**:
  ```json
  {
    "name": "Landing Page Wireframe",
    "width": 800,
    "height": 600,
    "elements": [
      {
        "id": "elem-1",
        "type": "rect",
        "x": 120,
        "y": 80,
        "width": 200,
        "height": 100,
        "fill": "#3b82f6",
        "rotation": 0
      }
    ]
  }
  ```
- **Response 201 Created**: Returns the persisted canvas document with generated `_id`.

#### `GET /api/canvases/:id`
Retrieves a complete canvas with all elements.
- **Response 200 OK**: Returns full canvas including `elements` array.
- **Response 404 Not Found**: If the canvas ID does not exist.

#### `PUT /api/canvases/:id`
Updates an existing canvas title and element graph.
- **Request Body**: Same schema as `POST /api/canvases`.
- **Response 200 OK**: Returns updated canvas document.

#### `DELETE /api/canvases/:id`
Permanently deletes a canvas.
- **Response 200 OK**: `{ "success": true, "data": null }`

---

## 🚢 Deployment Guide

### Backend on Render
1. Create a **Web Service** on [Render](https://render.com/).
2. Connect repository `jethajiiii/glazia`.
3. Set **Root Directory** to `mini-design-canvas/server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/glazia`
   - `CLIENT_ORIGIN`: `https://glazia-kappa.vercel.app`

### Frontend on Vercel
1. Import repository `jethajiiii/glazia` on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `mini-design-canvas/client`.
3. Framework Preset: `Vite` (Build Command: `npm run build`, Output Directory: `dist`).
4. Add Environment Variable:
   - `VITE_API_URL`: `https://glazia.onrender.com`
5. Deploy.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| `Delete` / `Backspace` | Delete currently selected element |
| `Ctrl + Z` / `⌘ + Z` | Undo last action |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo action |
| `Arrow Keys` | Nudge selected element by 1px |
| `Shift + Arrow Keys` | Nudge selected element by 10px |
| `Ctrl + +` / `Ctrl + -` | Zoom in / Zoom out |
| `Ctrl + 0` | Reset canvas zoom to 100% |
| `Escape` | Deselect active element |

---

## 📄 License
This project was developed as a technical evaluation assignment for the Full Stack Developer Internship at Windoors.
