# Testing & CI/CD Guide

## Local Testing

### Linting and Formatting

Check code formatting:

```bash
npm run format
```

Fix formatting issues automatically:

```bash
npm run format:fix
```

Run ESLint:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

### Unit Tests

Run unit tests with coverage:

```bash
npm test -- --coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

### E2E Tests

Open Cypress interactive mode:

```bash
npm run test:e2e
```

Run E2E tests in headless mode:

```bash
npm run test:e2e:run
```

## Pre-Commit Hooks

This project uses Husky to enforce testing standards before commits.

### Installation

Pre-commit hooks are automatically installed when you run `npm install` (via the `prepare` script).

### What Happens Before Commit

The pre-commit hook will:

1. Check code formatting with Prettier
2. Run ESLint to check for linting errors
3. Run all unit tests
4. Calculate code coverage
5. Fail the commit if:
   - Formatting errors are detected
   - Linting errors are detected
   - Any tests fail
   - Code coverage is below 80%

If the pre-commit hook fails, fix the issues and try committing again.

### Bypassing Pre-Commit Hooks (Not Recommended)

```bash
git commit --no-verify
```

## GitHub Actions CI/CD

Pull requests to `main` automatically trigger:

1. **Lint and Format** - Code must pass Prettier and ESLint checks
2. **Unit Tests** - Tests must pass and coverage must meet 80% threshold
3. **E2E Tests** - Tests must pass against a running instance

All checks must pass before the PR can be merged. The lint and format job runs first, and if it fails, the test jobs will not run.

### Secrets Required in GitHub

For E2E tests to run in CI, add these secrets to your GitHub repository settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Test Files Structure

```
├── __tests__/
│   └── setup.tsx              # Test utilities and mocks
├── components/__tests__/
│   └── create-channel-modal.test.tsx
├── app/auth/__tests__/
│   └── login.test.tsx
├── app/channels/__tests__/
│   └── channels.test.tsx
├── cypress/
│   ├── e2e/
│   │   ├── auth.cy.ts
│   │   └── channels.cy.ts
│   └── support/
│       └── e2e.ts             # Custom Cypress commands
├── jest.config.js             # Jest configuration
├── jest.setup.js              # Jest setup file
├── cypress.config.ts          # Cypress configuration
└── .husky/
    └── pre-commit             # Pre-commit hook script
```

## Semantic Selectors

All tests use semantic selectors (getByRole, getByLabelText, etc.) rather than data-testid attributes. This ensures tests verify what users actually see and interact with.

## Coverage Threshold

The project enforces an 80% code coverage threshold:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

Monitor coverage with:

```bash
npm test -- --coverage
```
