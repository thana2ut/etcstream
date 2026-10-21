-- V29b: either participant may decline (withdraw from) an ACCEPTED time-trial challenge. Pending rules unchanged.
do $m$
declare src text := pg_get_functiondef('public.etc_social(text,jsonb)'::regprocedure);
begin
  if position('''withdraw''' in src) = 0 then
    src := replace(src, '    if body->>''decision'' = ''cancel'' then',
      '    if body->>''decision'' = ''withdraw'' then' || chr(10) ||
      '      if (ch.sender <> uid and ch.recipient <> uid) or ch.status <> ''accepted'' then raise exception ''REQUEST_NOT_FOUND''; end if;' || chr(10) ||
      '      update public.etc_challenges set status = ''declined'', responded = now() where id = ch.id;' || chr(10) ||
      '      return jsonb_build_object(''ok'', true);' || chr(10) ||
      '    end if;' || chr(10) ||
      '    if body->>''decision'' = ''cancel'' then');
    if position('''withdraw''' in src) = 0 then raise exception 'WITHDRAW_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
