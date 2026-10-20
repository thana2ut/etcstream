-- V19b: rankings, best times, friend comparisons and season scores count ONLY runs proven by the
-- independent server replay validator. The 221 legacy 'preview-seed' rows are kept unchanged for
-- audit; they simply no longer satisfy the eligibility predicate. No row is updated or deleted.
-- Applied by rewriting the existing predicate in place so each function body otherwise stays identical.
do $m$
declare f record; src text; out text; proven constant text := 'validation_version=''cloud-independent-replay-v1'' and evidence is not null';
begin
  for f in select * from (values
      ('public.etc_compare(text,text,text)', 'status=''VERIFIED'' and not invalid', 'status=''VERIFIED'' and ' || proven || ' and not invalid'),
      ('public.etc_stage_board(text,text,text,integer,boolean)', 'status=''VERIFIED'' and not invalid', 'status=''VERIFIED'' and ' || proven || ' and not invalid'),
      ('public.etc_stage_board_v13(text,text,text,integer,boolean,uuid)', 'status=''VERIFIED'' and not invalid', 'status=''VERIFIED'' and ' || proven || ' and not invalid'),
      ('public.etc_my_records(jsonb)', 'status=''VERIFIED'' and rules_version=1', 'status=''VERIFIED'' and ' || proven || ' and rules_version=1'),
      ('etc_private.season_scores(uuid)', 'r.status=''VERIFIED'' and not r.invalid', 'r.status=''VERIFIED'' and r.validation_version=''cloud-independent-replay-v1'' and r.evidence is not null and not r.invalid')
    ) v(sig, old_pred, new_pred)
  loop
    src := pg_get_functiondef(f.sig::regprocedure);
    if position(f.new_pred in src) > 0 then continue; end if;          -- already applied
    if position(f.old_pred in src) = 0 then raise exception 'PREDICATE_NOT_FOUND %', f.sig; end if;
    out := replace(src, f.old_pred, f.new_pred);
    execute out;                                                       -- CREATE OR REPLACE keeps grants/owner
  end loop;
end $m$;
