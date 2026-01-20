# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Firebase-based project (`diensanh`) using a React + TypeScript + Vite frontend (`web/` directory) and Python-based data/analytics backend components.

## Environment & Tools
- **Project ID**: `diensanh-45eb1`
- **Frontend**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Zustand, TanStack Query
- **Backend/Data**: Python 3.14 (in `src/` and `venv`), Firebase (Firestore, etc.)
- **Hosting**: Vercel (frontend), Firebase (backend services)

## Common Commands

### Frontend (`web/` directory)
- `npm run dev` - Start development server
- `npm run build` - Type check and build for production
- `npm run lint` - Lint code using ESLint
- `npm run preview` - Preview production build
- `vercel deploy --prod` - Deploy frontend to Vercel (requires token)

### Backend / Data
- `python3 src/scraper/dichvucong-scraper.py` - Run public service scraper
- `python3 src/vector-store.py` - Run vector store operations

### Firebase Operations
- `firebase login` - Login to Firebase
- `firebase init` - Initialize Firebase services
- `firebase deploy` - Deploy all services
- `firebase emulators:start` - Start local Firebase emulators

### Maintenance
- `python3 ~/.claude/scripts/generate_catalogs.py --skills` - Update skills catalog
- `python3 ~/.claude/scripts/generate_catalogs.py --commands` - Update commands catalog

## Project Structure
- `web/` - Frontend application (React + Vite)
- `src/` - Python source code (scrapers, vector store, API)
- `plans/` - Strategy and implementation plans
- `docs/` - Project documentation
- `data/` - Data storage (vector store, scraped content)
- `scripts/` - Utility scripts (e.g., seeding)
- `firebase.json` - Firebase configuration
- `firestore.rules` - Firestore security rules

## Coding Standards
- **Frontend**:
  - Use Functional Components with Hooks
  - Use Zustand for global state management
  - Use TanStack Query for data fetching
  - Use Tailwind CSS for styling (v4)
  - Follow ESLint configuration
- **General**:
  - Follow **YAGNI**, **KISS**, and **DRY** principles
  - Use **kebab-case** for file naming
  - Organize documentation in `docs/` and plans in `plans/`
