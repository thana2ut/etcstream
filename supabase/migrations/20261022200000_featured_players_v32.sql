-- V32 (APPLIED as featured_players_v32): owner-chosen featured players, shown in a clearly labelled section
-- separate from verified rankings. Adds no runs, scores or ranks.
create table if not exists etc_private.featured_players (player uuid primary key references public.etc_profiles(id), sort integer not null default 0, added timestamptz not null default now());
revoke all on etc_private.featured_players from public, anon, authenticated;
insert into etc_private.featured_players(player, sort)
  select id, case friend_code when '15F412632D694EFC' then 1 when '75B592C526D14016' then 2 else 3 end
  from public.etc_profiles where friend_code in ('15F412632D694EFC','75B592C526D14016','6FBE406B11EF425F')
  on conflict (player) do nothing;

create or replace function public.etc_featured_players() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'name', p.name, 'friendCode', p.friend_code,
      'online', p.presence and p.seen is not null and p.seen > now() - interval '2 minutes') order by f.sort), '[]'::jsonb)
  from etc_private.featured_players f join public.etc_profiles p on p.id = f.player
  where p.public and not p.hidden and not p.suspended;
$$;
grant execute on function public.etc_featured_players() to anon, authenticated, service_role;
