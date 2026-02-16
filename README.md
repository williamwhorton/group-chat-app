# Treehouse Group Chat Application

A real-time group chat application built with Next.js, React, Supabase, and Tailwind CSS.

## Features

- **User Authentication**: Sign up and login with email/password
- **Channel Management**: Create channels, invite members, delete channels
- **Real-time Messaging**: Send and receive messages instantly with Supabase Realtime
- **Message History**: View past messages in channels
- **Account Management**: Delete your account and owned channels
- **Mobile & Desktop**: Fully responsive design

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Testing**: Jest, Testing Library, Cypress
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions, Husky
- **Deployment**: Vercel

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

4. Create the database schema in Supabase by running the SQL from `scripts/001_create_schema.sql`

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

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
app/
├── page.tsx                  # Home page
├── auth/                     # Authentication pages
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── callback/route.ts
│   └── error/page.tsx
├── channels/                 # Channel pages
│   ├── page.tsx             # List channels
│   └── [id]/page.tsx        # Chat room
├── settings/                 # Account settings
│   └── page.tsx
└── api/                      # API routes
    ├── account/delete/route.ts
    └── channels/route.ts

components/
├── navigation.tsx
├── create-channel-modal.tsx
├── invite-user-modal.tsx
├── delete-channel-modal.tsx
├── delete-account-modal.tsx
└── ui/                       # shadcn/ui components

lib/
└── supabase/
    ├── client.ts
    ├── server.ts
    └── proxy.ts

scripts/
└── 001_create_schema.sql     # Database schema
```

## Environment Variables

Required for production:

```
NEXT_PUBLIC_SUPABASE_URL          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Your Supabase anonymous key
```

## License

MIT
