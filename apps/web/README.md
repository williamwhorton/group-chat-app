# Treehouse Web App

This is the Next.js 16 web application for Treehouse Group Chat.

## Note on Structure

Currently, the web app files are located in the root directory of the monorepo. This package.json file is a placeholder that represents the web app in the monorepo structure. In a future migration, all web app files (app/, components/, lib/, etc.) will be moved into this directory.

For now, the web app continues to function from the root directory.

## Development

```bash
# From the monorepo root
pnpm dev:web

# Or directly
pnpm dev
```

## Shared Packages

The web app uses the following shared packages:
- `@treehouse/shared-types` - TypeScript types
- `@treehouse/shared-supabase` - Supabase client and helpers
- `@treehouse/shared-utils` - Validation, formatting, and constants
- `@treehouse/shared-config` - ESLint and TypeScript configs
