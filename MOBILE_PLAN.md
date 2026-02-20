# Mobile App Integration Plan for Treehouse Group Chat

## Executive Summary

This document outlines the strategy for adding mobile app support to the Treehouse Group Chat application through a **monorepo architecture** using Turborepo and pnpm workspaces. The approach maximizes code reuse between the existing Next.js web app and a new React Native mobile app while maintaining clear separation of concerns.

**Recommended Stack:**
- **Mobile Framework:** React Native with Expo
- **Monorepo Tool:** Turborepo + pnpm workspaces
- **Shared Code:** TypeScript types, business logic, Supabase client, validation schemas
- **Code Reuse Potential:** 40-60% (types, utilities, API logic, Supabase integration)

---

## Table of Contents

1. [Current Project Analysis](#current-project-analysis)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Technology Selection](#technology-selection)
4. [Shared Packages](#shared-packages)
5. [Mobile App Specifics](#mobile-app-specifics)
6. [Migration Strategy](#migration-strategy)
7. [Cost & Timeline](#cost--timeline)
8. [Next Steps](#next-steps)

---

## Current Project Analysis

### Existing Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Styling:** Tailwind CSS + shadcn/ui
- **Testing:** Jest + Cypress
- **Package Manager:** pnpm

### Core Features
1. User authentication (email/password)
2. Channel creation and management
3. Real-time messaging
4. Channel invitations
5. Profile management
6. Account deletion

### Shareable Code Identified
The following code can be extracted and shared between web and mobile:

1. **Types & Interfaces:** Database schema types, API request/response types, user session types
2. **Business Logic:** Supabase client configuration, authentication helpers, real-time subscription logic, message formatting
3. **API Integration:** Channel CRUD, message operations, invitation management, profile management
4. **Validation:** Email, channel, message, and user validation using Zod schemas

---

## Monorepo Architecture

### Why Monorepo?

**Benefits:**
- Share TypeScript types and business logic across platforms
- Single source of truth for Supabase schema and API contracts
- Unified testing and CI/CD pipeline
- Consistent version management for dependencies
- Easier refactoring and feature development
- Better developer experience

**Why Turborepo + pnpm:**
- **Turborepo:** Best-in-class build orchestration, caching, and task pipelines
- **pnpm workspaces:** Efficient disk space usage, fast installs, strict dependency isolation
- **First-class support** for both Next.js and React Native (Expo)
- **Vercel integration:** Seamless deployment of Next.js apps from monorepo
- **Industry standard:** Used by Vercel, Netflix, AWS, and many others

### Proposed Directory Structure

```
treehouse-monorepo/
├── apps/
│   ├── web/                    # Next.js web app (existing)
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── package.json
│   │   └── ...
│   └── mobile/                 # React Native (Expo) app (new)
│       ├── app/                # Expo Router file-based routing
│       ├── components/
│       ├── assets/
│       ├── app.json
│       ├── package.json
│       └── ...
│
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── database.ts    # Supabase table types
│   │   │   ├── api.ts         # API request/response types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared-supabase/        # Supabase client & helpers
│   │   ├── src/
│   │   │   ├── client.ts      # Browser/mobile client
│   │   │   ├── auth.ts        # Auth helpers
│   │   │   ├── realtime.ts    # Real-time subscription utilities
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared-utils/           # Business logic & utilities
│   │   ├── src/
│   │   │   ├── validation.ts  # Zod schemas
│   │   │   ├── formatting.ts  # Date/text formatting
│   │   │   ├── constants.ts   # App constants
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared-config/          # Shared configs
│       ├── eslint-config.js
│       ├── tsconfig.base.json
│       └── package.json
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
├── turbo.json                  # Turborepo pipeline config
├── .gitignore
└── README.md
```

---

## Technology Selection

### React Native + Expo (Recommended)

**Why React Native:**
- **JavaScript/TypeScript:** Same language as web app
- **React:** Same component model and patterns
- **Code sharing:** Direct reuse of business logic, types, and utilities
- **Large ecosystem:** Mature libraries and extensive documentation
- **Native performance:** Compiles to native iOS and Android apps
- **Massive community** support and resources

**Why Expo:**
- **Zero native configuration:** No Xcode/Android Studio required initially
- **Expo Router:** File-based routing (like Next.js App Router)
- **Over-the-air updates:** Deploy bug fixes without app store review
- **Built-in features:** Camera, location, notifications, authentication
- **EAS Build:** Cloud-based builds for iOS/Android
- **EAS Submit:** Automated app store submission
- **Monorepo support:** First-class support for monorepos
- **Development builds:** Custom native code when needed

**Key Expo Features for Treehouse:**
- `expo-auth-session`: OAuth and custom auth flows (Supabase compatible)
- `expo-notifications`: Push notifications for new messages
- `expo-secure-store`: Encrypted storage for tokens
- `expo-updates`: Over-the-air updates for rapid bug fixes
- `Expo Router`: Navigation similar to Next.js routing

---

## Shared Packages

### 1. @treehouse/shared-types

**Purpose:** Centralize all TypeScript type definitions

**Contents:**
- Database types matching Supabase schema (Profile, Channel, Message, ChannelMember, ChannelInvitation)
- API request/response types
- Authentication types

**Benefits:**
- Single source of truth for data structures
- Automatic type checking in both web and mobile
- Easier refactoring
- IntelliSense/autocomplete in both apps

### 2. @treehouse/shared-supabase

**Purpose:** Supabase client initialization and common database operations

**Contents:**
- Client factory function
- Authentication helpers (signIn, signUp, signOut, getCurrentUser)
- Real-time subscription helpers
- Channel operations (CRUD)
- Message operations (get, send)
- Invitation management

**Benefits:**
- Consistent API across platforms
- Centralized error handling
- Easier testing
- Single place to update queries

### 3. @treehouse/shared-utils

**Purpose:** Business logic, validation, formatting, and utilities

**Contents:**
- Zod validation schemas (email, password, username, channel, message)
- Formatting utilities (timestamps, text truncation)
- App constants
- Error messages

**Benefits:**
- Consistent validation rules
- Unified error messages
- Consistent date formatting
- Single source for app constants

### 4. @treehouse/shared-config

**Purpose:** Shared ESLint, TypeScript, and other configs

**Contents:**
- Base ESLint configuration
- Base TypeScript configuration
- Prettier config
- Jest config base

**Benefits:**
- Consistent code style
- Easier maintenance
- Shared type checking rules

---

## Mobile App Specifics

### UI Components

**Recommended: React Native Paper + NativeWind**
- **React Native Paper:** Material Design components with great TypeScript support
- **NativeWind:** Tailwind CSS for React Native (familiar to web developers)

This combination provides:
- Fastest development speed
- Best developer experience for web developers
- Ability to share some style utilities

### Navigation

**Expo Router (File-based routing)**
- Same mental model as Next.js App Router
- File system routing
- TypeScript support
- Deep linking built-in

### Authentication

**Supabase + Expo Secure Store**
- Use `@supabase/supabase-js` (same as web)
- Store tokens in `expo-secure-store` (encrypted)
- Session management using Supabase Auth
- Reuse all auth logic from `@treehouse/shared-supabase`

### Real-time Updates

**Supabase Realtime (same as web)**
- Direct reuse of subscription logic from `@treehouse/shared-supabase`
- WebSocket connection works on mobile
- Handle reconnection on app resume

### Push Notifications

**Expo Notifications**
- For new message alerts
- Requires Supabase Functions or webhook
- Future enhancement (not in initial MVP)

---

## Migration Strategy

### Phase 1: Setup Monorepo

**Tasks:**
1. Create pnpm workspace configuration
2. Set up Turborepo with pipeline configuration
3. Move existing Next.js app to `apps/web/`
4. Update import paths if needed
5. Test that web app still works identically

**Deliverables:**
- Working monorepo structure
- Web app running from `apps/web/`
- Root-level scripts for common tasks

**Key Configuration Files:**

**pnpm-workspace.yaml:**
```yaml
packages:
  - apps/*
  - packages/*
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Phase 2: Extract Shared Packages

**Tasks:**
1. Create `packages/shared-types/` with all interfaces
2. Create `packages/shared-supabase/` with Supabase client and operations
3. Create `packages/shared-utils/` with validation and formatting
4. Create `packages/shared-config/` with ESLint and TypeScript configs
5. Update web app to import from packages
6. Test web app thoroughly

**Deliverables:**
- 4 shared packages
- Web app using shared packages
- All tests passing

### Phase 3: Scaffold Mobile App

**Tasks:**
1. Initialize Expo app in `apps/mobile/`
2. Set up Expo Router for navigation
3. Configure TypeScript and ESLint
4. Add dependencies on shared packages
5. Create basic app structure (screens, components)
6. Set up Supabase client using `@treehouse/shared-supabase`
7. Create initial UI with React Native Paper

**Deliverables:**
- Working mobile app scaffold
- Can run on iOS/Android simulators and Expo Go
- Connected to Supabase
- Basic navigation structure

### Phase 4: Implement Core Features (Future)

**Tasks:**
1. Authentication screens (login, sign up)
2. Channel list screen
3. Channel detail/messaging screen
4. Real-time message updates
5. Create channel flow
6. Invitation flow
7. Profile/settings screen

**Note:** This phase is NOT included in the initial scaffold. Only the foundation will be set up.

---

## Cost & Timeline

### Development Costs

**Free Development Phase:**
- Local development using Expo Go (FREE)
- Development builds for testing (FREE with EAS Free tier)
- Internal testing via TestFlight and Google Play Internal Testing (FREE)
- Duration: No time limit - can develop for months without any costs

**Required Only for Store Publication:**
- Apple Developer Program: $99/year (only when ready to publish to App Store)
- Google Play Console: $25 one-time fee (only when ready to publish to Play Store)
- EAS Build Production (optional): $29/month (only if you need more build capacity)

**Total to start development: $0**

**Total when ready to publish: $124 one-time + $99/year for Apple**

### Timeline Estimate

**Phase 1 (Monorepo Setup):** 1-2 days
- Set up workspace and Turborepo
- Move web app to apps/web/
- Verify everything works

**Phase 2 (Extract Shared Packages):** 2-3 days
- Create shared packages
- Refactor web app to use them
- Test thoroughly

**Phase 3 (Scaffold Mobile App):** 2-3 days
- Initialize Expo app
- Set up navigation and basic structure
- Connect to Supabase
- Create placeholder screens

**Total for monorepo + scaffold: 5-8 days**

---

## Next Steps

### Immediate Actions

1. **Review and approve this plan**
2. **Set up monorepo structure**
   - Create pnpm-workspace.yaml
   - Create turbo.json
   - Update root package.json
   - Move web app to apps/web/
3. **Extract shared packages**
   - Create shared-types package
   - Create shared-supabase package
   - Create shared-utils package
   - Update web app imports
4. **Scaffold mobile app**
   - Initialize Expo app
   - Set up basic navigation
   - Connect to Supabase
   - Create initial screens

### Future Considerations

**When ready for full mobile development:**
1. Implement authentication screens
2. Build channel list and messaging UI
3. Add real-time functionality
4. Implement invitations
5. Add profile management
6. Implement push notifications
7. Test on real devices
8. Prepare for app store submission

**Development can proceed at your own pace with no ongoing costs until you're ready to publish.**

---

## Conclusion

This monorepo approach provides the optimal balance of code reuse, maintainability, and developer experience. By leveraging Turborepo and pnpm workspaces, you'll have a solid foundation for building and scaling both web and mobile applications while sharing critical business logic and types.

The React Native + Expo stack ensures maximum code reuse with your existing Next.js/React codebase and provides the best developer experience for teams familiar with web technologies.

**Development can begin immediately at zero cost, with paid developer accounts only required when you're ready to publish to the app stores.**
