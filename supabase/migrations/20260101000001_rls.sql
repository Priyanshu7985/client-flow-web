-- ClientFlow — Row Level Security
--
-- Model: a signed-in designer ("owner") can do everything with their own rows.
-- The PUBLIC review page never relies on these policies — it goes through the
-- server-only service-role client (which bypasses RLS) after validating the
-- review token. Activity rows and notifications are written by SECURITY DEFINER
-- triggers, so no INSERT policy is needed for them.

alter table profiles enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table revisions enable row level security;
alter table feedback enable row level security;
alter table feedback_replies enable row level security;
alter table project_activities enable row level security;
alter table approvals enable row level security;
alter table notifications enable row level security;

-- ---------------------------------------------------------------- helper predicate
create or replace function owns_project(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects p where p.id = pid and p.owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------- profiles
create policy "profiles: read own" on profiles
  for select using (id = auth.uid());
create policy "profiles: insert own" on profiles
  for insert with check (id = auth.uid());
create policy "profiles: update own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------- clients
create policy "clients: owner all" on clients
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------------- projects
create policy "projects: owner all" on projects
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------------- revisions
create policy "revisions: via project" on revisions
  for all using (owns_project(project_id)) with check (owns_project(project_id));

-- ---------------------------------------------------------------- feedback
create policy "feedback: via project" on feedback
  for all using (owns_project(project_id)) with check (owns_project(project_id));

-- ---------------------------------------------------------------- replies
create policy "replies: via project" on feedback_replies
  for all using (
    exists (select 1 from feedback f where f.id = feedback_id and owns_project(f.project_id))
  )
  with check (
    exists (select 1 from feedback f where f.id = feedback_id and owns_project(f.project_id))
  );

-- ---------------------------------------------------------------- activities (read-only; writes via trigger)
create policy "activities: read via project" on project_activities
  for select using (owns_project(project_id));

-- ---------------------------------------------------------------- approvals
-- Owner may create/read; updates are blocked by a trigger (immutable record).
-- Client approvals arrive via the service-role client.
create policy "approvals: read via project" on approvals
  for select using (owns_project(project_id));
create policy "approvals: owner insert" on approvals
  for insert with check (owns_project(project_id));

-- ---------------------------------------------------------------- notifications
create policy "notifications: own" on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
