-- BiJulia 顧客與管理者。
-- 在 BiJulia 自己的 Supabase SQL editor 執行一次。
-- 不要對別人的專案執行。
--
-- 環境變數（不要寫進 git）：
--   SUPABASE_URL
--   SUPABASE_ANON_KEY
-- 靜態網站沒有建置步驟，請把這兩個值填進 js/supabase.env.js。
--
-- Authentication → Providers → Email：關掉 Confirm email。一個電子郵件只能註冊一次。
-- Authentication → URL Configuration：加入
--   http://127.0.0.1:4173/account/
--   以及正式網址的 /account/
--
-- 註冊當下就新增 public.profiles，不用等信箱驗證。
-- 一般帳號的角色是 pending。只有 jiayiwu009@gmail.com 是 super_admin。
-- 同一個電子郵件只能有一筆帳號、一組密碼。其他信箱不會自動變成管理者。
-- 店主登入 /account/ 後，對待核准的列按「核准」，角色會改成 customer。

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'pending',
  name text not null default '',
  phone text not null default '',
  address text not null default '', -- 7-11 店名
  tier text not null default '一般',
  purchase_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('pending', 'customer', 'super_admin'))
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text not null default 'pending';
alter table public.profiles add column if not exists name text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists address text not null default '';
alter table public.profiles add column if not exists tier text not null default '一般';
alter table public.profiles add column if not exists purchase_history jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_email_key on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon;
-- 已登入者只能改網站真的會寫的欄位。role 仍由 protect_profile_role 限制，
-- 只有 super_admin 改得成。tier、email、id、created_at 不開放，避免顧客自己改會員等級或信箱。
revoke update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (purchase_history, role) on table public.profiles to authenticated;

create or replace function public.handle_user_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.email_confirmed_at is not null then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.email_confirmed_at is null then
    return new;
  end if;
  insert into public.profiles (id, email, role, name, phone, address)
  values (
    new.id,
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) = 'jiayiwu009@gmail.com' then 'super_admin'
      else 'pending'
    end,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', '')
  )
  on conflict (id) do update
    set role = 'super_admin'
    where lower(public.profiles.email) = 'jiayiwu009@gmail.com'
      and public.profiles.role is distinct from 'super_admin';
  return new;
end;
$$;

drop trigger if exists on_auth_user_verified on auth.users;
create trigger on_auth_user_verified
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_verified();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text;
begin
  if new.role is not distinct from old.role then
    return new;
  end if;
  if new.role not in ('pending', 'customer', 'super_admin') then
    raise exception 'invalid role';
  end if;
  -- 店主信箱驗證後可以成為管理者。顧客改不了自己的 email，所以不能走這條路。
  if lower(coalesce(new.email, old.email, '')) = 'jiayiwu009@gmail.com'
     and new.role = 'super_admin' then
    return new;
  end if;
  -- SQL editor 沒有登入者。匿名金鑰沒有 update 權限，不能走這條路。
  if auth.uid() is null then
    return new;
  end if;
  select p.role into actor from public.profiles as p where p.id = auth.uid();
  if actor is distinct from 'super_admin' then
    raise exception 'only super_admin can change role';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.handle_user_verified() from public, anon, authenticated;
revoke all on function public.protect_profile_role() from public, anon, authenticated;
revoke all on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_super_admin());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

update public.profiles
set role = 'super_admin'
where lower(email) = 'jiayiwu009@gmail.com'
  and role is distinct from 'super_admin';
