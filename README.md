# Treehouse Group Chat

A real-time group chat application with web and mobile support, built as a monorepo.

## Overview

This is a **Turborepo monorepo** containing:
- **Web App**: Next.js 16 application with real-time messaging
- **Mobile App**: React Native (Expo) mobile application (scaffolded)
- **Shared Packages**: Common code shared between platforms

## Features

- **User Authentication**: Sign up and login with email/password
- **Channel Management**: Create channels, invite members, delete channels
- **Real-time Messaging**: Send and receive messages instantly with Supabase Realtime
- **Message History**: View past messages in channels
- **Account Management**: Delete your account and owned channels
- **Mobile & Desktop**: Fully responsive design

## Monorepo Structure

```
treehouse-monorepo/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native (Expo) mobile app
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── shared-supabase/   # Supabase client & helpers
│   ├── shared-utils/      # Validation, formatting, constants
│   └── shared-config/     # ESLint, TypeScript configs
└── [root files continue to contain web app temporarily]
```

## Tech Stack

### Web App
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Testing**: Jest, Testing Library, Cypress

### Mobile App
- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **Storage**: Expo Secure Store

### Shared
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Monorepo**: Turborepo + pnpm workspaces
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions, Husky
- **Deployment**: Vercel (web), EAS Build (mobile)

## Testing & Code Quality

This project includes comprehensive testing and code quality checks:

- **Unit Tests**: Jest with Testing Library (80% coverage required)
- **E2E Tests**: Cypress for integration testing
- **Linting**: ESLint with Next.js and Prettier configs
- **Pre-commit Hooks**: Automatic formatting, linting, and testing before commits
- **CI/CD**: GitHub Actions workflow runs tests on all PRs to main

See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Running Tests

```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Linting
pnpm lint

# Format code
pnpm format:fix
```

### Monorepo Commands

```bash
# Run both web and mobile dev servers
pnpm dev

# Run web app only
pnpm dev:web

# Run mobile app only
pnpm dev:mobile

# Build all apps
pnpm build

# Build web app only
pnpm build:web

# Run tests across all packages
pnpm test
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project

### Local Development

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env.local` file with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Create the database schema in Supabase by running the SQL scripts in order:
   - `scripts/001_create_schema.sql`
   - `scripts/002_create_rls_policies.sql`
   - `scripts/003_create_channel_invitations.sql`
   - `scripts/004_invitation_rpcs.sql`

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Mobile Development

The mobile app is scaffolded but not fully implemented. To run it:

```bash
# Start mobile development server
pnpm dev:mobile

# Or from apps/mobile directory
cd apps/mobile
pnpm dev
```

Then press:
- `i` for iOS Simulator (Mac only)
- `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

See [apps/mobile/README.md](./apps/mobile/README.md) for detailed mobile app documentation and [MOBILE_PLAN.md](./MOBILE_PLAN.md) for the complete mobile integration strategy.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

The app will be live immediately!

## Database Schema

The application uses the following Supabase tables:

- **profiles**: User profiles linked to auth.users
- **channels**: Chat channels with creator information
- **channel_members**: Membership tracking
- **messages**: Chat messages with timestamps
- **channel_invitations**: Email-based invitations for private channels

All tables have Row Level Security enabled to protect user data.

## Features Detail

### Authentication Flow

- Users sign up with email and password
- Email verification required
- User profiles auto-created on signup
- Sessions managed via Supabase Auth

### Channel Creation

- Only authenticated users can create channels
- Channel creator is the owner
- Owners can invite members and delete channels
- Deleting a channel cascades to delete all messages

### Messaging

- Real-time message delivery via Supabase Realtime
- Message history persists in database
- Users can see all messages in channels they're members of
- Messages show sender username and timestamp

### Account Deletion

- Users can delete their own accounts
- Deletes all channels created by the user
- Removes user from other channels
- Messages in other channels remain intact

## Project Structure

```
treehouse-monorepo/
├── apps/
│   ├── web/                  # Next.js web app (placeholder)
│   │   ├── package.json
│   │   └── README.md
│   └── mobile/               # React Native mobile app
│       ├── app/              # Expo Router screens
│       ├── assets/
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── shared-types/         # TypeScript types
│   │   └── src/
│   │       └── index.ts
│   ├── shared-supabase/      # Supabase client & helpers
│   │   └── src/
│   │       ├── client.ts
│   │       └── auth.ts
│   ├── shared-utils/         # Validation & utilities
│   │   └── src/
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   └── shared-config/        # Shared configs
│       ├── tsconfig.base.json
│       └── eslint-config.js
│
├── [Web app files in root temporarily]
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── scripts/              # Database migrations
│
├── package.json              # Root package.json (monorepo)
├── pnpm-workspace.yaml       # pnpm workspace config
├── turbo.json               # Turborepo config
├── MOBILE_PLAN.md           # Mobile integration plan
└── README.md                # This file
```

## Environment Variables

Required for production:

```
NEXT_PUBLIC_SUPABASE_URL          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Your Supabase anonymous key
```

## License

MIT
