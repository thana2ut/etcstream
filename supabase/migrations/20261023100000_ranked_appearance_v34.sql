-- V34 (APPLIED): avatar + frame of players shown on the season board (only public, rank-consenting, not hidden/suspended).
create or replace function public.etc_ranked_appearance(codes text[]) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(q.friend_code, q.items), '{}'::jsonb) from (
    select p.friend_code, jsonb_object_agg(e.slot, c.asset) items
    from public.etc_profiles p join public.etc_equipped e on e.player = p.id join public.etc_catalog c on c.sku = e.sku
    where p.friend_code = any(codes[1:100]) and p.public and p.rank_public and not p.hidden and not p.suspended
      and e.slot in ('profileAvatar', 'profileFrame')
    group by p.friend_code) q;
$$;
revoke all on function public.etc_ranked_appearance(text[]) from public;
grant execute on function public.etc_ranked_appearance(text[]) to anon, authenticated, service_role;
