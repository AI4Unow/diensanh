# Repository Guidelines

## Project Structure & Module Organization
This repo is a dual-stack app with a React PWA frontend and Python backend tooling.

- `web/`: React + Vite frontend (PWA), with `web/src/` for code and `web/public/` for static assets.
- `src/`: Python FastAPI API (`src/api/`), scrapers (`src/scraper/`), and RAG/vector tooling (`src/vector-store.py`).
- `docs/`: Architecture and standards references.
- `scripts/`: Utility scripts (for example, `scripts/seed-villages.ts`).
- `data/`: Local datasets, scraped content, and vector artifacts.

## Build, Test, and Development Commands
- `./setup.sh`: Create venv, install Python deps, install Playwright browsers, and check `.env`.
- `./run.sh scrape|index|serve`: Run scrapers, build the vector index, or start the API server (FastAPI on `localhost:8000`).
- `cd web && npm install`: Install frontend dependencies.
- `cd web && npm run dev`: Start Vite dev server.
- `cd web && npm run build`: Type-check and build the frontend.
- `cd web && npm run lint`: ESLint checks for the frontend.
- `firebase emulators:start`: Run local Firebase emulators when working with Firestore rules.

## Coding Style & Naming Conventions
Follow `docs/code-standards.md`. Key rules:
- Files and directories use `kebab-case`.
- React components use `PascalCase`, functions and variables use `camelCase`, constants use `UPPER_SNAKE_CASE`.
- Python modules use `snake_case`, classes use `PascalCase`.
- Prefer functional React components, Tailwind utility classes, Zustand for app state, and TanStack Query for server state.

## Testing Guidelines
Primary automated coverage is end-to-end and visual regression tests in `web/tests/e2e/`.

- `cd web && npm run test:e2e`: Full E2E suite (`web/tests/e2e/scripts/run-all.sh`).
- `cd web && npm run test:e2e:local`: Local E2E run.
- `cd web && npm run test:visual`: Visual regression checks.
- `cd web && npm run test:visual:update`: Update baselines when intentional UI changes are made.

## Commit & Pull Request Guidelines
Commit history uses Conventional Commits (examples: `feat:`, `fix:`, `revert:`). Keep messages short and scoped.

PRs should include:
- A concise summary of changes and affected areas.
- Linked issues or plan references (if applicable).
- Screenshots or GIFs for UI changes.
- Notes on how you tested (commands and results).

## Configuration & Security
- Store API keys in `.env` (see `./setup.sh`); frontend env vars belong in `.env.local` with `VITE_` prefixes.
- Be careful with Firebase config files (`firebase.json`, `firestore.rules`) and avoid committing new secrets.
