-- Add foreign key constraint from messages.user_id to profiles.id
-- This allows PostgREST to properly join messages with profiles

-- First, drop the existing foreign key that points to auth.users
alter table public.messages
drop constraint if exists messages_user_id_fkey;

-- Add a new foreign key that points to public.profiles
alter table public.messages
add constraint messages_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete cascade;
