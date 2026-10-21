-- Owner review required before applying to etcstream / unohixcxthiilnkmjunc.
-- A clearly labelled administrative showcase for one account and the current season.
-- This does not create VERIFIED runs or modify competitive scores/ranks.
begin;

create table public.etc_admin_showcase (
  season uuid not null references public.etc_seasons(id),
  player uuid not null references public.etc_profiles(id),
  showcase_score integer not null check (showcase_score = 5000),
  showcase_stages integer not null check (showcase_stages = 25),
  created timestamptz not null default now(),
  primary key (season, player)
);
alter table public.etc_admin_showcase enable row level security;
revoke all on public.etc_admin_showcase from public, anon, authenticated;
grant select on public.etc_admin_showcase to service_role;

do $$
declare
  target_player uuid;
  target_season uuid;
  inserted integer;
begin
  select id into target_player from public.etc_profiles
    where friend_code = '2E0BF31644734BCB' and name = 'Admin'
      and public and rank_public and not hidden and not suspended;
  if target_player is null then
    raise exception 'Admin profile differs; no showcase created';
  end if;

  select count(*) into inserted from public.etc_seasons
    where status = 'open' and starts <= now() and ends > now();
  if inserted <> 1 then
    raise exception 'Expected exactly one active season; no showcase created';
  end if;
  select id into target_season from public.etc_seasons
    where status = 'open' and starts <= now() and ends > now();

  insert into public.etc_admin_showcase(season, player, showcase_score, showcase_stages)
    values (target_season, target_player, 5000, 25);

  insert into public.etc_admin_audit(actor, action, target, reason)
    values ('owner', 'admin-showcase', target_player::text,
      'Owner requested an explicitly labelled 25-stage, 5000-point admin showcase for season ' || target_season);
end $$;

commit;
