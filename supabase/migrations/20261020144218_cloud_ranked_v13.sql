-- V13 corrective/additive migration. Target: kppjvrhpnunuurwvjanj.
-- OWNER REVIEW REQUIRED. No accounts, example scores, or seasons are seeded.
-- Snapshot refresh replaces derived aggregates only; source runs are retained.
begin;
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;

create table public.etc_stage_catalog (
  scenario text not null check(scenario ~ '^(xs|s|m|l|xl)-[1-5]$'),
  version text not null, rules_version integer not null,
  eligible boolean not null default false, definition jsonb not null,
  created timestamptz not null default now(), primary key(scenario,version,rules_version)
);
alter table public.etc_stage_catalog enable row level security;
revoke all on public.etc_stage_catalog from public,anon,authenticated;
grant select,insert on public.etc_stage_catalog to service_role;
alter table public.etc_runs add column evidence jsonb;
create table public.etc_seasons (
  id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 2 and 80),
  starts timestamptz not null, ends timestamptz not null,
  status text not null default 'scheduled' check(status in ('scheduled','open','closed','archived')),
  scoring_version text not null default 'cultivation-v1', revision integer not null default 0,
  created timestamptz not null default now(), check(ends>starts and ends<=starts+interval '366 days')
);
create table public.etc_season_stages (
  season uuid not null references public.etc_seasons(id), scenario text not null,
  version text not null, rules_version integer not null,
  primary key(season,scenario), foreign key(scenario,version,rules_version) references public.etc_stage_catalog(scenario,version,rules_version)
);
alter table public.etc_runs add column season uuid references public.etc_seasons(id);
create index etc_runs_season on public.etc_runs(season,scenario,player) where status='VERIFIED' and not invalid;
create table public.etc_season_snapshots (
  season uuid not null references public.etc_seasons(id), player uuid not null references public.etc_profiles(id),
  score bigint not null, stages bigint not null, achieved timestamptz not null, cohort bigint not null,
  contributions jsonb not null, primary key(season,player)
);
alter table public.etc_seasons enable row level security;
alter table public.etc_season_stages enable row level security;
alter table public.etc_season_snapshots enable row level security;
revoke all on public.etc_seasons,public.etc_season_stages,public.etc_season_snapshots from public,anon,authenticated;
grant select on public.etc_seasons,public.etc_season_stages,public.etc_season_snapshots to service_role;

create function etc_private.season_scores(s uuid)
returns table(player uuid,score bigint,stages bigint,achieved timestamptz,cohort bigint,contributions jsonb)
language sql stable set search_path='' as $$
  with eligible as (
    select r.*,row_number() over(partition by r.player,r.scenario order by r.total,r.penalty,r.elapsed,r.verified_at,r.id) own_best
    from public.etc_runs r join public.etc_seasons se on se.id=r.season
    join public.etc_season_stages ss on ss.season=se.id and ss.scenario=r.scenario and ss.version=r.scenario_version and ss.rules_version=r.rules_version
    join public.etc_profiles p on p.id=r.player
    where se.id=s and r.status='VERIFIED' and not r.invalid and r.graph_valid and r.total=r.elapsed+r.penalty
      and r.verified_at is not null and r.validation_version is not null and r.created>=se.starts and r.finish<se.ends and r.verified_at<=se.ends
      and p.public and p.rank_public and not p.hidden and not p.suspended
  ), places as (
    select e.*,row_number() over(partition by scenario order by total,penalty,elapsed,verified_at,id) place,
      count(*) over(partition by scenario) n from eligible e where own_best=1
  ), points as (
    select p.*,round(1000.0*(n-place+1)/n)::bigint points from places p
  ), contributions as (
    select p.*,row_number() over(partition by player order by points desc,scenario) contribution_order from points p
  ) select c.player,sum(case when contribution_order<=5 then points else 0 end)::bigint,count(*),max(verified_at),min(n),
    jsonb_agg(jsonb_build_object('attemptId',id,'scenario',scenario,'points',points,'rank',place,'cohort',n) order by contribution_order)
    from contributions c group by c.player
$$;
revoke all on function etc_private.season_scores(uuid) from public,anon,authenticated;
create function etc_private.snapshot_season(s uuid) returns void language plpgsql set search_path='' as $$
begin
  delete from public.etc_season_snapshots where season=s;
  insert into public.etc_season_snapshots select s,x.* from etc_private.season_scores(s) x;
end $$;
revoke all on function etc_private.snapshot_season(uuid) from public,anon,authenticated;

create function public.etc_season_admin(operation text,body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.etc_seasons; sid uuid; first_at timestamptz; last_at timestamptz; title text; why text:=trim(body->>'reason');
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;
  if why is null or char_length(why) not between 5 and 500 then raise exception 'REASON_REQUIRED'; end if;
  perform pg_advisory_xact_lock(131313);
  if operation='create' then
    if body->>'confirm' is distinct from 'CREATE' then raise exception 'CONFIRM_REQUIRED'; end if;
    title:=trim(body->>'name'); first_at:=to_timestamp((body->>'starts')::numeric/1000); last_at:=to_timestamp((body->>'ends')::numeric/1000);
    if title is null or char_length(title) not between 2 and 80 or first_at<now()-interval '1 minute' or last_at<=first_at or last_at>first_at+interval '366 days' then raise exception 'INVALID_SEASON'; end if;
    if exists(select 1 from public.etc_seasons where status in ('scheduled','open') and starts<last_at and ends>first_at) then raise exception 'SEASON_OVERLAP'; end if;
    if (select count(*) from jsonb_each_text(body->'versions'))<>25 then raise exception 'CATALOG_REQUIRED'; end if;
    insert into public.etc_seasons(name,starts,ends) values(title,first_at,last_at) returning id into sid;
    insert into public.etc_season_stages(season,scenario,version,rules_version) select sid,key,value,1 from jsonb_each_text(body->'versions');
  else
    sid:=(body->>'id')::uuid;
    if body->>'confirm' is distinct from sid::text then raise exception 'CONFIRM_REQUIRED'; end if;
    select * into s from public.etc_seasons where id=sid for update;
    if s.id is null then raise exception 'SEASON_NOT_FOUND'; end if;
    if operation='open' and s.status='scheduled' and now()<s.ends then update public.etc_seasons set status='open',revision=revision+1 where id=sid;
    elsif operation='close' and s.status='open' and now()>=s.ends then
      perform etc_private.snapshot_season(sid); update public.etc_seasons set status='closed',revision=revision+1 where id=sid;
    elsif operation='archive' and s.status='closed' then update public.etc_seasons set status='archived',revision=revision+1 where id=sid;
    elsif operation='recompute' then
      if s.status in ('closed','archived') then perform etc_private.snapshot_season(sid); end if;
      update public.etc_seasons set revision=revision+1 where id=sid;
    else raise exception 'INVALID_TRANSITION'; end if;
  end if;
  insert into public.etc_admin_audit(actor,action,target,reason) values('owner','season-'||operation,sid::text,why);
  return jsonb_build_object('ok',true,'id',sid);
end $$;
revoke all on function public.etc_season_admin(text,jsonb) from public,anon,authenticated;
grant execute on function public.etc_season_admin(text,jsonb) to service_role;

create function public.etc_season_list() returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if not public.etc_can_join_lobby() then raise exception 'AUTH_REQUIRED'; end if;
  return jsonb_build_object('seasons',(select coalesce(jsonb_agg(to_jsonb(s) order by s.starts desc),'[]') from (select * from public.etc_seasons order by starts desc limit 50) s));
end $$;
revoke all on function public.etc_season_list() from public,anon,authenticated;
grant execute on function public.etc_season_list() to authenticated;

create function public.etc_ranked(season_id uuid default null,scope text default 'all',page_offset integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); s public.etc_seasons; result jsonb;
begin
  if not public.etc_can_join_lobby() then raise exception 'AUTH_REQUIRED'; end if;
  if scope not in ('all','friends','around_me','me') or page_offset not between 0 and 100000 then raise exception 'INVALID_ACTION'; end if;
  perform etc_private.budget('ranked:'||uid::text,120,60);
  if season_id is null then select * into s from public.etc_seasons where status='open' and starts<=now() and ends>now() order by starts desc limit 1;
  else select * into s from public.etc_seasons where id=season_id; end if;
  if s.id is null then return jsonb_build_object('season',null,'rows','[]'::jsonb,'mine',null,'total',0,'hasMore',false,'nextOffset',null,'enabled',true); end if;
  with scores as (
    select x.* from etc_private.season_scores(s.id) x where s.status not in ('closed','archived')
    union all select player,score,stages,achieved,cohort,contributions from public.etc_season_snapshots where season=s.id and s.status in ('closed','archived')
  ), global_board as (
    select x.*,p.name,p.friend_code,row_number() over(order by score desc,stages desc,achieved,player) global_rank,
      (stages<3 or cohort<3 or count(*) over()<3) provisional
    from scores x join public.etc_profiles p on p.id=x.player where p.public and p.rank_public and not p.hidden and not p.suspended
  ), visible as (
    select g.* from global_board g where not exists(select 1 from public.etc_blocks where (a=uid and b=g.player) or (a=g.player and b=uid))
  ), scoped as (
    select v.*,row_number() over(order by global_rank) scope_rank from visible v
    where (scope<>'friends' or player=uid or exists(select 1 from public.etc_friends where status='accepted' and ((a=uid and b=v.player) or (a=v.player and b=uid)))) and (scope<>'me' or player=uid)
  ), around as (
    select * from scoped where scope<>'around_me' or abs(global_rank-(select global_rank from global_board where player=uid))<=3
  ), page as (select * from around order by global_rank limit 25 offset page_offset), dto as (
    select p.player,p.global_rank,jsonb_build_object('name',p.name,'friendCode',p.friend_code,'rank',case when scope='friends' then scope_rank else global_rank end,
      'globalRank',global_rank,'score',score,'stages',stages,'provisional',provisional,'isMe',p.player=uid) value from page p
  ) select jsonb_build_object('season',to_jsonb(s),'rows',(select coalesce(jsonb_agg(value order by global_rank),'[]') from dto),
    'mine',(select jsonb_build_object('name',name,'friendCode',friend_code,'rank',case when scope='friends' then scope_rank else global_rank end,'globalRank',global_rank,'score',score,'stages',stages,'provisional',provisional,'isMe',true) from scoped where player=uid),
    'total',(select count(*) from around),'hasMore',(select count(*)>page_offset+25 from around),'nextOffset',case when (select count(*)>page_offset+25 from around) then page_offset+25 else null end,'enabled',true) into result;
  return result;
end $$;
revoke all on function public.etc_ranked(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.etc_ranked(uuid,text,integer) to authenticated;

create function public.etc_certify_run(run_id uuid,expected_revision integer,proof jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.etc_runs;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;
  select * into r from public.etc_runs where id=run_id for update;
  if r.id is null or r.revision<>expected_revision then raise exception 'REVISION_CONFLICT'; end if;
  if r.status<>'UNDER_REVIEW' or r.invalid or not r.graph_valid or r.elapsed<1000 or r.seq<2 then raise exception 'NOT_ELIGIBLE'; end if;
  if not exists(select 1 from public.etc_stage_catalog where scenario=r.scenario and version=r.scenario_version and rules_version=r.rules_version and eligible) then raise exception 'NOT_ELIGIBLE'; end if;
  if proof is null or not (proof ?& array['protocol','hash','commands','penalty','mistakes','valid']) or proof->>'protocol' is distinct from 'cloud-independent-replay-v1' or coalesce(proof->>'hash','') !~ '^[0-9a-f]{64}$' or (proof->>'commands')::integer is distinct from r.seq or (proof->>'penalty')::integer is distinct from r.penalty or (proof->>'mistakes')::integer is distinct from r.mistakes or (proof->>'valid')::boolean is distinct from true then raise exception 'INVALID_PROOF'; end if;
  update public.etc_runs set status='VERIFIED',verified_at=clock_timestamp(),validation_version='cloud-independent-replay-v1',evidence=proof,revision=revision+1 where id=run_id returning * into r;
  return to_jsonb(r);
end $$;
revoke all on function public.etc_certify_run(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.etc_certify_run(uuid,integer,jsonb) to service_role;

create function public.etc_invalidate_run(run_id uuid,why text) returns void language plpgsql security definer set search_path='' as $$
declare r public.etc_runs;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;
  if why is null or char_length(trim(why)) not between 5 and 500 then raise exception 'REASON_REQUIRED'; end if;
  select * into r from public.etc_runs where id=run_id for update;
  if r.id is null then raise exception 'RUN_NOT_FOUND'; end if;
  update public.etc_runs set invalid=true,revision=revision+1 where id=run_id;
  if exists(select 1 from public.etc_seasons where id=r.season and status in ('closed','archived')) then perform etc_private.snapshot_season(r.season); end if;
  insert into public.etc_admin_audit(actor,action,target,reason) values('owner','invalidate-run',run_id::text,why);
end $$;
revoke all on function public.etc_invalidate_run(uuid,text) from public,anon,authenticated;
grant execute on function public.etc_invalidate_run(uuid,text) to service_role;

create function public.etc_compare(stage text,stage_version text,friend text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.etc_profiles; board jsonb; other jsonb;
begin
  if not public.etc_can_join_lobby() then raise exception 'AUTH_REQUIRED'; end if;
  select * into p from public.etc_profiles where friend_code=upper(friend) and public and rank_public and not hidden and not suspended;
  if p.id is null or not exists(select 1 from public.etc_friends where status='accepted' and ((a=uid and b=p.id) or (a=p.id and b=uid))) or exists(select 1 from public.etc_blocks where (a=uid and b=p.id) or (a=p.id and b=uid)) then raise exception 'FRIEND_NOT_FOUND'; end if;
  board:=public.etc_stage_board(stage,stage_version,'all',0,false);
  with bests as (
    select r.*,row_number() over(partition by player order by total,penalty,elapsed,verified_at,id) own_best
    from public.etc_runs r where scenario=stage and scenario_version=stage_version and rules_version=1 and status='VERIFIED' and not invalid and graph_valid and total=elapsed+penalty and verified_at is not null and validation_version is not null
  ), ranked as (
    select b.*,row_number() over(order by total,penalty,elapsed,verified_at,b.id) rank from bests b join public.etc_profiles q on q.id=b.player where own_best=1 and q.public and q.rank_public and not q.hidden and not q.suspended
  ) select jsonb_build_object('rank',x.rank,'best',etc_private.run_view(r)) into other from ranked x join public.etc_runs r on r.id=x.id where x.player=p.id;
  return jsonb_build_object('name',p.name,'mine',board->'mine','friend',coalesce(other,'{"rank":null,"best":null}'::jsonb),'differenceMs',(board#>>'{mine,best,totalMs}')::bigint-(other#>>'{best,totalMs}')::bigint);
end $$;
revoke all on function public.etc_compare(text,text,text) from public,anon,authenticated;
grant execute on function public.etc_compare(text,text,text) to authenticated;
create function public.etc_stage_board_v13(stage text, stage_version text, scope text default 'all', page_offset integer default 0, weekly boolean default false, season_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb; frozen_version text:=stage_version;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if scope not in ('all','me','friends','around_me') or page_offset<0 or page_offset>100000 or stage !~ '^(xs|s|m|l|xl)-[1-5]$' then raise exception 'INVALID_ACTION'; end if;
  if not exists(select 1 from public.etc_profiles where id=uid and not suspended) then raise exception 'PROFILE_REQUIRED'; end if;
  if season_id is not null then
    select version into frozen_version from public.etc_season_stages where season=season_id and scenario=stage;
    if frozen_version is null then raise exception 'SEASON_NOT_FOUND'; end if;
  end if;
  perform etc_private.budget('board:'||uid::text,120,60);
  with eligible as (
    select r.*,row_number() over(partition by player order by total,penalty,elapsed,verified_at,id) personal
    from public.etc_runs r where scenario=stage and scenario_version=frozen_version and rules_version=1 and status='VERIFIED' and not invalid
      and verified_at is not null and validation_version is not null and graph_valid and total=elapsed+penalty
      and (not weekly or verified_at>now()-interval '7 days')
      and (season_id is null or (r.season=season_id and exists(select 1 from public.etc_seasons se where se.id=season_id and r.created>=se.starts and r.finish<se.ends and r.verified_at<=se.ends)))
  ), public_bests as (
    select e.*,p.name,p.friend_code from eligible e join public.etc_profiles p on p.id=e.player
    where e.personal=1 and p.public and p.rank_public and not p.hidden and not p.suspended
  ), global_board as (
    select b.*,row_number() over(order by total,penalty,elapsed,verified_at,id) global_rank from public_bests b
  ), friend_ids as (
    select case when a=uid then b else a end id from public.etc_friends where (a=uid or b=uid) and status='accepted'
  ), scoped as (
    select g.*,row_number() over(order by global_rank) scope_rank from global_board g
    where (scope<>'friends' or player=uid or player in(select id from friend_ids))
      and (scope<>'me' or player=uid)
      and (scope<>'around_me' or abs(global_rank-(select global_rank from global_board where player=uid))<=3)
      and not exists(select 1 from public.etc_blocks where (a=uid and b=g.player) or (a=g.player and b=uid))
  ), page as (select * from scoped order by global_rank limit 25 offset page_offset)
  select jsonb_build_object('rows',(select coalesce(jsonb_agg(etc_private.run_view(r)||jsonb_build_object('name',coalesce(nullif(p.name,''),'ผู้ฝึกนิรนาม'),'friendCode',p.friend_code,
    'rank',case when scope='friends' then p.scope_rank else p.global_rank end,'globalRank',p.global_rank,'isMe',p.player=uid) order by p.global_rank),'[]') from page p join public.etc_runs r on r.id=p.id),
    'mine',jsonb_build_object('rank',(select case when scope='friends' then scope_rank else global_rank end from scoped where player=uid),
      'globalRank',(select global_rank from global_board where player=uid),
      'best',(select etc_private.run_view(r) from eligible e join public.etc_runs r on r.id=e.id where e.player=uid and personal=1),
      'latest',(select etc_private.run_view(r) from public.etc_runs r where player=uid and scenario=stage order by created desc limit 1),
      'validAttempts',(select count(*) from eligible where player=uid),'gapMs',null,'visibility',(select case when public and rank_public then 'public' else 'private' end from public.etc_profiles where id=uid)),
    'total',(select count(*) from scoped),'friendCount',(select count(*) from friend_ids),
    'hasMore',(select count(*)>page_offset+25 from scoped),'nextOffset',case when (select count(*)>page_offset+25 from scoped) then page_offset+25 else null end,
    'enabled',true,'serverNow',floor(extract(epoch from clock_timestamp())*1000)) into result;
  return result;
end $$;
revoke all on function public.etc_stage_board_v13(text,text,text,integer,boolean,uuid) from public,anon,authenticated;
grant execute on function public.etc_stage_board_v13(text,text,text,integer,boolean,uuid) to authenticated;
create function public.etc_stage_summary(stage_versions jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare entry record; rows jsonb:='[]'; board jsonb;
begin
  if not public.etc_can_join_lobby() then raise exception 'AUTH_REQUIRED'; end if;
  perform etc_private.budget('summary:'||auth.uid()::text,3,60);
  if (select count(*) from jsonb_each_text(stage_versions))<>25 then raise exception 'CATALOG_REQUIRED'; end if;
  for entry in select * from jsonb_each_text(stage_versions) order by key loop
    board:=public.etc_stage_board_v13(entry.key,entry.value,'all',0,false,null);
    rows:=rows||jsonb_build_array(jsonb_build_object('scenario',entry.key)||(board->'mine'));
  end loop;
  return jsonb_build_object('stages',rows);
end $$;
revoke all on function public.etc_stage_summary(jsonb) from public,anon,authenticated;
grant execute on function public.etc_stage_summary(jsonb) to authenticated;
commit;
