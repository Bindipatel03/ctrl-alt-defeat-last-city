-- Run once in your Supabase project's SQL Editor.
begin;

create table if not exists public.city_saves (
    user_id uuid primary key references auth.users(id) on delete cascade,
    state jsonb not null check (jsonb_typeof(state) = 'object'),
    schema_version integer not null default 2 check (schema_version = 2),
    revision bigint not null default 1,
    updated_at timestamptz not null default now(),
    constraint city_save_size check (octet_length(state::text) <= 1048576)
);

alter table public.city_saves enable row level security;
revoke all on public.city_saves from anon, authenticated;
grant select, insert, update on public.city_saves to authenticated;

drop policy if exists city_saves_select on public.city_saves;
create policy city_saves_select on public.city_saves for select to authenticated
    using ((select auth.uid()) = user_id);
drop policy if exists city_saves_insert on public.city_saves;
create policy city_saves_insert on public.city_saves for insert to authenticated
    with check ((select auth.uid()) = user_id);
drop policy if exists city_saves_update on public.city_saves;
create policy city_saves_update on public.city_saves for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.city_save_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
    if TG_OP = 'INSERT' then
        NEW.revision := 1;
    else
        NEW.revision := OLD.revision + 1;
    end if;
    NEW.updated_at := now();
    return NEW;
end;
$$;
drop trigger if exists city_save_revision on public.city_saves;
create trigger city_save_revision before insert or update on public.city_saves
    for each row execute function public.city_save_revision();

-- Compare revisions atomically so an older device cannot silently overwrite a save.
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
        raise exception 'SAVE_CONFLICT' using errcode = '40001';
    end if;
end;
$$;
revoke all on function public.save_city(jsonb, bigint, uuid) from public, anon;
grant execute on function public.save_city(jsonb, bigint, uuid) to authenticated;
commit;
