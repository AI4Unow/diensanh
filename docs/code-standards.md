# Code Standards

## General Principles
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features until they are required.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable code over complex abstractions.
- **DRY (Don't Repeat Yourself)**: Extract common logic into utilities or hooks.

## Naming Conventions
- **Files & Directories**: Use `kebab-case` (e.g., `village-management.tsx`, `auth-service.py`).
- **Frontend (TypeScript)**:
  - **Components**: `PascalCase` (e.g., `ResidentCard.tsx`).
  - **Variables/Functions**: `camelCase`.
  - **Constants**: `UPPER_SNAKE_CASE`.
- **Backend (Python)**:
  - **Classes**: `PascalCase`.
  - **Functions/Variables**: `snake_case`.

## Frontend (React + TypeScript)
- **Functional Components**: Use arrow functions and functional components only.
- **Hooks**: Use custom hooks for complex logic and data fetching.
- **State Management**:
  - Use **Zustand** for simple global state.
  - Use **React Query** for all server-side data (fetching, caching, mutations).
  - **Mutation Preference**: Prefer `useMutation` (from React Query) for all asynchronous actions (e.g., Auth, Form Submissions) instead of managing local `loading`/`error` states manually.
- **Styling**: Use **Tailwind CSS** utility classes. Avoid custom CSS files unless absolutely necessary.
- **Components**: Leverage **shadcn/ui** for consistent accessible UI elements.
- **File Size**: Keep files under 200 lines; split into smaller sub-components if needed.

## Backend (Python + FastAPI)
- **Modular Design**: Group related routes into FastAPI routers.
- **Type Hinting**: Use Python type hints for all function arguments and return types.
- **Async/Await**: Prefer asynchronous operations for I/O bound tasks (database, API calls).
- **Documentation**: Use Pydantic models for request/response validation and auto-generated OpenAPI documentation.

## Design System & UI/UX
- **Typography**:
  - Primary Font: "Be Vietnam Pro".
  - Base Font Size: 18px (optimized for elderly accessibility).
  - Line Height: 1.6 (standard for long-form readability).
- **Color Tokens**:
  - Transition to **OKLCH** color space for better perceptual uniformity.
  - Primary Color (Government Blue): `#1d4ed8`.
  - Accessibility: Maintain **WCAG AAA** compliance for all text/background contrasts.
- **UX Requirements**:
  - **Touch Targets**: Minimum 48px for all interactive elements.
  - **Visual Feedback**: Highly visible focus rings for keyboard navigation.
  - **Loading States**: Use mutation-based loading states (skeleton screens or spinners) for all data-fetching operations.

## Database & Security
- **NoSQL Schema**: Follow a flat document structure where possible; use sub-collections for clear ownership (e.g., `villages/{id}/households`).
- **Security Rules**: Never allow public write access. All writes must be authenticated and validated against roles.
- **Data Protection**: Encrypt sensitive resident information (CCCD, private contact info) before saving to Firestore.

## Git & Workflow
- **Commit Messages**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Review**: All major changes must be reviewed by the `code-reviewer` agent or a human developer.
