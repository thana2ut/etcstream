-- V21: a purchase request id (idempotency key) is bound to ONE item. Replaying it for the same item
-- returns the original receipt (no second debit); reusing it for a different item is rejected.
-- Forward-only, in-place patch of etc_economy's retry branch; no data is touched.
do $m$
declare src text := pg_get_functiondef('public.etc_economy(text,jsonb)'::regprocedure);
  anchor constant text := 'if l.id is not null then
      return jsonb_build_object(''status'', ''committed'', ''retry'', true';
begin
  if position('PURCHASE_CONFLICT' in src) > 0 then return; end if;
  if position(anchor in src) = 0 then raise exception 'ECONOMY_PATCH_ANCHOR_MISSING'; end if;
  src := replace(src, anchor, 'if l.id is not null then
      if l.meta->>''sku'' is distinct from body->>''sku'' then raise exception ''PURCHASE_CONFLICT''; end if;
      return jsonb_build_object(''status'', ''committed'', ''retry'', true');
  execute src;
end $m$;
