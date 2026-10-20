-- V16: public read-only hall of immortals + five clearly-labelled Thai test profiles.
-- Additive and idempotent. Test profiles live in their own table: they have no auth user,
-- no runs, no scores, no friendships and can never be counted as online or ranked.
create table if not exists public.etc_demo_profiles (
  slug text primary key check (slug ~ '^demo-[a-z0-9-]{1,32}$'),
  name text not null unique check (char_length(name) between 2 and 20),
  sort smallint not null,
  is_demo boolean not null default true check (is_demo),
  created timestamptz not null default now()
);
alter table public.etc_demo_profiles enable row level security;
revoke all on public.etc_demo_profiles from public,anon,authenticated;
grant select,insert,update on public.etc_demo_profiles to service_role;

insert into public.etc_demo_profiles(slug,name,sort) values
  ('demo-tonkla','ต้นกล้า',1),('demo-fasai','ฟ้าใส',2),('demo-thara','ธารา',3),('demo-mekha','เมฆา',4),('demo-khwankhao','ขวัญข้าว',5)
on conflict (slug) do nothing;

-- Index supporting the presence TTL count.
create index if not exists etc_profiles_presence_seen on public.etc_profiles(seen) where presence and public and not hidden and not suspended;

-- Public hall: only consented, verified, public data. Callable without signing in.
create or replace function public.etc_public_hall() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare s public.etc_seasons; top jsonb := '[]'::jsonb; ranked bigint := 0;
begin
  select * into s from public.etc_seasons where status='open' and starts<=now() and ends>now() order by starts desc limit 1;
  if s.id is not null then
    with board as (
      select p.name,x.score,x.stages,row_number() over(order by x.score desc,x.stages desc,x.achieved,x.player) global_rank,count(*) over() n
      from etc_private.season_scores(s.id) x join public.etc_profiles p on p.id=x.player
      where p.public and p.rank_public and not p.hidden and not p.suspended
    ) select coalesce(jsonb_agg(jsonb_build_object('name',coalesce(nullif(name,''),'ผู้ฝึกนิรนาม'),'rank',global_rank,'score',score,'stages',stages) order by global_rank) filter (where global_rank<=10),'[]'),
             coalesce(max(n),0) into top,ranked from board;
  end if;
  return jsonb_build_object(
    'season',case when s.id is null then null else jsonb_build_object('id',s.id,'name',s.name,'ends',floor(extract(epoch from s.ends)*1000)) end,
    'top',top,'rankedPlayers',ranked,
    -- Genuine presence: opted-in public profiles with a heartbeat in the last 90 seconds.
    'onlineNow',(select count(*) from public.etc_profiles where presence and public and not hidden and not suspended and seen>now()-interval '90 seconds'),
    'demoProfiles',(select coalesce(jsonb_agg(jsonb_build_object('id',slug,'name',name,'demo',true) order by sort),'[]') from public.etc_demo_profiles),
    'serverNow',floor(extract(epoch from clock_timestamp())*1000));
end $$;
revoke all on function public.etc_public_hall() from public,anon,authenticated;
grant execute on function public.etc_public_hall() to anon,authenticated;
