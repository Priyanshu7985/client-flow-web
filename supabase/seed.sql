-- ClientFlow — sample data
-- Run AFTER 0001-0003. Safe to run once on a fresh database.
-- Creates a demo designer account:  demo@clientflow.app  /  clientflow-demo
--
-- NOTE: inserting into auth.users requires elevated privileges. This works with
-- `supabase db reset` / the SQL editor. If it fails, sign up in the app first,
-- then replace :owner below with your own auth uid and run only the data section.

do $$
declare
  owner uuid := '00000000-0000-4000-8000-000000000001';
  c_vishan uuid := 'c1000000-0000-4000-8000-000000000001';
  c_lena   uuid := 'c1000000-0000-4000-8000-000000000002';
  c_marco  uuid := 'c1000000-0000-4000-8000-000000000003';
  p_vishan uuid := '40000000-0000-4000-8000-000000000001';
  p_abc    uuid := '40000000-0000-4000-8000-000000000002';
  p_nova   uuid := '40000000-0000-4000-8000-000000000003';
  r_v2 uuid := '50000000-0000-4000-8000-000000000002';
  r_abc2 uuid := '50000000-0000-4000-8000-000000000004';
  r_nova2 uuid := '50000000-0000-4000-8000-000000000006';
begin
  -- demo auth user (skip if it already exists)
  if not exists (select 1 from auth.users where id = owner) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    values (owner, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'demo@clientflow.app', crypt('clientflow-demo', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"Aditya Rao"}');
  end if;

  insert into profiles (id, full_name, email, company_name, plan)
  values (owner, 'Aditya Rao', 'demo@clientflow.app', 'Studio Northlight', 'pro')
  on conflict (id) do update set full_name = excluded.full_name, company_name = excluded.company_name, plan = excluded.plan;

  insert into clients (id, owner_id, name, email, company) values
    (c_vishan, owner, 'Vishan Mehta', 'vishan@vishangraphics.com', 'Vishan Graphics'),
    (c_lena,   owner, 'Lena Alvarez', 'lena@abcrestaurant.com', 'ABC Restaurant'),
    (c_marco,  owner, 'Marco Feldt', 'marco@novatech.io', 'NovaTech')
  on conflict (id) do nothing;

  insert into projects (id, owner_id, client_id, name, description, website_url, review_token, status, deadline) values
    (p_vishan, owner, c_vishan, 'Vishan Graphics Website',
      'Portfolio redesign for a boutique branding studio.', 'https://example.com',
      'demo-vishan-graphics-review-token-001', 'waiting_for_client', now() + interval '6 days'),
    (p_abc, owner, c_lena, 'ABC Restaurant Website',
      'One-page site with online reservations and a photo-forward hero.', 'https://example.org',
      'demo-abc-restaurant-review-token-002', 'in_progress', now() + interval '2 days'),
    (p_nova, owner, c_marco, 'NovaTech Corporate Website',
      'Corporate marketing site with product pages and pricing.', 'https://example.net',
      'demo-novatech-review-token-003', 'approved', now() - interval '3 days')
  on conflict (id) do nothing;

  insert into revisions (id, project_id, number, label, notes, status, feedback_count, change_count, created_at) values
    ('50000000-0000-4000-8000-000000000001', p_vishan, 1, 'Initial design', 'First full pass.', 'changes_requested', 6, 0, now() - interval '12 days'),
    (r_v2, p_vishan, 2, 'Client feedback round 1', 'Typography and CTA addressed.', 'in_review', 3, 4, now() - interval '4 days'),
    ('50000000-0000-4000-8000-000000000003', p_abc, 1, 'Initial design', null, 'changes_requested', 4, 0, now() - interval '9 days'),
    (r_abc2, p_abc, 2, 'Menu & reservations polish', 'Reworked reservation form.', 'in_review', 2, 3, now() - interval '28 hours'),
    ('50000000-0000-4000-8000-000000000005', p_nova, 1, 'Initial design', null, 'changes_requested', 9, 0, now() - interval '38 days'),
    (r_nova2, p_nova, 2, 'Final changes', 'All feedback resolved.', 'approved', 0, 7, now() - interval '6 days')
  on conflict (id) do nothing;

  update projects set current_revision_id = r_v2 where id = p_vishan;
  update projects set current_revision_id = r_abc2 where id = p_abc;
  update projects set current_revision_id = r_nova2 where id = p_nova;

  insert into feedback (project_id, revision_id, seq, author_type, author_name, page_url, device, position_x, position_y, comment, status, resolved_at, created_at) values
    (p_vishan, r_v2, 1, 'client', 'Vishan Mehta', 'https://example.com', 'desktop', 31.4, 18.2, 'Please make this hero heading slightly larger and tighten the line spacing.', 'in_progress', null, now() - interval '30 hours'),
    (p_vishan, r_v2, 2, 'client', 'Vishan Mehta', 'https://example.com', 'desktop', 68.0, 42.5, 'The primary button colour feels a bit dull — can we try a stronger accent?', 'open', null, now() - interval '29 hours'),
    (p_vishan, r_v2, 3, 'client', 'Vishan Mehta', 'https://example.com', 'mobile', 50.0, 74.3, 'On mobile the case-study cards are cramped. More breathing room please.', 'open', null, now() - interval '26 hours'),
    (p_abc, r_abc2, 1, 'client', 'Lena Alvarez', 'https://example.org', 'desktop', 44.2, 55.1, 'Can the reservation form show available times without a page reload?', 'in_progress', null, now() - interval '22 hours'),
    (p_abc, r_abc2, 2, 'client', 'Lena Alvarez', 'https://example.org', 'tablet', 25.7, 30.4, 'The menu photos look slightly washed out compared to our brand shots.', 'open', null, now() - interval '20 hours');

  insert into approvals (project_id, client_id, approved_by_name, approved_at, metadata)
  values (p_nova, c_marco, 'Marco Feldt', now() - interval '3 days', '{"note":"Great work — ship it."}')
  on conflict (project_id) do nothing;

  -- Inserting client feedback above flips project status via trigger; restore the
  -- intended demo states (NovaTech stays 'approved' from the approval trigger).
  update projects set status = 'waiting_for_client' where id = p_vishan;
  update projects set status = 'in_progress' where id = p_abc;
end $$;
