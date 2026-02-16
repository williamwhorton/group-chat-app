# Channel Invitations (Email Link) — Final Plan (TDD) + Progress Log

## Summary

Implement **channel owner** invitations using **email-targeted, shareable links** (no email provider yet).

Recipients must:

1. open the invite link, then
2. click **Join Channel** to confirm.

Membership is granted by inserting into `channel_members` using **user_id** (not email).

---

## Requirements (final)

### Owner capabilities

- Create invitation for an email address
- Prevent duplicate **pending** invites for the same `(channel_id, invited_email)` (case-insensitive)
- See a list of **pending & unexpired** invites
- Revoke an invite
- Display/copy the invite link

### Recipient flow

- Visits `/invite/[token]`
- If not logged in → sign up / log in, then return to the invite page
- If logged in → clicks **Join Channel**
- If already a member → no-op with friendly message
- Invites expire after **7 days**

---

## Database design

### Table: `public.channel_invitations`

- `channel_id`, `invited_email`, `token`, `invited_by_user_id`
- `status`: `pending | accepted | revoked`
- `expires_at`: default now + 7 days
- Unique pending invite per `(channel_id, lower(trim(invited_email)))`

### RLS

- Only channel owners can insert/select/update invites for their channels

### RPC (security definer)

Used to avoid exposing invitation rows via broad RLS:

- `public.get_channel_invitation_by_token(token)` → for invite landing page
- `public.accept_channel_invitation_by_token(token)` → accept + join with user_id, no-op if already member

---

## Server API (Next.js routes)

### Owner endpoints

- `POST /api/channels/:id/invitations`
  - owner-only
  - creates invite or returns existing pending invite
  - returns `{ inviteUrl, expiresAt, message }`

- `GET /api/channels/:id/invitations?status=pending`
  - owner-only
  - returns pending & unexpired invites for display

- `POST /api/invitations/:token/revoke`
  - owner-only
  - marks invite revoked

### Recipient endpoints

- `GET /api/invitations/:token`
  - uses RPC `get_channel_invitation_by_token`
  - returns invite + channel details + `isExpired`

- `POST /api/invitations/:token/accept`
  - requires auth
  - uses RPC `accept_channel_invitation_by_token`
  - returns `{ channelId, joined, alreadyMember, message }`

---

## Frontend UX

### Channel page (owner-only additions)

- Invite modal:
  - email input → create invite → show link + Copy
- Pending Invitations list (pending + unexpired only):
  - email + expiry
  - actions: Display/Copy link, Revoke

### Invite landing page

- `/invite/[token]`
- Shows channel + invite status
- Logged out → prompt login/sign-up (then return)
- Logged in → **Join Channel** button

---

## Testing plan (TDD)

### Unit (Jest)

- Route tests:
  - auth checks (401)
  - owner-only checks (403)
  - create invite / duplicate pending behavior
  - list pending/unexpired invites
  - revoke
  - accept: expired/revoked/accepted handling, already-member no-op, success join

### E2E (Cypress)

- Owner creates invite → sees it in Pending Invitations → can copy/display link
- Owner revokes invite
- Recipient logs in → visits invite link → clicks Join Channel → gains access
- Recipient already a member → friendly no-op

---

## Progress log

- ✅ Supabase applied: `channel_invitations` table + indexes + RLS (script 003)
- ✅ Supabase applied: RPC functions + grants (script 004)
- ✅ SQL scripts committed to repo under `scripts/`
- ✅ Implement API routes
- ✅ Implement UI + `/invite/[token]`
- ✅ Write Jest + Cypress tests
- ✅ Fix token creation null constraint error
- ✅ Fix ambiguous column reference in RPC function
- ✅ Fix "cannot change return type" error by adding DROP FUNCTION to SQL script
- ✅ Fix "Invitation not found" by correcting `full_name` to `username` in RPC
- ✅ Fix "Invitation not found" (persistent) by changing inner join to LEFT JOIN for profiles and channels in RPC, and casting status to text
- ✅ Fix SQL error "column 'role' does not exist" in `accept_channel_invitation_by_token` RPC
- ✅ Fix SQL error "column 'updated_at' does not exist" by removing unnecessary `updated_at` from `channel_invitations` and its RPCs, and auditing other columns
- ✅ Fix SQL error "record 'new' has no field 'updated_at'" by explicitly dropping the orphaned trigger and function
- ✅ Next: All specified features implemented and verified
