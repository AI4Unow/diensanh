# System Architecture

## Overview
The Dien Sanh Commune Management system is a multi-tier application designed for high availability, offline capability, and low-latency interaction. It leverages a modern cloud-native stack to serve the administrative needs of UBND xã Diễn Sanh.

## Architecture Diagram (Logical)
- **Frontend**: React PWA (Vite)
- **Backend API**: Python (FastAPI) + Firebase Functions
- **Database**: Google Cloud Firestore (NoSQL)
- **Intelligence**: RAG-based Chatbot (Vector Store)
- **Authentication**: Firebase Auth (Phone OTP)
- **Communication**: SMS Abstraction Layer (VNPT/eSMS/Stringee)

## 1. Frontend (Mobile-First PWA)
The frontend is built as a Progressive Web App (PWA) to handle the intermittent connectivity common in rural areas.

- **Framework**: React + Vite + TypeScript.
- **Styling**: Tailwind CSS + shadcn/ui with "Vietnamese Government Aesthetic" design system tokens.
- **State Management**:
  - **Zustand**: For global UI state (auth, navigation).
  - **React Query**: For server state synchronization and caching.
- **Offline Support**:
  - **Firestore Offline Persistence**: Enables data access without internet.
  - **vite-plugin-pwa (Workbox)**: Service worker management for asset caching and background sync.
- **Deployment**: Hosted on **Vercel** for optimal global delivery.

## 2. Backend & Services
The system utilizes a hybrid backend approach combining serverless functions with a dedicated API service.

- **FastAPI (Python)**:
  - Handles complex logic, scraping, and the RAG (Retrieval-Augmented Generation) pipeline.
  - Deployed on **Google Cloud Run** for scalability.
- **Firebase Functions (Node.js/TypeScript)**:
  - Handles database triggers, authentication hooks, and lightweight background tasks.
- **RAG System**:
  - **Scrapers**: Custom Python scripts to ingest local regulations and public service data.
  - **Vector Store**: Storage for document embeddings used by the AI chatbot.

## 3. Data Layer
- **Google Cloud Firestore**:
  - Primary NoSQL database for resident data, household records, and task management.
  - Organized by `villages` (20 total), `households`, and `residents`.
  - **Security**: Granular Firestore Security Rules based on user roles (`commune_admin`, `village_leader`, `public`).
  - **Encryption**: Sensitive data (e.g., CCCD numbers) is encrypted before storage.
- **Firebase Storage**: For document and media storage (e.g., scans of official documents).

## 4. Communication & Integration
- **SMS Abstraction Layer**: A unified API to interact with multiple Vietnamese SMS providers (VNPT, eSMS, Stringee).
- **Firebase Auth**: Supports Phone Number OTP login, which is the primary authentication method for residents and village leaders.
