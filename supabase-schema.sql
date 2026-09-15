create table public.applications (
  id uuid primary key default gen_random_uuid(),
  minecraft_name text not null,
  discord_name text not null,
  role text not null check (role in ('Guard / Vagt', 'Staff', 'Builder')),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'denied')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  minecraft_name text not null,
  discord_name text not null,
  role text not null check (role in ('Owner', 'Co-Owner', 'Administrator', 'Staff', 'Guard', 'Builder')),
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;
alter table public.team_members enable row level security;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.team_members where user_id = auth.uid() and role = 'Owner'); $$;

create policy "Anyone can submit applications"
on public.applications for insert to anon, authenticated
with check (status = 'pending' and reviewed_by is null);

create policy "Owners can read applications"
on public.applications for select to authenticated
using (public.is_owner());

create policy "Owners can review applications"
on public.applications for update to authenticated
using (public.is_owner())
with check (public.is_owner() and status in ('accepted', 'denied') and reviewed_by = auth.uid());

create policy "Owners can manage team"
on public.team_members for all to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Run this once after creating your Supabase Auth user:
-- insert into public.team_members (user_id, minecraft_name, discord_name, role)
-- values ('AUTH_USER_UUID', 'DitMinecraftNavn', 'dit-discord', 'Owner');
