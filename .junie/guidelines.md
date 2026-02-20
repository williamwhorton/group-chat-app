### Tech Stack Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5.7.
- **Backend/Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Real-time**: Supabase Realtime for instant messaging.
- **Styling**: Tailwind CSS 3.4+, shadcn/ui (Radix UI primitives).
- **Validation**: Zod (for forms and API schemas), React Hook Form.
- **Testing**: Jest 29, React Testing Library, Cypress 13.

### Coding Standards

- **React & Next.js**:
  - Prefer functional components and hooks.
  - Use Server Components by default; add `'use client'` only when interactivity or browser APIs are required.
  - Use `createClient` from `@/lib/supabase/server` for SSR and `@/lib/supabase/client` for client-side operations.
  - Handle asynchronous operations using `async/await` and structured `try/catch` blocks.
- **TypeScript**:
  - Ensure strict type safety; avoid using `any`.
  - Define clear interfaces for database entities (e.g., `Message`, `Channel`, `Profile`).
  - Use Zod schemas for both client-side and server-side validation.
- **Error Handling**:
  - Return consistent JSON error responses from API routes (e.g., `{ error: 'Message' }`).
  - Log errors to the console or an error-tracking service in production.
  - Provide user-friendly feedback via `sonner` toasts or error states in the UI.

### Database & Supabase

- **Schema Management**:
  - All database changes should be defined in SQL scripts under the `scripts/` directory.
  - Follow the naming convention `###_description.sql` (e.g., `001_create_schema.sql`).
- **Security (RLS)**:
  - Row Level Security (RLS) MUST be enabled for all public tables.
  - Define granular policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations based on `auth.uid()`.
- **Server-Side Operations**:
  - Use Supabase SSR for authentication and database access in API routes and Server Components.
  - Sensitive operations (e.g., creating invitations, account deletion) should be handled via API routes.

### Testing Requirements

- **Unit & Integration Tests**:
  - Use Jest and React Testing Library for component and logic testing.
  - **Coverage Threshold**: A minimum of **80% line coverage** is required for all PRs.
- **E2E Testing**:
  - Use Cypress for critical user flows (e.g., login, channel creation, messaging).
- **Execution**:
  - Run unit tests: `pnpm test`
  - Run tests with coverage: `pnpm test:coverage`
  - Run E2E tests: `pnpm test:e2e`

### Git & Workflow

- **Bug Documentation**:
  - All bug fixes must be summarized in `BUGFIXES.md` at the project root.
  - Each entry should include: date, issue description, root cause, applied solution, and verification steps.
  - Whenever a bug is detected, consult `BUGFIXES.md` to check if it is a regression or if there was a related issue in the past.
- **Pre-commit Hooks**:
  - Husky is configured to run formatting (Prettier), linting (ESLint), and unit tests (with coverage check) before every commit.
  - Commits will fail if formatting is incorrect, linting errors exist, or test coverage falls below 80%.
- **Formatting**:
  - Maintain consistent code style using Prettier.
  - Run `pnpm format:fix` to automatically resolve formatting issues.
- **Linting**:
  - Follow Next.js and ESLint recommendations.
  - Run `pnpm lint` to check for issues and `pnpm lint:fix` for automatic fixes.

### UI & Styling

- **Tailwind CSS**:
  - Use utility classes for styling.
  - Follow the established design system and use variables from `globals.css`.
- **Components**:
  - Leverage shadcn/ui components for consistency.
  - Components are located in `components/ui/` (primitives) and `components/` (feature-specific).
- **Responsive Design**:
  - Ensure all features are mobile-friendly using Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`).

### Skills

- When necessary, access the skills in the `.junie/skills/` directory.
