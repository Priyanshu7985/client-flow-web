-- ClientFlow — triggers, sequence numbering, profile bootstrap, activity logging

-- ---------------------------------------------------------------- updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on profiles
  for each row execute function touch_updated_at();
create trigger projects_touch before update on projects
  for each row execute function touch_updated_at();
create trigger feedback_touch before update on feedback
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------- new auth user -> profile
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------- per-project feedback sequence
create or replace function assign_feedback_seq()
returns trigger language plpgsql as $$
begin
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq), 0) + 1 into new.seq
    from feedback where project_id = new.project_id;
  end if;
  return new;
end;
$$;

create trigger feedback_seq before insert on feedback
  for each row execute function assign_feedback_seq();

-- ---------------------------------------------------------------- project lifecycle activity
create or replace function log_project_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare client_name text;
begin
  select name into client_name from clients where id = new.client_id;
  insert into project_activities (project_id, type, actor_type, actor_name, meta) values
    (new.id, 'project_created', 'system', 'System', '{}'::jsonb),
    (new.id, 'website_added', 'designer', 'Designer', jsonb_build_object('url', new.website_url));
  if client_name is not null then
    insert into project_activities (project_id, type, actor_type, actor_name, meta)
    values (new.id, 'client_invited', 'designer', 'Designer', jsonb_build_object('client', client_name));
  end if;
  return new;
end;
$$;

create trigger project_created_activity after insert on projects
  for each row execute function log_project_insert();

create or replace function log_revision_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.number > 1 then
    insert into project_activities (project_id, type, actor_type, actor_name, meta)
    values (new.project_id, 'revision_created', 'designer', 'Designer',
            jsonb_build_object('number', new.number, 'label', new.label));
  end if;
  return new;
end;
$$;

create trigger revision_created_activity after insert on revisions
  for each row execute function log_revision_insert();

-- ---------------------------------------------------------------- feedback / reply / approval activity
create or replace function log_feedback_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into project_activities (project_id, type, actor_type, actor_name, meta)
  values (new.project_id, 'feedback_added', new.author_type::text, new.author_name,
          jsonb_build_object('seq', new.seq, 'feedback_id', new.id));

  if new.author_type = 'client' then
    update projects set status = 'changes_requested'
      where id = new.project_id and status <> 'approved';
    insert into notifications (user_id, type, title, body, project_id)
    select p.owner_id, 'feedback_added',
           'New feedback on ' || p.name,
           new.author_name || ' left comment #' || new.seq, p.id
    from projects p where p.id = new.project_id;
  end if;
  return new;
end;
$$;

create trigger feedback_activity after insert on feedback
  for each row execute function log_feedback_insert();

create or replace function log_feedback_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into project_activities (project_id, type, actor_type, actor_name, meta)
    values (new.project_id,
            (case when new.status = 'resolved' then 'feedback_resolved'
                  else 'feedback_status_changed' end)::activity_type,
            'designer', 'Designer',
            jsonb_build_object('seq', new.seq, 'status', new.status));
  end if;
  return new;
end;
$$;

create trigger feedback_status_activity after update on feedback
  for each row execute function log_feedback_status();

create or replace function log_reply_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select project_id into pid from feedback where id = new.feedback_id;
  insert into project_activities (project_id, type, actor_type, actor_name, meta)
  values (pid, 'feedback_replied', new.author_type::text, new.author_name,
          jsonb_build_object('feedback_id', new.feedback_id));

  if new.author_type = 'client' then
    insert into notifications (user_id, type, title, body, project_id)
    select p.owner_id, 'feedback_reply', new.author_name || ' replied',
           left(new.message, 90), p.id
    from projects p where p.id = pid;
  end if;
  return new;
end;
$$;

create trigger reply_activity after insert on feedback_replies
  for each row execute function log_reply_insert();

create or replace function log_approval_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update projects set status = 'approved' where id = new.project_id;
  insert into project_activities (project_id, type, actor_type, actor_name)
  values (new.project_id, 'project_approved', 'client', new.approved_by_name);
  insert into notifications (user_id, type, title, body, project_id)
  select p.owner_id, 'project_approved', p.name || ' approved',
         new.approved_by_name || ' approved the project.', p.id
  from projects p where p.id = new.project_id;
  return new;
end;
$$;

create trigger approval_activity after insert on approvals
  for each row execute function log_approval_insert();

-- ---------------------------------------------------------------- approval immutability
-- Approval rows cannot be edited once written. They are only removed if the
-- parent project is deleted (ON DELETE CASCADE).
create or replace function block_approval_update()
returns trigger language plpgsql as $$
begin
  raise exception 'approvals are immutable';
end;
$$;

create trigger approvals_no_update before update on approvals
  for each row execute function block_approval_update();
