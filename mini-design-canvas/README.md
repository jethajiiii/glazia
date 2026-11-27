# Mini Design Canvas

A lightweight, interactive 2D canvas editor built with React, React Konva, Zustand, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend**: React 18, React Konva, Konva, Zustand, Vite
- **Backend**: Node.js, Express.js (ES Modules), MongoDB (Mongoose), Zod
- **Tooling**: ESLint, Prettier, Nodemon

## Project Structure

```text
mini-design-canvas/
├── client/          # Vite + React 18 + React Konva frontend
│   └── src/
│       ├── api/         # API clients and HTTP services
│       ├── components/  # Shared presentational UI components
│       ├── features/    # Domain-specific feature modules
│       ├── hooks/       # Custom reusable React hooks
│       ├── store/       # Zustand state management
│       ├── constants/   # Centralized constants and defaults
│       ├── utils/       # Pure helper functions
│       └── styles/      # Global styling
└── server/          # Node.js + Express backend (ES modules)
    └── src/
        ├── config/      # Environment and database configuration
        ├── models/      # Mongoose schemas and data models
        ├── routes/      # Express route definitions
        ├── controllers/ # HTTP request handlers
        ├── services/    # Business logic layer
        ├── validators/  # Zod validation schemas
        ├── middleware/  # Error handlers and middleware
        └── utils/       # Utility functions and custom errors
```

## Setup & Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

2. Install server dependencies:
   ```bash
   cd ../server
   npm install
   ```

### Configuration

Copy `.env.example` to `.env` in both `client` and `server`:

```bash
# In client/
cp .env.example .env

# In server/
cp .env.example .env
```

### Running the Application

- **Run Client**:
  ```bash
  cd client
  npm run dev
  ```
  Accessible at `http://localhost:5173`

- **Run Server**:
  ```bash
  cd server
  npm run dev
  ```
  Accessible at `http://localhost:5000`
