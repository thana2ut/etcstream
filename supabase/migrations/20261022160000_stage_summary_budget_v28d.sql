-- V28d: per-stage statistics no longer trip the rate limiter. etc_stage_summary reads 25 stage boards in one call;
-- those inner reads now skip the per-call board budget (the summary keeps its own, raised from 3 to 20 per minute).
do $m$
declare src text;
begin
  src := pg_get_functiondef('public.etc_stage_summary(jsonb)'::regprocedure);
  if position('etc.in_summary' in src) = 0 then
    src := replace(src, 'perform etc_private.budget(''summary:''||auth.uid()::text,3,60);',
      'perform etc_private.budget(''summary:''||auth.uid()::text,20,60);' || chr(10) || '  perform set_config(''etc.in_summary'',''1'',true);');
    if position('etc.in_summary' in src) = 0 then raise exception 'SUMMARY_PATCH_FAILED'; end if;
    execute src;
  end if;
  src := pg_get_functiondef('public.etc_stage_board_v13(text,text,text,integer,boolean,uuid)'::regprocedure);
  if position('etc.in_summary' in src) = 0 then
    src := replace(src, 'perform etc_private.budget(''board:''||uid::text,120,60);',
      'if coalesce(current_setting(''etc.in_summary'', true), '''') <> ''1'' then perform etc_private.budget(''board:''||uid::text,120,60); end if;');
    if position('etc.in_summary' in src) = 0 then raise exception 'BOARD_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
