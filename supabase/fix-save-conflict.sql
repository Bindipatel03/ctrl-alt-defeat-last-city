-- Targeted repair: preserves existing data and function privileges.
create or replace function public.save_city(p_state jsonb, p_expected_revision bigint, p_user_id uuid)
returns table (revision bigint, updated_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
declare
    player_id uuid := auth.uid();
begin
    if player_id is null or player_id is distinct from p_user_id then
        raise exception 'Sign in to save your city.' using errcode = '42501';
    end if;
    if p_expected_revision = 0 then
        return query insert into public.city_saves as s (user_id, state)
            values (player_id, p_state) on conflict (user_id) do nothing
            returning s.revision, s.updated_at;
    else
        return query update public.city_saves as s set state = p_state
            where s.user_id = player_id and s.revision = p_expected_revision
            returning s.revision, s.updated_at;
    end if;
    if not found then
        -- Application conflicts must not use serialization_failure (40001):
        -- PostgREST 14 retries it indefinitely. PT409 returns HTTP 409 once.
        raise sqlstate 'PT409' using message = 'SAVE_CONFLICT';
    end if;
end;
$$;
