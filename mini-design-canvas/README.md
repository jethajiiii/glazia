# 🎨 Glazia — Mini Design Canvas

> A lightweight, browser-based vector design tool built as an internship assignment for **Windoors**.  
> Draw shapes, write text, style properties, organise layers, undo anything, and persist work to MongoDB — all in the browser.

---

## 📸 Screenshots / Demo

> Replace the placeholder below with a real screenshot or animated GIF after running the app.

![Screenshot](docs/screenshot.png)

---

## ✨ Features

### Core
| Feature | Details |
|---|---|
| **Canvas** | 800 × 600 px React Konva stage; pan/scroll ready |
| **Shapes** | Rectangle, Circle, Text — added from the toolbar |
| **Properties panel** | Live two-way sync: fill/stroke colour, opacity, border radius, font size, rotation |
| **Selection** | Click to select; Konva Transformer for drag, resize, rotate |
| **Canvas CRUD** | Create, rename, save, list, open, delete via REST API + MongoDB |
| **Persistence** | Full element fidelity restored on reload (position, size, colour, rotation, text, fontSize) |
| **Data-loss guard** | "Unsaved changes" banner; `beforeunload` warning; confirm dialog before switching canvases |

### Bonus
| Feature | Details |
|---|---|
| **Layer ordering** | Bring Forward / Send Backward / Bring to Front / Send to Back; layers panel in sidebar |
| **Undo / Redo** | 50-entry history stack; Ctrl+Z / Ctrl+Shift+Z; groups drag + transform into one entry |
| **Canvas zoom and pan** | Mouse wheel zoom (10%–500%), Space + drag pan, on-canvas zoom controls (− / + / reset), keyboard shortcuts (Ctrl+=, Ctrl+-, Ctrl+0) |
| **PNG Export** | `stage.toDataURL({ pixelRatio: 2 })`; Transformer hidden during export; filename sanitised from canvas name |
| **Auto-save** | Debounced (3 s); only when dirty and canvas is persisted; "Saving… / Saved" in header; never overlaps in-flight saves |
| **Grid + Snap** | Toggleable 20 px grid layer; snap-to-grid on drag |
| **Error Boundary** | React `ErrorBoundary` around editor with friendly fallback UI |
| **Accessibility** | ARIA labels, labelled inputs, focus rings, keyboard-operable toolbar, Lighthouse ≥ 90 |

---

## 🏗 Architecture

### Frontend layers (top → bottom)

```
UI Components  (React, CSS Modules)
      │
Hooks           useCanvasActions · useAutoSave · useZoomPan · useCanvasHistory
      │
Zustand Store   single source of truth — elements, selection, isDirty, history
      │
React Konva     Stage → Layer → Shape nodes
      │
API layer       canvasApi → httpClient (fetch + AbortController)
      │
Express REST API  (port 5000)
```

### Save / Load data flow

```
Save
  Header "Save" button
    → useCanvasActions.save()
      → canvasApi.update(id, { name, elements })
        → PUT /api/canvases/:id
          → validateBody (Zod)
            → CanvasService.update()
              → CanvasModel.findByIdAndUpdate()
                → MongoDB Atlas

Load
  CanvasListModal "Open" button
    → useCanvasActions.open(id)
      → canvasApi.getById(id)
        → GET /api/canvases/:id
          → CanvasService.getById()
            → CanvasModel.findById()
              → MongoDB Atlas
    ← store.loadCanvas(canvas)   ← elements, name, id hydrated into Zustand
```

### Backend layers

```
Express Router
  → Validation Middleware   (Zod schema; rejects with 400 + details array)
    → Controller            (thin: parse → service → respond)
      → CanvasService       (business logic, ID validation)
        → CanvasModel       (Mongoose; discriminated union for element types)
          → MongoDB Atlas
```

### Key design decisions

| Decision | Reason |
|---|---|
| **Zustand over Redux** | Zero boilerplate, granular selectors via `useStore(selector)`, built-in devtools |
| **Scale reset on transform end** | Konva applies scale to the node during transform; `getTransformPatch` reads `scaleX/Y` and converts back to concrete `width`/`height`/`radius`, then resets scale to 1 |
| **Circle origin at centre** | Konva `Circle` positions by centre (`x, y`), unlike `Rect` which uses top-left; factory and serialisation account for this |
| **History structural sharing** | History slices store only the `elements` array reference, not deep clones of the entire state; unchanged elements reuse the same object references |
| **Discriminated union validation** | Zod `z.discriminatedUnion('type', [...])` + Mongoose `discriminator()` give end-to-end type safety with a single source of schema truth |
| **AbortController on open** | Fast successive open clicks cancel the previous in-flight GET; prevents stale data races |

---

## 📁 Folder Structure

```
glazia/
└── mini-design-canvas/
    ├── package.json              ← npm workspaces root (scripts: dev:client, dev:server, test, lint)
    ├── README.md
    ├── .gitignore
    ├── .github/
    │   └── workflows/
    │       └── ci.yml            ← GitHub Actions: lint → test → build
    ├── client/                   ← Vite + React 18 app
    │   ├── vercel.json           ← Vercel SPA rewrite rule
    │   ├── .env.example
    │   ├── vite.config.js
    │   ├── vitest.config.js
    │   └── src/
    │       ├── api/              ← httpClient, canvasApi
    │       ├── components/
    │       │   ├── canvas/       ← Stage, Shape, Transformer wrappers
    │       │   ├── canvasList/   ← CanvasListModal, NewCanvasModal
    │       │   ├── editor/       ← Editor layout, ErrorBoundary
    │       │   ├── header/       ← Header (name, save, auto-save status)
    │       │   ├── panel/        ← PropertiesPanel, LayersPanel
    │       │   ├── toolbar/      ← Toolbar buttons, export, grid toggle
    │       │   └── ui/           ← Modal, Toast, shared primitives
    │       ├── hooks/            ← useCanvasActions, useAutoSave, useAsync, useDebouncedCallback
    │       ├── store/            ← Zustand store, history middleware, selectors
    │       ├── utils/            ← arrayOrder, exportStage, formatRelativeTime, sanitise
    │       └── __tests__/        ← Vitest unit tests (111 tests, 12 suites)
    └── server/                   ← Node.js ES Modules + Express 4
        ├── .env.example
        ├── package.json
        └── src/
            ├── config/           ← env.js (typed config from process.env)
            ├── models/           ← CanvasModel (Mongoose + discriminators)
            ├── schemas/          ← Zod validation schemas
            ├── middleware/        ← validateBody, errorHandler
            ├── controllers/      ← canvasController (thin HTTP layer)
            ├── services/         ← canvasService (business logic)
            ├── routes/           ← Express router
            └── __tests__/        ← Vitest + Supertest + mongodb-memory-server (35 tests)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **UI framework** | React 18 |
| **Canvas rendering** | React Konva (Konva.js) |
| **State management** | Zustand 5 |
| **Build tool** | Vite 6 |
| **Client testing** | Vitest 2 + Testing Library |
| **Server runtime** | Node.js 20 (ES Modules) |
| **HTTP framework** | Express 4 |
| **ODM** | Mongoose 8 |
| **Input validation** | Zod |
| **Server security** | Helmet, CORS, express-rate-limit |
| **Server testing** | Vitest + Supertest + mongodb-memory-server |
| **Database** | MongoDB Atlas (cloud) |
| **CI** | GitHub Actions |
| **Frontend deploy** | Vercel |
| **Backend deploy** | Render |

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18.0.0 and **npm** ≥ 9.0.0
- A **MongoDB** instance:
  - **Local**: MongoDB Community Server (no account needed)
  - **Cloud**: free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended for production)

---

## 🚀 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/jethajiiii/glazia.git
cd glazia/mini-design-canvas
```

### 2. Install all dependencies

The repo uses **npm workspaces**; a single install from the monorepo root installs both `client/` and `server/` packages:

```bash
npm install
```

### 3. Configure the server

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set `MONGO_URI` to your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/glazia
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **Local MongoDB** (no Atlas account): use `MONGO_URI=mongodb://127.0.0.1:27017/glazia`

### 4. Configure the client (optional)

The client uses `VITE_API_URL` from `client/.env`.  
It defaults to `http://localhost:5000/api` without a `.env` file; skip this step for local dev.

```bash
# Only needed if your server runs on a different port or host:
cp client/.env.example client/.env
# Then edit client/.env
```

### 5. Start the development servers

Open **two terminals** (or use the combined script):

```bash
# Terminal 1 — API server (port 5000)
npm run dev:server

# Terminal 2 — React client (port 5173)
npm run dev:client
```

Then open **http://localhost:5173** in your browser.

> **Combined** (two servers in one terminal, requires `concurrently`):
> ```bash
> npm run dev
> ```

---

## 📜 Scripts

All scripts are callable from the **monorepo root**:

| Script | What it does |
|---|---|
| `npm run dev:client` | Start Vite dev server (port 5173, HMR) |
| `npm run dev:server` | Start Express with nodemon (port 5000, auto-restart) |
| `npm run build:client` | Production Vite build → `client/dist/` |
| `npm run build:server` | No-op (ES Modules run directly; kept for parity) |
| `npm run test:client` | Vitest for `client/` |
| `npm run test:server` | Vitest + Supertest + mongodb-memory-server for `server/` |
| `npm test` | Run both test suites in sequence |
| `npm run lint` | ESLint on both `client/src/` and `server/src/` |

Inside each workspace (`cd client` or `cd server`) you can also run:

| Script | What it does |
|---|---|
| `npm run dev` | Start just this workspace's dev process |
| `npm test` | Run this workspace's tests |
| `npm run test:watch` | Watch mode (server only) |
| `npm run lint` | Lint this workspace |
| `npm run format` | Prettier format |

---

## 🔌 API Documentation

**Base URL** (local): `http://localhost:5000/api`

All responses follow a uniform envelope:

```jsonc
// Success
{ "success": true,  "data": <payload> }

// Error
{ "success": false, "message": "Human-readable description", "details": [ /* Zod issues */ ] }
```

---

### `GET /health`

Health check; confirms the server is running and MongoDB is connected.

**Response `200`**
```json
{ "success": true, "data": { "status": "ok", "mongo": "connected" } }
```

---

### `POST /canvases`

Create a new canvas.

**Request body**
```jsonc
{
  "name": "My Design",          // string, 1–100 chars, required
  "width": 800,                 // number, 1–4000, optional (default 800)
  "height": 600,                // number, 1–4000, optional (default 600)
  "elements": []                // array of element objects, optional
}
```

**Element object shapes**

*Rectangle*
```jsonc
{
  "type": "rect",
  "id": "uuid-v4",
  "x": 100, "y": 150,
  "width": 200, "height": 100,
  "fill": "#3b82f6",
  "stroke": "#1d4ed8",
  "strokeWidth": 2,
  "opacity": 1,
  "rotation": 0,
  "cornerRadius": 8
}
```

*Circle*
```jsonc
{
  "type": "circle",
  "id": "uuid-v4",
  "x": 400, "y": 300,          // centre coordinates
  "radius": 60,
  "fill": "#10b981",
  "stroke": "#065f46",
  "strokeWidth": 1,
  "opacity": 0.8,
  "rotation": 0
}
```

*Text*
```jsonc
{
  "type": "text",
  "id": "uuid-v4",
  "x": 50, "y": 50,
  "text": "Hello, Glazia!",
  "fontSize": 24,
  "fill": "#111827",
  "opacity": 1,
  "rotation": 0
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "My Design",
    "width": 800,
    "height": 600,
    "elements": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error responses**

| Status | When |
|---|---|
| `400` | Validation failure (name missing / too long, element field invalid) |

---

### `GET /canvases`

List all canvases (lightweight — no `elements` array).

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "My Design",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

---

### `GET /canvases/:id`

Get a single canvas with all elements.

**URL parameter**: `id` — MongoDB ObjectId string

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "My Design",
    "width": 800,
    "height": 600,
    "elements": [ /* ... */ ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error responses**

| Status | When |
|---|---|
| `400` | `id` is not a valid ObjectId |
| `404` | Canvas not found |

---

### `PUT /canvases/:id`

Update an existing canvas (full replacement of `name`, `width`, `height`, `elements`).

**URL parameter**: `id` — MongoDB ObjectId string

**Request body**: same schema as `POST /canvases`

**Response `200`**: same envelope as `GET /canvases/:id`

**Error responses**

| Status | When |
|---|---|
| `400` | Validation failure or invalid ObjectId |
| `404` | Canvas not found |

---

### `DELETE /canvases/:id`

Delete a canvas permanently.

**URL parameter**: `id` — MongoDB ObjectId string

**Response `200`**
```json
{ "success": true, "data": null }
```

**Error responses**

| Status | When |
|---|---|
| `400` | Invalid ObjectId |
| `404` | Canvas not found |

---

## 🌐 Deployment

### Frontend — Vercel

1. Import the repo into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `mini-design-canvas/client`.
3. Add the environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

4. `client/vercel.json` already contains the SPA rewrite rule — no extra config needed.

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Set **Root Directory** to `mini-design-canvas/server`.
3. **Build command**: `npm install`
4. **Start command**: `node src/app.js`
5. Add environment variables:

   | Key | Value |
   |---|---|
   | `PORT` | `5000` (Render overrides this automatically) |
   | `MONGO_URI` | `mongodb+srv://...` (from Atlas) |
   | `CLIENT_ORIGIN` | `https://<your-vercel-app>.vercel.app` |
   | `NODE_ENV` | `production` |
   | `RATE_LIMIT_WINDOW_MS` | `900000` |
   | `RATE_LIMIT_MAX` | `100` |
   | `BODY_LIMIT` | `10mb` |

### Database — MongoDB Atlas

1. Create a free **M0** cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and copy the connection string into `MONGO_URI`.
3. Under **Network Access**, add `0.0.0.0/0` (allow all IPs) so Render's dynamic IPs can connect.
4. Database name can be anything (e.g. `glazia`); Mongoose creates it automatically on first save.

### CORS

The Express server reads `CLIENT_ORIGIN` and passes it to the CORS middleware.  
Ensure this value **exactly matches** your Vercel deployment URL (no trailing slash):

```env
# server .env on Render
CLIENT_ORIGIN=https://glazia.vercel.app
```

---

## ⚠️ Known Limitations

- **No authentication** — anyone with the API URL can read, modify, or delete all canvases
- **No real-time collaboration** — concurrent edits from two clients will overwrite each other
- **No mobile / touch support** — Konva Transformer is not optimised for touch events
- **Text editing is single-line** — no multi-line or rich-text support
- **No image upload** — image elements are not implemented
- **History is session-only** — undo stack is lost on page reload
- **No versioning** — saving always overwrites; no revision history

---

## 🔗 Live Demo

- **Frontend (Vercel)**: [https://glazia-kappa.vercel.app/](https://glazia-kappa.vercel.app/)  
- **Backend API (Render)**: [https://glazia.onrender.com/](https://glazia.onrender.com/)  
- **API Health Check**: [https://glazia.onrender.com/health](https://glazia.onrender.com/health)

---

## 📄 Licence

This project was built as an internship assignment and is not licensed for redistribution.
