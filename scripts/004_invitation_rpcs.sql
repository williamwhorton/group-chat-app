-- Script 004: Create RPC functions for invitation management (Security Definer)

-- Function to get invitation details by token without exposing full table via RLS
drop function if exists public.get_channel_invitation_by_token(text);
create or replace function public.get_channel_invitation_by_token(p_token text)
returns table (
  id uuid,
  channel_id uuid,
  channel_name text,
  invited_email text,
  expires_at timestamptz,
  status text,
  inviter_name text
) 
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    ci.id,
    ci.channel_id,
    c.name as channel_name,
    ci.invited_email,
    ci.expires_at,
    ci.status::text,
    p.username as inviter_name
  from public.channel_invitations ci
  left join public.channels c on c.id = ci.channel_id
  left join public.profiles p on p.id = ci.invited_by_user_id
  where ci.token = p_token;
end;
$$;

-- Function to accept an invitation
drop function if exists public.accept_channel_invitation_by_token(text);
create or replace function public.accept_channel_invitation_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation record;
  v_user_id uuid;
  v_already_member boolean;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'Not authenticated');
  end if;

  -- Get invitation
  select * into v_invitation
  from public.channel_invitations
  where public.channel_invitations.token = p_token;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Invitation not found');
  end if;

  if v_invitation.status::text != 'pending' then
    return jsonb_build_object('success', false, 'message', 'Invitation is already ' || v_invitation.status);
  end if;

  if v_invitation.expires_at < now() then
    return jsonb_build_object('success', false, 'message', 'Invitation has expired');
  end if;

  -- Check if already a member
  select exists (
    select 1 from public.channel_members 
    where public.channel_members.channel_id = v_invitation.channel_id 
    and public.channel_members.user_id = v_user_id
  ) into v_already_member;

  if v_already_member then
    -- Mark as accepted anyway if they are already a member? 
    -- Or just return success. Let's mark as accepted.
    update public.channel_invitations
    set status = 'accepted'
    where public.channel_invitations.id = v_invitation.id;
    
    return jsonb_build_object(
      'success', true, 
      'channelId', v_invitation.channel_id, 
      'joined', false, 
      'alreadyMember', true, 
      'message', 'You are already a member of this channel'
    );
  end if;

  -- Join channel
  insert into public.channel_members (channel_id, user_id)
  values (v_invitation.channel_id, v_user_id);

  -- Update invitation status
  update public.channel_invitations
  set status = 'accepted'
  where public.channel_invitations.id = v_invitation.id;

  return jsonb_build_object(
    'success', true, 
    'channelId', v_invitation.channel_id, 
    'joined', true, 
    'alreadyMember', false, 
    'message', 'Successfully joined the channel'
  );
end;
$$;

-- Revoke function if owner wants to revoke via token (though RLS allows owner to update directly)
-- But for consistency, let's keep it simple.

-- Grant access to authenticated users for these RPCs
grant execute on function public.get_channel_invitation_by_token(text) to authenticated, anon;
grant execute on function public.accept_channel_invitation_by_token(text) to authenticated;
