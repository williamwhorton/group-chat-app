-- RLS Policies for profiles table
create policy "Users can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- RLS Policies for channels table
create policy "Anyone can view channels"
  on public.channels
  for select
  to authenticated
  using (true);

create policy "Authenticated users can create channels"
  on public.channels
  for insert
  to authenticated
  with check (auth.uid() = creator_id);

create policy "Channel creators can update their channels"
  on public.channels
  for update
  to authenticated
  using (auth.uid() = creator_id);

create policy "Channel creators can delete their channels"
  on public.channels
  for delete
  to authenticated
  using (auth.uid() = creator_id);

-- RLS Policies for channel_members table
create policy "Users can view channel members"
  on public.channel_members
  for select
  to authenticated
  using (true);

create policy "Users can join channels"
  on public.channel_members
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can leave channels"
  on public.channel_members
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS Policies for messages table
create policy "Users can view messages in their channels"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.channel_members
      where channel_members.channel_id = messages.channel_id
        and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can send messages to their channels"
  on public.messages
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.channel_members
      where channel_members.channel_id = messages.channel_id
        and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can update their own messages"
  on public.messages
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own messages"
  on public.messages
  for delete
  to authenticated
  using (auth.uid() = user_id);
