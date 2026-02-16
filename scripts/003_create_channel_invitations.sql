-- Script 003: Create channel_invitations table and RLS policies

-- Create invitation status enum if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'invitation_status') then
    create type public.invitation_status as enum ('pending', 'accepted', 'revoked');
  end if;
end$$;

-- Create channel_invitations table
drop trigger if exists handle_channel_invitations_updated_at on public.channel_invitations;
drop function if exists public.handle_channel_invitations_updated_at();

create table if not exists public.channel_invitations (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  invited_email text not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- Index for token lookup
create index if not exists idx_channel_invitations_token on public.channel_invitations(token);

-- Unique constraint for pending invites per channel and email (case-insensitive)
create unique index if not exists idx_unique_pending_invitation 
  on public.channel_invitations (channel_id, lower(trim(invited_email))) 
  where (status = 'pending');

-- Enable RLS
alter table public.channel_invitations enable row level security;

-- RLS Policies
drop policy if exists "Channel owners can manage invitations" on public.channel_invitations;
create policy "Channel owners can manage invitations"
  on public.channel_invitations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.channels
      where channels.id = channel_invitations.channel_id
        and channels.creator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.channels
      where channels.id = channel_invitations.channel_id
        and channels.creator_id = auth.uid()
    )
  );
