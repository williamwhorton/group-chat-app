# Technical Debt - Treehouse Group Chat

This document lists identified technical debt, categorized by priority and type.

## 1. Security (High Priority)

### 1.1 Incomplete Account Deletion

- **File**: `app/api/account/delete/route.ts`
- **Issue**: The API route deletes profiles, channels, and memberships, but it DOES NOT delete the actual auth user from `auth.users`.
- **Impact**: Lingering auth accounts with no profile, potential for "ghost" logins.
- **Remedy**: Implement auth user deletion using a Supabase Service Role client or a Database Function with `security definer`.

### 1.2 Overly Permissive `channel_members` RLS

- **File**: `scripts/002_create_rls_policies.sql`
- **Issue**: `create policy "Users can view channel members" ... using (true);` allows ANY authenticated user to see EVERY membership in the system.
- **Impact**: Privacy leak of user-channel associations.
- **Remedy**: Restrict visibility to users who are members of the same channel or are the channel creators.

### 1.3 Exposure of Invitation Emails

- **File**: `scripts/004_invitation_rpcs.sql`
- **Issue**: `get_channel_invitation_by_token` returns `invited_email` to any user with a token.
- **Impact**: Minor privacy leak; anyone with a link can see the intended recipient's email.
- **Remedy**: Consider returning only channel name and inviter name for public token lookups.

---

## 2. Bugs & Edge Cases (Medium Priority)

### 2.1 Missing Email Validation in Invitations

- **File**: `app/api/channels/[id]/invitations/route.ts`
- **Issue**: Emails are trimmed and lowercased but not validated for correct format.
- **Impact**: Users can "invite" invalid email addresses, wasting database space.
- **Remedy**: Use Zod or a simple regex to validate emails before insertion.

### 2.2 Inconsistent State Handling for Expired Invites

- **File**: `app/api/channels/[id]/invitations/route.ts`
- **Issue**: When an expired invite is found, it's marked 'revoked' then a new one is created. While functional, it leaves many revoked records for the same email/channel.
- **Impact**: Database bloat over time.
- **Remedy**: Consider reusing the existing record by updating `expires_at` and `token`.

---

## 3. Architecture (Medium Priority)

### 3.1 Redundant User Profile Fetching

- **File**: `app/channels/[id]/page.tsx`
- **Issue**: When a new message arrives via Realtime, a separate query is made to fetch the user's profile.
- **Impact**: N+1 problem at the client level; extra database load.
- **Remedy**: Ideally, use a database trigger to include profile data in a payload (though Realtime broadcast has limits) OR fetch profiles in batches if multiple messages arrive.

### 3.2 Lack of Centralized Validation

- **Issue**: Validation is scattered (some in RPCs, some in API routes, some missing).
- **Remedy**: Implement shared Zod schemas in `lib/validations` for both client and server use.

---

## 4. Optimizations (Low Priority)

### 4.1 Inefficient Initial Message Fetch

- **File**: `app/channels/[id]/page.tsx`
- **Issue**: Loads messages first, then loads all profiles for those messages in a second query.
- **Impact**: Waterfall fetching; slightly slower page load.
- **Remedy**: Use Supabase's relationship joins: `.from('messages').select('*, profiles(username)')`.

### 4.2 Hardcoded Constants

- **Issue**: Invitation expiration (7 days) is hardcoded in `scripts/003_create_channel_invitations.sql`.
- **Remedy**: Move to a configuration setting or environment variable.
