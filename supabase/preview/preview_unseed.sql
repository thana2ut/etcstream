-- Removes every preview row created by preview_seed.sql and nothing else.
with seeded as (select id from auth.users where raw_app_meta_data->>'etc_preview_seed'='true')
, c as (delete from public.etc_commands where run_id in (select id from public.etc_runs where player in (select id from seeded)) returning 1)
, r as (delete from public.etc_runs where player in (select id from seeded) returning 1)
, f as (delete from public.etc_friends where a in (select id from seeded) or b in (select id from seeded) returning 1)
, b as (delete from public.etc_blocks where a in (select id from seeded) or b in (select id from seeded) returning 1)
, s as (delete from public.etc_season_snapshots where player in (select id from seeded) returning 1)
select (select count(*) from r) runs, (select count(*) from f) friends;
delete from public.etc_profiles where id in (select id from auth.users where raw_app_meta_data->>'etc_preview_seed'='true');
delete from auth.users where raw_app_meta_data->>'etc_preview_seed'='true';
