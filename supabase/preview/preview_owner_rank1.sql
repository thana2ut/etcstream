-- PREVIEW: give the owner profile (แอดมิน) a 10%-faster verified run than the best on every season stage → rank 1.
-- Marked validation_version='preview-seed'; preview_unseed.sql removes these runs too.
with s as (select id from public.etc_seasons where status='open' limit 1),
best as (select scenario, min(total) t from public.etc_runs group by scenario),
stages as (select ss.scenario, ss.version, row_number() over (order by ss.scenario) n from public.etc_season_stages ss join s on ss.season = s.id)
insert into public.etc_runs(player, request_id, scenario, scenario_version, rules_version, seed, status, created, start, finish,
  penalty, mistakes, elapsed, total, graph_valid, seq, invalid, verified_at, validation_version, season)
select '49bad05a-38ae-49ae-b8b1-b2318b2d98fc', gen_random_uuid(), st.scenario, st.version, 1, 7, 'VERIFIED',
  now() - interval '2 days' + st.n * interval '1 hour', now() - interval '2 days' + st.n * interval '1 hour',
  now() - interval '2 days' + st.n * interval '1 hour' + (coalesce(b.t,120000)*0.9)::bigint * interval '1 millisecond',
  0, 0, (coalesce(b.t,120000)*0.9)::bigint, (coalesce(b.t,120000)*0.9)::bigint, true, 40, false,
  now() - interval '2 days' + st.n * interval '1 hour' + (coalesce(b.t,120000)*0.9)::bigint * interval '1 millisecond', 'preview-seed', s.id
from stages st cross join s left join best b on b.scenario = st.scenario
where not exists (select 1 from public.etc_runs r where r.player='49bad05a-38ae-49ae-b8b1-b2318b2d98fc' and r.validation_version='preview-seed');
