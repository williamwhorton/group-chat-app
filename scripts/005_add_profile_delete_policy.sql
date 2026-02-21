-- Add missing DELETE policy for profiles table
-- This is needed so users can delete their own profile during account deletion
drop policy if exists "Users can delete their own profile" on public.profiles;

create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);
