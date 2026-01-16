# Codebase Summary

## Directory Structure

```text
/
├── web/                # React + Vite Frontend (PWA)
│   ├── src/            # Frontend source code
│   │   ├── components/ # Shared UI components (shadcn/ui)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API and Firebase service wrappers
│   │   └── store/      # Zustand state management
│   ├── public/         # Static assets and PWA icons
│   └── vite.config.ts  # Vite & PWA configuration
├── src/                # Backend Python (FastAPI) source
│   ├── api/            # FastAPI routes and controllers
│   ├── scraper/        # Regulation and policy scrapers
│   └── vector-store.py # RAG vector database management
├── scripts/            # Utility and maintenance scripts
│   ├── seed-villages.ts # Database seeding for 20 villages
│   └── setup.sh        # Project initialization script
├── plans/              # Implementation plans and research
│   └── reports/        # Sub-agent execution reports
├── docs/               # Project documentation
├── data/               # Local data files and assets
└── firebase.json       # Firebase configuration
```

## Key Components

### Frontend (`web/`)
- **App Entry**: `web/src/main.tsx`
- **PWA Service Worker**: Managed via `vite-plugin-pwa`.
- **Theme/UI**: Tailwind CSS with shadcn/ui components.

### Backend (`src/`)
- **Main API**: FastAPI application in `src/api/`.
- **AI/Chatbot**: RAG pipeline utilizing `vector-store.py`.
- **Scrapers**: Data ingestion tools in `src/scraper/`.

### Configuration
- **Firestore Rules**: `firestore.rules` (Security and access control).
- **Environment**: `.env` and `.env.local` (Vite-prefixed for frontend).

## How to Build & Run

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
1. Clone the repository.
2. Run `./setup.sh` to initialize environments.
3. Install frontend dependencies: `cd web && npm install`.
4. Install backend dependencies: `pip install -r requirements.txt`.

### Development
- **Start Frontend**: `cd web && npm run dev`
- **Start Backend**: `python3 run.py` (assumed entry point)
- **Firebase Emulators**: `firebase emulators:start`

### Deployment
- **Frontend**: Automatically deployed to Vercel on push to `main`.
- **Backend**: Deployed to Google Cloud Run via CI/CD.
- **Firebase**: `firebase deploy --only functions,firestore,storage`
