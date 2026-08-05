-- =====================================================================
-- Helper Function for Testing Email Verification Gates
-- =====================================================================

create or replace function public.test_unverify_user(user_uuid uuid)
returns void as $$
begin
    update auth.users
    set email_confirmed_at = null
    where id = user_uuid;
end;
$$ language plpgsql security definer;
