-- ClientFlow — schema
-- Apply in order: 0001 -> 0002 -> 0003. Then optionally supabase/seed.sql.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ enums
create type project_status as enum (
  'draft', 'in_progress', 'waiting_for_client', 'changes_requested', 'approved'
);
create type feedback_status as enum ('open', 'in_progress', 'resolved');
create type device_mode as enum ('desktop', 'tablet', 'mobile');
create type author_type as enum ('designer', 'client');
create type revision_status as enum ('draft', 'in_review', 'changes_requested', 'approved');
create type activity_type as enum (
  'project_created', 'website_added', 'client_invited', 'review_opened',
  'feedback_added', 'feedback_replied', 'feedback_status_changed',
  'feedback_resolved', 'revision_created', 'project_approved'
);

-- ------------------------------------------------------------------ profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  company_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  notification_prefs jsonb not null default
    '{"email_enabled":true,"on_client_approval":true,"on_new_feedback":true,"on_feedback_reply":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  created_at timestamptz not null default now()
);
create index clients_owner_idx on clients(owner_id);
create unique index clients_owner_email_idx on clients(owner_id, lower(email));

-- ------------------------------------------------------------------ projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  description text,
  website_url text not null,
  thumbnail_url text,
  -- URL-safe token. The app also sets this explicitly (base64url) on create;
  -- this default is a fallback.
  review_token text not null unique
    default translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_'),
  status project_status not null default 'draft',
  deadline timestamptz,
  current_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_idx on projects(owner_id);
create index projects_review_token_idx on projects(review_token);

-- ------------------------------------------------------------------ revisions
create table revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  number int not null,
  label text not null,
  notes text,
  status revision_status not null default 'in_review',
  feedback_count int not null default 0,
  change_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, number)
);
create index revisions_project_idx on revisions(project_id);

alter table projects
  add constraint projects_current_revision_fk
  foreign key (current_revision_id) references revisions(id) on delete set null;

-- ------------------------------------------------------------------ feedback
create table feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  revision_id uuid references revisions(id) on delete set null,
  seq int not null default 0,
  author_id uuid references profiles(id) on delete set null,
  author_type author_type not null,
  author_name text not null,
  page_url text not null default '',
  device device_mode not null default 'desktop',
  element_selector text,
  position_x numeric(6,3) not null check (position_x >= 0 and position_x <= 100),
  position_y numeric(6,3) not null check (position_y >= 0 and position_y <= 100),
  comment text not null check (char_length(comment) between 1 and 2000),
  status feedback_status not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index feedback_project_idx on feedback(project_id);
create index feedback_status_idx on feedback(project_id, status);

-- ------------------------------------------------------------------ replies
create table feedback_replies (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedback(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  author_type author_type not null,
  author_name text not null,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index feedback_replies_feedback_idx on feedback_replies(feedback_id);

-- ------------------------------------------------------------------ activities
create table project_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type activity_type not null,
  actor_type text not null default 'system',
  actor_name text not null default 'System',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index project_activities_project_idx on project_activities(project_id, created_at desc);

-- ------------------------------------------------------------------ approvals (immutable)
create table approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  approved_by_name text not null,
  approved_at timestamptz not null default now(),
  approval_ip_hash text,
  metadata jsonb not null default '{}'::jsonb
);
create index approvals_project_idx on approvals(project_id);

-- ------------------------------------------------------------------ notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  project_id uuid references projects(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications(user_id, created_at desc);
