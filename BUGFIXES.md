### Bugfixes Log

#### 2026-02-20: Fix `PGRST200` error on channel messages load

- **Issue**: Accessing the channel details page resulted in a 400 response with error code `PGRST200` when loading messages.
- **Cause**: The `messages` table in the Supabase schema lacked a direct foreign key relationship to the `profiles` table. The `user_id` column referenced `auth.users(id)` instead of `public.profiles(id)`. This prevented PostgREST from automatically detecting the relationship required for the query `.select('*, profiles(username)')`.
- **Solution**:
  - Created a new migration script `scripts/004_fix_messages_profiles_relationship.sql` to drop the existing foreign key constraint and add a new one referencing `public.profiles(id)`.
  - Updated the base schema in `scripts/001_create_schema.sql` to ensure future setups use the correct relationship by default.
- **Verification**: Verified that the app code is still functional by running the full Jest test suite (21/21 suites, 136/136 tests passed).

#### [2025-02-20] Messages Not Displaying on Channel Details Pages

**Issue Description:**
Messages were not displaying on channel details pages. When accessing the messages API endpoint, it returned a 400 error with the message:
```
{
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'messages' and 'profiles' in the schema 'public', but no matches were found.",
  hint: null,
  message: "Could not find a relationship between 'messages' and 'profiles' in the schema cache"
}
```

**Root Cause:**
The `messages` table had a foreign key constraint `user_id` that referenced `auth.users(id)`, but there was no foreign key relationship between `messages.user_id` and `profiles.id`. When Supabase PostgREST attempted to join the tables using `.select('*, profiles(username)')`, it could not find a direct foreign key relationship between the two public schema tables.

**Applied Solution:**
Created and executed migration script `003_add_messages_profiles_fk.sql` to:
1. Drop the existing foreign key constraint from `messages.user_id` to `auth.users(id)`
2. Add a new foreign key constraint from `messages.user_id` to `profiles.id` with `ON DELETE CASCADE`
3. This established the proper relationship that Supabase PostgREST requires for table joins

**Files Modified:**
- `scripts/003_add_messages_profiles_fk.sql` (created)

**Verification Steps:**
1. Navigate to any channel details page
2. Verify that messages display correctly with user profile information
3. Check that the API endpoint `/api/channels/[id]/messages` returns messages with joined profile data
4. Confirm no PGRST200 errors appear in the console or API responses
