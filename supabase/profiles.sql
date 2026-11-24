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
-- 註冊當下就新增 public.profiles，不用等信箱驗證，也不用管理者核准。
-- 一般帳號的角色是 customer。只有 jiayiwu009@gmail.com 是 super_admin。
-- 同一個電子郵件只能有一筆帳號、一組密碼。其他信箱不會自動變成管理者。
-- 訂單仍要店主在 /account/ 核准後才成立。帳號不用核准。
-- 會員等級只有管理者改得了，買滿三次會自動變成高級。
-- 一般顧客沒有會員優惠。一般會員是在社群分享商品後，下次免運。
-- 高級是買過三次的客人，作品 9 折，而且免運。滿 NT$2,000 仍人人免運。

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'customer',
  name text not null default '',
  phone text not null default '',
  address text not null default '', -- 7-11 店名
  tier text not null default '一般顧客',
  purchase_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('pending', 'customer', 'super_admin'))
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles alter column role set default 'customer';
alter table public.profiles add column if not exists name text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists address text not null default '';
alter table public.profiles add column if not exists tier text not null default '一般顧客';
alter table public.profiles alter column tier set default '一般顧客';
alter table public.profiles add column if not exists purchase_history jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_email_key on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon;
-- 已登入者只能改網站真的會寫的欄位。role 與 tier 仍由 trigger 限制，
-- 只有 super_admin 改得成。email、id、created_at 不開放，避免顧客自己改信箱。
revoke update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (purchase_history, role, tier) on table public.profiles to authenticated;

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
      else 'customer'
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

create or replace function public.protect_profile_tier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text;
begin
  if new.tier is not distinct from old.tier then
    return new;
  end if;
  if current_setting('bijulia.allow_tier', true) = '1'
     and old.tier = '一般會員'
     and new.tier = '一般顧客' then
    return new;
  end if;
  if new.tier not in ('一般顧客', '一般會員', '高級') then
    raise exception 'invalid tier';
  end if;
  if auth.uid() is null then
    return new;
  end if;
  select p.role into actor from public.profiles as p where p.id = auth.uid();
  if actor is distinct from 'super_admin' then
    raise exception 'only super_admin can change tier';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_tier on public.profiles;
create trigger protect_profile_tier
  before update on public.profiles
  for each row execute function public.protect_profile_tier();

revoke all on function public.handle_user_verified() from public, anon, authenticated;
revoke all on function public.protect_profile_role() from public, anon, authenticated;
revoke all on function public.protect_profile_tier() from public, anon, authenticated;
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

update public.profiles
set role = 'customer'
where role = 'pending';

alter table public.profiles drop constraint if exists profiles_tier_check;

update public.profiles
set tier = '一般顧客'
where tier is null or tier = '一般' or tier not in ('一般顧客', '一般會員', '高級');

alter table public.profiles
  add constraint profiles_tier_check check (tier in ('一般顧客', '一般會員', '高級'));

-- 顧客下單寫進這裡，不寄信給賣家。只有管理者可以讀全部訂單並核准。
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text not null,
  gmail text not null,
  store text not null,
  items jsonb not null default '[]'::jsonb,
  shipping integer not null default 0,
  total integer not null default 0,
  status text not null default 'pending',
  constraint orders_status_check check (status in ('pending', 'approved'))
);

alter table public.orders enable row level security;

revoke all on table public.orders from public, anon, authenticated;
grant insert on table public.orders to anon, authenticated;
grant select, update on table public.orders to authenticated;

create or replace function public.orders_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.customer_id := auth.uid();
  new.status := 'pending';
  if auth.uid() is not null then
    perform set_config('bijulia.allow_tier', '1', true);
    update public.profiles
      set tier = '一般顧客'
      where id = auth.uid()
        and tier = '一般會員';
    perform set_config('bijulia.allow_tier', '', true);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_on_insert on public.orders;
create trigger orders_on_insert
  before insert on public.orders
  for each row execute function public.orders_on_insert();

revoke all on function public.orders_on_insert() from public, anon, authenticated;

drop policy if exists orders_insert_pending on public.orders;
create policy orders_insert_pending
  on public.orders
  for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin
  on public.orders
  for select
  to authenticated
  using (public.is_super_admin() or customer_id = auth.uid());

drop policy if exists orders_admin_approve on public.orders;
create policy orders_admin_approve
  on public.orders
  for update
  to authenticated
  using (public.is_super_admin() and status = 'pending')
  with check (public.is_super_admin() and status = 'approved');

-- 管理者改存貨、上傳新商品。訪客可以讀，不能改。
create table if not exists public.catalog (
  slug text primary key,
  name text not null,
  price integer not null default 0 check (price >= 0),
  currency text not null default 'TWD',
  category text not null default 'necklace' check (category in ('necklace', 'sticker')),
  stock integer not null default 0 check (stock >= 0),
  -- color_stock：貼紙各顏色的數量，例如 {"black":2,"mint":0,"blue":4}。stock 是合計。空值代表只有一個共用存貨。
  color_stock jsonb,
  image text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.catalog add column if not exists color_stock jsonb;

alter table public.catalog enable row level security;

revoke all on table public.catalog from public, anon, authenticated;
grant select on table public.catalog to anon, authenticated;
grant insert, update on table public.catalog to authenticated;

drop policy if exists catalog_public_read on public.catalog;
create policy catalog_public_read
  on public.catalog
  for select
  to anon, authenticated
  using (true);

drop policy if exists catalog_admin_insert on public.catalog;
create policy catalog_admin_insert
  on public.catalog
  for insert
  to authenticated
  with check (public.is_super_admin());

drop policy if exists catalog_admin_update on public.catalog;
create policy catalog_admin_update
  on public.catalog
  for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do update set public = true;

drop policy if exists catalog_photo_read on storage.objects;
create policy catalog_photo_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'catalog');

drop policy if exists catalog_photo_insert on storage.objects;
create policy catalog_photo_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'catalog' and public.is_super_admin());

drop policy if exists catalog_photo_update on storage.objects;
create policy catalog_photo_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'catalog' and public.is_super_admin())
  with check (bucket_id = 'catalog' and public.is_super_admin());
