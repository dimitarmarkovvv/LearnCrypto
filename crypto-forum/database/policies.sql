-- Posts
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
on public.posts
for select
using (true);

create policy "Users can create their own posts"
on public.posts
for insert
with check (
    author_id = auth.uid()
    and (select is_blocked from public.profiles where id = auth.uid()) = false
);

create policy "Users can update their own posts"
on public.posts
for update
to authenticated
using (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
)
with check (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Users can delete their own posts"
on public.posts
for delete
to authenticated
using (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Moderators can update any post"
on public.posts
for update
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
)
with check (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
);

create policy "Moderators can delete any post"
on public.posts
for delete
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
);

-- Comments
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
on public.comments
for select
using (true);

create policy "Users can create their own comments"
on public.comments
for insert
with check (
    author_id = auth.uid()
    and (select is_blocked from public.profiles where id = auth.uid()) = false
);

create policy "Users can update their own comments"
on public.comments
for update
to authenticated
using (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
)
with check (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Moderators can update any comment"
on public.comments
for update
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
)
with check (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
);

grant delete on public.comments to authenticated;

create policy "Moderators can delete any comment"
on public.comments
for delete
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role in ('moderator', 'admin')
          and is_blocked = false
    )
);

create policy "Users can delete their own comments"
on public.comments
for delete
to authenticated
using (
    author_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

-- Post votes
alter table public.post_votes enable row level security;

create policy "Post votes are viewable by everyone"
on public.post_votes
for select
using (true);

create policy "Users can create their own post votes"
on public.post_votes
for insert
to authenticated
with check (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Users can update their own post votes"
on public.post_votes
for update
to authenticated
using (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
)
with check (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Users can delete their own post votes"
on public.post_votes
for delete
to authenticated
using (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

-- Comment votes
alter table public.comment_votes enable row level security;

create policy "Comment votes are viewable by everyone"
on public.comment_votes
for select
using (true);

create policy "Users can create their own comment votes"
on public.comment_votes
for insert
to authenticated
with check (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Users can update their own comment votes"
on public.comment_votes
for update
to authenticated
using (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
)
with check (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

create policy "Users can delete their own comment votes"
on public.comment_votes
for delete
to authenticated
using (
    user_id = auth.uid()
    and exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and is_blocked = false
    )
);

-- Profiles
alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (select auth.uid() = id
and role = 'user'
and is_blocked = false);

create policy "Users can update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

revoke select on public.profiles from authenticated;

grant select(
    id,
    username,
    first_name,
    last_name,
    role,
    is_blocked,
    created_at,
    avatar_url,
    location,
    signature,
    gender
)
on public.profiles
to authenticated;

revoke update on public.profiles from authenticated;

grant update(
    first_name,
    last_name
)
on public.profiles
to authenticated;

grant update(
    first_name,
    last_name,
    avatar_url,
    location,
    signature,
    gender
)
on public.profiles
to authenticated;

-- Avatars storage
create policy "Users can upload their own avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can replace their own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);