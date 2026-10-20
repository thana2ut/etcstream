-- V12 additive proposal. OWNER REVIEW REQUIRED; not applied automatically.
-- Target only abtzrovcsomghbuwdmrr. No legacy SQLite data or scores are imported.
begin;
create schema if not exists etc_private;
revoke all on schema etc_private from public, anon, authenticated;

create table public.etc_profiles (
  id uuid primary key references auth.users(id),
  name text not null check (name='' or char_length(name) between 2 and 20),
  friend_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),
  public boolean not null default false,
  presence boolean not null default false,
  rank_public boolean not null default false,
  hidden boolean not null default false,
  suspended boolean not null default false,
  name_locked boolean not null default false,
  seen timestamptz,
  created timestamptz not null default now()
);
create table public.etc_friends (
  a uuid not null references public.etc_profiles(id),
  b uuid not null references public.etc_profiles(id),
  status text not null check (status in ('pending','accepted')),
  created timestamptz not null default now(),
  primary key(a,b), check (a<>b)
);
create unique index etc_friends_pair on public.etc_friends(least(a,b),greatest(a,b));
create index etc_friends_receiver on public.etc_friends(b,status);
create table public.etc_blocks (
  a uuid not null references public.etc_profiles(id),
  b uuid not null references public.etc_profiles(id),
  primary key(a,b), check(a<>b)
);
create table public.etc_runs (
  id uuid primary key default gen_random_uuid(),
  player uuid not null references public.etc_profiles(id),
  request_id uuid not null,
  scenario text not null check(scenario ~ '^(xs|s|m|l|xl)-[1-5]$'),
  scenario_version text not null,
  seed bigint not null,
  status text not null default 'PENDING' check(status in ('PENDING','RUNNING','UNDER_REVIEW','REJECTED','DNF','VERIFIED')),
  created timestamptz not null default now(),
  start timestamptz,
  finish timestamptz,
  penalty integer not null default 0 check(penalty>=0),
  mistakes integer not null default 0 check(mistakes>=0),
  elapsed bigint check(elapsed>=0),
  total bigint check(total>=0),
  graph_valid boolean not null default false,
  seq integer not null default 0 check(seq between 0 and 5000),
  revision integer not null default 0,
  state jsonb,
  bag jsonb,
  invalid boolean not null default false,
  verified_at timestamptz,
  validation_version text,
  unique(player,request_id),
  check(status <> 'VERIFIED' or (verified_at is not null and validation_version is not null and total=elapsed+penalty and graph_valid))
);
create index etc_runs_owner on public.etc_runs(player,created desc);
create table public.etc_admin_sessions (
  token_hash text primary key,
  entry_id uuid not null default gen_random_uuid(),
  expires timestamptz not null,
  credential_version text not null,
  preview jsonb
);
create table public.etc_admin_audit (
  id uuid primary key default gen_random_uuid(), actor text not null,
  action text not null, target text not null, reason text not null,
  created timestamptz not null default now()
);
alter table public.etc_admin_sessions enable row level security;
alter table public.etc_admin_audit enable row level security;
revoke all on public.etc_admin_sessions,public.etc_admin_audit from public,anon,authenticated;
grant select,insert,update,delete on public.etc_admin_sessions to service_role;
grant select,insert on public.etc_admin_audit to service_role;
create function etc_private.audit_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'APPEND_ONLY'; end $$;
create trigger etc_audit_immutable before update or delete on public.etc_admin_audit for each row execute function etc_private.audit_immutable();
revoke all on function etc_private.audit_immutable() from public,anon,authenticated;

create function public.etc_moderate(target_id uuid, operation text, new_name text, reason text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.role()<>'service_role' then raise exception 'FORBIDDEN'; end if;
  if char_length(reason) not between 5 and 500 then raise exception 'REASON_REQUIRED'; end if;
  perform 1 from public.etc_profiles where id=target_id for update;
  if not found then raise exception 'PROFILE_REQUIRED'; end if;
  if operation='rename' then
    if char_length(new_name) not between 2 and 20 or new_name !~ '^[ก-๛A-Za-z0-9 ]+$' then raise exception 'INVALID_NAME'; end if;
    update public.etc_profiles set name=new_name,name_locked=true where id=target_id;
  elsif operation='clear' then update public.etc_profiles set name='',name_locked=true where id=target_id;
  elsif operation='hide' then update public.etc_profiles set hidden=true,public=false,presence=false,rank_public=false where id=target_id;
  elsif operation='suspend' then update public.etc_profiles set suspended=true,presence=false where id=target_id;
  elsif operation='restore' then update public.etc_profiles set suspended=false,hidden=false,name_locked=false where id=target_id;
  else raise exception 'INVALID_ACTION'; end if;
  insert into public.etc_admin_audit(actor,action,target,reason) values('owner',operation,target_id::text,reason);
end $$;
revoke all on function public.etc_moderate(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.etc_moderate(uuid,text,text,text) to service_role;
create index etc_runs_board on public.etc_runs(scenario,scenario_version,total) where status='VERIFIED' and not invalid;
create table public.etc_commands (
  run_id uuid not null references public.etc_runs(id),
  seq integer not null,
  payload jsonb not null,
  received timestamptz not null default now(),
  primary key(run_id,seq)
);
create table etc_private.limits (key text primary key, count integer not null, until_at timestamptz not null);
create function etc_private.budget(k text, maximum integer, seconds integer) returns void
language plpgsql security definer set search_path='' as $$
declare n integer;
begin
  insert into etc_private.limits values(k,1,now()+make_interval(secs=>seconds))
  on conflict(key) do update set count=case when limits.until_at<now() then 1 else limits.count+1 end,
    until_at=case when limits.until_at<now() then now()+make_interval(secs=>seconds) else limits.until_at end
  returning count into n;
  if n>maximum then raise exception 'RATE_LIMIT'; end if;
end $$;
revoke all on function etc_private.budget(text,integer,integer) from public,anon,authenticated;
create function public.etc_trusted_budget(k text, maximum integer, seconds integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.role()<>'service_role' then raise exception 'FORBIDDEN'; end if;
  perform etc_private.budget(k,maximum,seconds);
end $$;
revoke all on function public.etc_trusted_budget(text,integer,integer) from public,anon,authenticated;
grant execute on function public.etc_trusted_budget(text,integer,integer) to service_role;

alter table public.etc_profiles enable row level security;
alter table public.etc_friends enable row level security;
alter table public.etc_blocks enable row level security;
alter table public.etc_runs enable row level security;
alter table public.etc_commands enable row level security;
revoke all on public.etc_profiles,public.etc_friends,public.etc_blocks,public.etc_runs,public.etc_commands from public,anon,authenticated;
-- Narrow RPCs are the only client data surface; no client can author scores or moderation flags.
grant select,insert,update on public.etc_profiles,public.etc_runs,public.etc_commands to service_role;
grant select on public.etc_friends,public.etc_blocks to service_role;

create function public.etc_player(action text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.etc_profiles; target public.etc_profiles; result jsonb; n text;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  perform etc_private.budget('player:'||uid::text,180,60);
  select * into p from public.etc_profiles where id=uid for update;
  if p.suspended then raise exception 'SUSPENDED'; end if;
  if action='register' then
    n:=normalize(trim(body->>'name'),NFC);
    if char_length(n) not between 2 and 20 or n !~ '^[ก-๛A-Za-z0-9 ]+$' or lower(n) in ('admin','administrator','ผู้ดูแล','ระบบ') then raise exception 'INVALID_NAME'; end if;
    if p.id is null then insert into public.etc_profiles(id,name) values(uid,n) returning * into p; end if;
  end if;
  if p.id is null then raise exception 'PROFILE_REQUIRED'; end if;
  if action='profile' then
    if body ? 'name' and not p.name_locked then
      n:=normalize(trim(body->>'name'),NFC);
      if char_length(n) not between 2 and 20 or n !~ '^[ก-๛A-Za-z0-9 ]+$' or lower(n) in ('admin','administrator','ผู้ดูแล','ระบบ') then raise exception 'INVALID_NAME'; end if;
      update public.etc_profiles set name=n where id=uid;
    end if;
    update public.etc_profiles set public=coalesce((body->>'public')::boolean,public),
      presence=coalesce((body->>'presence')::boolean,presence),rank_public=coalesce((body->>'rankPublic')::boolean,rank_public) where id=uid returning * into p;
  elsif action='heartbeat' then
    update public.etc_profiles set seen=now() where id=uid;
    return jsonb_build_object('ok',true,'serverNow',floor(extract(epoch from clock_timestamp())*1000));
  elsif action='offline' then
    update public.etc_profiles set seen=null where id=uid; return '{"ok":true}';
  elsif action='friends' then
    perform etc_private.budget('friend:'||uid::text,20,60);
    select * into target from public.etc_profiles where friend_code=upper(body->>'code');
    if target.id is null or target.id=uid then raise exception 'FRIEND_NOT_FOUND'; end if;
    perform pg_advisory_xact_lock(hashtextextended(least(uid,target.id)::text||greatest(uid,target.id)::text,1));
    if body->>'action'='block' then
      insert into public.etc_blocks values(uid,target.id) on conflict do nothing;
      delete from public.etc_friends where least(a,b)=least(uid,target.id) and greatest(a,b)=greatest(uid,target.id);
    elsif body->>'action'='unblock' then delete from public.etc_blocks where a=uid and b=target.id;
    else
      if target.hidden or target.suspended or exists(select 1 from public.etc_blocks where (a=uid and b=target.id) or (a=target.id and b=uid)) then raise exception 'FRIEND_NOT_FOUND'; end if;
      if body->>'action'='request' then
        insert into public.etc_friends(a,b,status) values(uid,target.id,'pending');
      elsif body->>'action'='accept' then
        update public.etc_friends set status='accepted' where a=target.id and b=uid and status='pending';
        if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
      elsif body->>'action' in ('decline','remove','cancel') then
        delete from public.etc_friends where least(a,b)=least(uid,target.id) and greatest(a,b)=greatest(uid,target.id);
      else raise exception 'INVALID_ACTION'; end if;
    end if;
    return '{"ok":true}';
  elsif action='directory' then
    select coalesce(jsonb_agg(jsonb_build_object('name',q.name,'friendCode',q.friend_code,'online',true)),'[]') into result
    from (select * from public.etc_profiles x where x.public and x.presence and not x.hidden and not x.suspended and x.seen>now()-interval '90 seconds'
      and not exists(select 1 from public.etc_blocks where (a=uid and b=x.id) or (b=uid and a=x.id)) order by x.seen desc limit 100) q;
    return jsonb_build_object('players',result);
  elsif action='friend-list' then
    select coalesce(jsonb_agg(jsonb_build_object('name',q.name,'friendCode',q.friend_code,'status',f.status,'incoming',f.b=uid,
      'online',q.presence and q.seen>now()-interval '90 seconds')),'[]') into result
    from public.etc_friends f join public.etc_profiles q on q.id=case when f.a=uid then f.b else f.a end
    where (f.a=uid or f.b=uid) and not q.hidden and not q.suspended
      and not exists(select 1 from public.etc_blocks where (a=uid and b=q.id) or (a=q.id and b=uid));
    return jsonb_build_object('friends',result,'blocks',(select coalesce(jsonb_agg(jsonb_build_object('friendCode',x.friend_code)),'[]') from public.etc_blocks b join public.etc_profiles x on x.id=b.b where b.a=uid));
  elsif action not in ('register','profile','get') then raise exception 'INVALID_ACTION';
  end if;
  return jsonb_build_object('id',p.id,'name',case when p.hidden or p.name='' then 'ผู้ฝึกนิรนาม' else p.name end,'friendCode',p.friend_code,
    'public',p.public,'presence',p.presence,'rankPublic',p.rank_public,'nameLocked',p.name_locked,'online',p.presence and coalesce(p.seen>now()-interval '90 seconds',false));
end $$;
revoke all on function public.etc_player(text,jsonb) from public,anon,authenticated;
grant execute on function public.etc_player(text,jsonb) to authenticated;

create function etc_private.run_view(r public.etc_runs) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('id',r.id,'scenario',r.scenario,'status',r.status,
    'start',floor(extract(epoch from r.start)*1000),'created',floor(extract(epoch from r.created)*1000),
    'elapsedMs',r.elapsed,'penaltyMs',r.penalty,'totalMs',r.total,'mistakes',r.mistakes,
    'graphValid',r.graph_valid,'invalid',r.invalid,'verifiedAt',floor(extract(epoch from r.verified_at)*1000),
    'validationVersion',r.validation_version,'scenarioVersion',r.scenario_version,'rulesVersion',1)
$$;
revoke all on function etc_private.run_view(public.etc_runs) from public,anon,authenticated;
create function public.etc_stage_board(stage text, stage_version text, scope text default 'all', page_offset integer default 0, weekly boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if scope not in ('all','me','friends','around_me') or page_offset<0 or page_offset>100000 or stage !~ '^(xs|s|m|l|xl)-[1-5]$' then raise exception 'INVALID_ACTION'; end if;
  if not exists(select 1 from public.etc_profiles where id=uid and not suspended) then raise exception 'PROFILE_REQUIRED'; end if;
  perform etc_private.budget('board:'||uid::text,120,60);
  with eligible as (
    select r.*,row_number() over(partition by player order by total,penalty,elapsed,verified_at,id) personal
    from public.etc_runs r where scenario=stage and scenario_version=stage_version and status='VERIFIED' and not invalid
      and verified_at is not null and validation_version is not null and graph_valid and total=elapsed+penalty
      and (not weekly or verified_at>now()-interval '7 days')
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
  select jsonb_build_object('rows',(select coalesce(jsonb_agg(etc_private.run_view(r)||jsonb_build_object('name',p.name,'friendCode',p.friend_code,
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
revoke all on function public.etc_stage_board(text,text,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.etc_stage_board(text,text,text,integer,boolean) to authenticated;

-- Trusted Node evaluator calls only. Database serializes each run and rejects stale state.
create function public.etc_save_run(run_id uuid, expected_revision integer, patch jsonb, command jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.etc_runs; stamp timestamptz:=clock_timestamp();
begin
  if auth.role()<>'service_role' then raise exception 'FORBIDDEN'; end if;
  select * into r from public.etc_runs where id=run_id for update;
  if r.id is null then raise exception 'RUN_NOT_FOUND'; end if;
  if r.revision<>expected_revision then raise exception 'REVISION_CONFLICT'; end if;
  if r.status not in ('PENDING','RUNNING') then return to_jsonb(r); end if;
  if r.start is not null and stamp>r.start+interval '4 hours' then
    update public.etc_runs set status='DNF',finish=stamp,revision=revision+1 where id=run_id returning * into r; return to_jsonb(r);
  end if;
  if patch->>'action'='ready' and r.status='PENDING' then
    update public.etc_runs set status='RUNNING',start=stamp+interval '3 seconds',state=patch->'state',bag=patch->'bag',revision=revision+1 where id=run_id returning * into r;
  elsif patch->>'action'='abandon' then
    update public.etc_runs set status='DNF',finish=stamp,revision=revision+1 where id=run_id returning * into r;
  elsif r.status='RUNNING' and stamp>=r.start then
    if patch->>'action'='command' then
      if r.seq>=5000 then raise exception 'COMMAND_LIMIT'; end if;
      insert into public.etc_commands(run_id,seq,payload) values(run_id,r.seq+1,command);
      update public.etc_runs set state=patch->'state',seq=seq+1,penalty=penalty+(patch->>'penalty')::integer,mistakes=mistakes+(patch->>'mistakes')::integer,revision=revision+1 where id=run_id returning * into r;
    elsif patch->>'action'='finish' then
      -- No promotion RPC exists. All 25 stages remain unranked until owner acceptance and independent eligibility review.
      update public.etc_runs set status=case when (patch->>'valid')::boolean then 'UNDER_REVIEW' else 'REJECTED' end,
        graph_valid=(patch->>'valid')::boolean,finish=stamp,elapsed=floor(extract(epoch from(stamp-start))*1000),
        total=floor(extract(epoch from(stamp-start))*1000)+penalty,revision=revision+1 where id=run_id returning * into r;
    else raise exception 'INVALID_ACTION'; end if;
  else raise exception 'RUN_NOT_STARTED'; end if;
  return to_jsonb(r);
end $$;
revoke all on function public.etc_save_run(uuid,integer,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.etc_save_run(uuid,integer,jsonb,jsonb) to service_role;

-- Private transport: notifications are hints only, never scores, identity or presence authority.
-- RLS lookup needs a narrow identity helper rather than table privileges.
create function public.etc_can_join_lobby() returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.etc_profiles where id=auth.uid() and not suspended)
$$;
revoke all on function public.etc_can_join_lobby() from public,anon,authenticated;
grant execute on function public.etc_can_join_lobby() to authenticated;
create policy etc_private_lobby_receive on realtime.messages for select to authenticated using (realtime.topic()='etcstream-lobby' and public.etc_can_join_lobby());
create policy etc_private_lobby_send on realtime.messages for insert to authenticated with check (realtime.topic()='etcstream-lobby' and public.etc_can_join_lobby());
commit;
