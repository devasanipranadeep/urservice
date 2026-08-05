-- =====================================================================
-- Migration: Support Phone Number (OTP) Authentication
-- =====================================================================

-- 1. Add phone column to public.users table & make email optional
alter table public.users add column if not exists phone text;
alter table public.users alter column email drop not null;

-- 2. Update handle_new_user() trigger function to sync phone number from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_role_val public.user_role;
begin
    begin
        user_role_val := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
    exception when others then
        user_role_val := 'client'::public.user_role;
    end;

    insert into public.users (id, role, email, phone)
    values (
        new.id,
        user_role_val,
        coalesce(new.email, ''),
        coalesce(new.phone, new.raw_user_meta_data->>'phone', '')
    )
    on conflict (id) do update set
        role = excluded.role,
        email = coalesce(excluded.email, public.users.email),
        phone = coalesce(excluded.phone, public.users.phone);

    return new;
end;
$$ language plpgsql security definer;
