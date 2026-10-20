-- PREVIEW DATA (owner-requested, temporary). Every row is traceable through
-- auth.users.raw_app_meta_data->>'etc_preview_seed' = 'true'. Remove with preview_unseed.sql.
do $$
declare
  names text[] := array['ต้นกล้า','ฟ้าใส','ธารา','เมฆา','ขวัญข้าว','จันทร์เจ้า','พายุทราย','ดาวเหนือ','ลมพริ้ว','ศิลาทอง',
                        'เพลิงมังกร','หิมวันต์','ราชันกระบี่','นภาคราม','อรุณรุ่ง','สายธารา','เงากระบี่','บุษบา','ภูผา','วายุ'];
  sid uuid; season_start timestamptz; owner uuid := '49bad05a-38ae-49ae-b8b1-b2318b2d98fc';
  uid uuid; i int; st record; skill float; t bigint; pen int; fin timestamptz; done timestamptz;
begin
  if exists(select 1 from auth.users where raw_app_meta_data->>'etc_preview_seed'='true') then raise notice 'preview already seeded'; return; end if;
  select id, starts into sid, season_start from public.etc_seasons where status='open' order by starts desc limit 1;
  if sid is null then raise exception 'NO_OPEN_SEASON'; end if;
  -- Preview only: backdate the (empty) first season by 14 days so seeded results fall inside it.
  if season_start > now() - interval '1 day' then
    update public.etc_seasons set starts = now() - interval '14 days' where id = sid returning starts into season_start;
  end if;
  perform setseed(0.42);
  for i in 1..array_length(names,1) loop
    uid := gen_random_uuid();
    insert into auth.users(id, instance_id, aud, role, is_anonymous, raw_app_meta_data, created_at, updated_at)
      values(uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, '{"etc_preview_seed":"true"}', now(), now());
    insert into public.etc_profiles(id, name, public, presence, rank_public, seen, created)
      -- Roughly 60% appear online; seen is pushed forward so the 90-second TTL keeps them visible during the preview.
      values(uid, names[i], true, i % 5 <> 0, true, case when random() < 0.6 then now() + interval '30 days' else now() - interval '2 hours' end, now() - (i || ' days')::interval);
    skill := 0.75 + random() * 0.6;
    for st in select ss.scenario, ss.version from public.etc_season_stages ss where ss.season = sid order by random() limit (3 + floor(random() * 12))::int loop
      t := (case split_part(st.scenario,'-',1) when 'xs' then 90000 when 's' then 150000 when 'm' then 240000 when 'l' then 360000 else 480000 end
            * (1 + split_part(st.scenario,'-',2)::int * 0.12) * skill)::bigint;
      pen := (floor(random() * 3) * 5000)::int;
      fin := season_start + (t + pen) * interval '1 millisecond' + random() * (now() - season_start - (t + pen) * interval '1 millisecond' - interval '5 minutes');
      done := fin;
      insert into public.etc_runs(player, request_id, scenario, scenario_version, rules_version, seed, status, created, start, finish,
        penalty, mistakes, elapsed, total, graph_valid, seq, invalid, verified_at, validation_version, season)
      values(uid, gen_random_uuid(), st.scenario, st.version, 1, floor(random() * 2147483647)::bigint, 'VERIFIED', fin - (t + pen) * interval '1 millisecond',
        fin - (t + pen) * interval '1 millisecond', fin, pen, pen / 5000, t, t + pen, true, 40, false, done, 'preview-seed', sid);
    end loop;
  end loop;
  -- Accepted friendships between the owner profile and six preview players, plus one incoming request.
  insert into public.etc_friends(a, b, status)
    select owner, p.id, 'accepted' from public.etc_profiles p join auth.users u on u.id = p.id
    where u.raw_app_meta_data->>'etc_preview_seed'='true' order by p.name limit 6 on conflict do nothing;
  insert into public.etc_friends(a, b, status)
    select p.id, owner, 'pending' from public.etc_profiles p join auth.users u on u.id = p.id
    where u.raw_app_meta_data->>'etc_preview_seed'='true' and p.name = 'วายุ' on conflict do nothing;
end $$;
