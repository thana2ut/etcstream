-- V16b: owner asked to remove the five test profiles. They never had auth users, runs or scores.
delete from public.etc_demo_profiles where slug in ('demo-tonkla','demo-fasai','demo-thara','demo-mekha','demo-khwankhao');
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
    'onlineNow',(select count(*) from public.etc_profiles where presence and public and not hidden and not suspended and seen>now()-interval '90 seconds'),
    'serverNow',floor(extract(epoch from clock_timestamp())*1000));
end $$;
revoke all on function public.etc_public_hall() from public,anon,authenticated;
grant execute on function public.etc_public_hall() to anon,authenticated;
