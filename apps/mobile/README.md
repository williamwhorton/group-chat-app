# Treehouse Mobile App

This is the React Native (Expo) mobile application for Treehouse Group Chat.

## Tech Stack

- **React Native** with **Expo SDK 52**
- **Expo Router** for file-based routing (similar to Next.js)
- **TypeScript** for type safety
- **Expo Secure Store** for encrypted token storage
- **Shared packages** from the monorepo

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Expo CLI (install globally: `npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your phone (optional, for testing on real devices)

### Running the App

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev:mobile

# Or from this directory
cd apps/mobile
pnpm dev
```

This will start the Expo development server. You can then:

- Press `i` to open in iOS Simulator (Mac only)
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app to run on your phone

### Building for Production

When ready to build for production:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS Build
eas build:configure

# Build for iOS
pnpm build:ios

# Build for Android
pnpm build:android
```

Note: Building for production requires:
- Apple Developer Account ($99/year) for iOS
- Google Play Developer Account ($25 one-time) for Android

## Shared Packages

The mobile app uses the following shared packages from the monorepo:

- `@treehouse/shared-types` - TypeScript types for database schema and API
- `@treehouse/shared-supabase` - Supabase client and authentication helpers
- `@treehouse/shared-utils` - Validation schemas, formatting utilities, and constants
- `@treehouse/shared-config` - ESLint and TypeScript configurations

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/            # Tab navigation (future)
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── assets/                # Images, fonts, etc.
├── components/            # Reusable React Native components
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Next Steps

To fully implement the mobile app:

1. Create Supabase client configuration using shared packages
2. Implement authentication screens with form inputs
3. Create channel list screen with real-time updates
4. Build messaging UI with real-time subscriptions
5. Add profile and settings screens
6. Implement push notifications
7. Test on real devices
8. Prepare for app store submission

## Testing

Run tests:

```bash
pnpm test
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
