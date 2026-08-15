-- ProfitLab V1 core schema
create extension if not exists pgcrypto;

create type marketplace_code as enum ('shopee','tiktok');
create type seller_type_code as enum ('any','regular','non_star','star','mall','unknown');
create type rule_status_code as enum ('draft','verified','needs_review','expired');
create type fee_basis_code as enum ('gross','after_seller_discount','eligible_revenue');
create type fee_scope_code as enum ('per_order','per_item');
create type member_role_code as enum ('owner','admin','brand_manager','staff','viewer');
create type import_status_code as enum ('uploaded','previewed','processing','completed','failed','rolled_back');

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'IDR',
  timezone text not null default 'Asia/Jakarta',
  default_target_margin numeric(8,6) not null default 0.20 check (default_target_margin > -1 and default_target_margin < 1),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_members (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role_code not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (business_id,user_id)
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  default_target_margin numeric(8,6),
  default_affiliate_rate numeric(8,6),
  default_seller_voucher_rate numeric(8,6),
  default_discount_rate numeric(8,6),
  created_at timestamptz not null default now(),
  unique (business_id,name)
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create table marketplace_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  marketplace marketplace_code not null,
  seller_type seller_type_code not null default 'unknown',
  external_shop_id text,
  display_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (marketplace, external_shop_id)
);

create table marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  marketplace marketplace_code not null,
  external_category_id text not null,
  name text not null,
  parent_id uuid references marketplace_categories(id),
  path text,
  effective_from date not null default current_date,
  effective_to date,
  source_url text,
  last_verified_at timestamptz,
  unique (marketplace, external_category_id, effective_from)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  internal_product_code text,
  name text not null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (business_id, internal_product_code)
);

create table variants (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  internal_sku text,
  variant_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique nulls not distinct (business_id, internal_sku)
);

create table marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  marketplace_account_id uuid not null references marketplace_accounts(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  external_product_id text not null,
  title text not null,
  category_id uuid references marketplace_categories(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (marketplace_account_id, external_product_id)
);

create table marketplace_variants (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  variant_id uuid references variants(id) on delete set null,
  external_variant_id text not null,
  marketplace_sku text,
  variant_name text,
  current_price bigint not null default 0 check (current_price >= 0),
  category_id uuid references marketplace_categories(id),
  created_at timestamptz not null default now(),
  unique (listing_id, external_variant_id)
);

create table price_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  marketplace_variant_id uuid not null references marketplace_variants(id) on delete cascade,
  selling_price bigint not null check (selling_price >= 0),
  effective_from date not null,
  effective_to date,
  source text not null default 'manual',
  import_batch_id uuid,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);

create table cost_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  variant_id uuid not null references variants(id) on delete cascade,
  hpp bigint not null check (hpp >= 0),
  packaging bigint,
  operational bigint,
  other_cost bigint,
  effective_from date not null,
  effective_to date,
  source text not null default 'manual',
  import_batch_id uuid,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);

create table profit_profiles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  name text not null,
  discount_type text not null default 'percentage',
  discount_value numeric(14,6) default 0,
  voucher_type text not null default 'percentage',
  voucher_value numeric(14,6) default 0,
  voucher_max_amount bigint,
  voucher_min_purchase bigint,
  affiliate_rate numeric(8,6) default 0,
  target_margin numeric(8,6),
  created_at timestamptz not null default now(),
  unique (business_id,brand_id,name)
);

create table promotion_overrides (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  scope_type text not null check (scope_type in ('store','brand','product','variant','campaign')),
  scope_id uuid not null,
  key text not null,
  value_json jsonb not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table marketplace_fee_rules (
  id uuid primary key default gen_random_uuid(),
  marketplace marketplace_code not null,
  seller_type seller_type_code not null default 'unknown',
  category_id uuid references marketplace_categories(id),
  program text,
  name text not null,
  fee_type text not null,
  rate numeric(12,8),
  fixed_amount bigint,
  calculation_base fee_basis_code not null,
  fee_scope fee_scope_code not null default 'per_item',
  min_fee bigint,
  max_fee bigint,
  effective_from date not null,
  effective_to date,
  source_url text not null,
  source_note text,
  rule_version text not null,
  last_verified_at timestamptz,
  status rule_status_code not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (rate is not null or fixed_amount is not null),
  check (effective_to is null or effective_to >= effective_from)
);

create index fee_rule_lookup_idx on marketplace_fee_rules (marketplace,seller_type,category_id,effective_from,effective_to,status);
create index variant_sku_idx on variants (business_id,internal_sku);
create index marketplace_variant_sku_idx on marketplace_variants (business_id,marketplace_sku);
create index cost_history_lookup_idx on cost_history (variant_id,effective_from,effective_to);

create table import_batches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  marketplace_account_id uuid references marketplace_accounts(id) on delete set null,
  imported_by uuid not null references auth.users(id),
  filename text not null,
  file_type text not null,
  marketplace marketplace_code,
  status import_status_code not null default 'uploaded',
  total_rows int not null default 0,
  created_records int not null default 0,
  updated_records int not null default 0,
  warning_records int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table import_rows (
  id bigserial primary key,
  import_batch_id uuid not null references import_batches(id) on delete cascade,
  row_number int not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  action text,
  status text not null default 'pending',
  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb
);

create table saved_scenarios (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  inputs jsonb not null,
  summary jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table calculation_audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  marketplace marketplace_code not null,
  calculation_date date not null,
  input_json jsonb not null,
  output_json jsonb not null,
  applied_rule_ids uuid[] not null default '{}',
  rule_versions text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Add optional FK after import_batches exists.
alter table price_history add constraint price_history_import_fk foreign key (import_batch_id) references import_batches(id) on delete set null;
alter table cost_history add constraint cost_history_import_fk foreign key (import_batch_id) references import_batches(id) on delete set null;

-- Membership helper used by RLS.
create or replace function public.is_business_member(target_business uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from business_members bm where bm.business_id=target_business and bm.user_id=auth.uid());
$$;

create or replace function public.has_business_role(target_business uuid, allowed member_role_code[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from business_members bm where bm.business_id=target_business and bm.user_id=auth.uid() and bm.role=any(allowed));
$$;

-- Auto-enroll creator as owner.
create or replace function public.business_owner_membership()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into business_members(business_id,user_id,role) values(new.id,new.created_by,'owner');
  return new;
end $$;
create trigger trg_business_owner after insert on businesses for each row execute function public.business_owner_membership();

-- RLS
alter table businesses enable row level security;
alter table business_members enable row level security;
alter table brands enable row level security;
alter table stores enable row level security;
alter table marketplace_accounts enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table marketplace_listings enable row level security;
alter table marketplace_variants enable row level security;
alter table price_history enable row level security;
alter table cost_history enable row level security;
alter table profit_profiles enable row level security;
alter table promotion_overrides enable row level security;
alter table import_batches enable row level security;
alter table import_rows enable row level security;
alter table saved_scenarios enable row level security;
alter table calculation_audits enable row level security;

create policy business_member_read on businesses for select using (is_business_member(id) or created_by=auth.uid());
create policy business_creator_insert on businesses for insert with check (created_by=auth.uid());
create policy business_owner_update on businesses for update using (has_business_role(id,array['owner','admin']::member_role_code[]));
create policy members_read on business_members for select using (is_business_member(business_id));
create policy members_manage on business_members for all using (has_business_role(business_id,array['owner','admin']::member_role_code[])) with check (has_business_role(business_id,array['owner','admin']::member_role_code[]));

-- Repeatable tenant policies for business_id tables.
do $$
declare t text;
begin
  foreach t in array array['brands','stores','marketplace_accounts','products','variants','marketplace_listings','marketplace_variants','price_history','cost_history','profit_profiles','promotion_overrides','import_batches','saved_scenarios','calculation_audits']
  loop
    execute format('create policy %I on %I for select using (is_business_member(business_id))', t||'_read', t);
    execute format('create policy %I on %I for insert with check (has_business_role(business_id,array[''owner'',''admin'',''brand_manager'',''staff'']::member_role_code[]))', t||'_insert', t);
    execute format('create policy %I on %I for update using (has_business_role(business_id,array[''owner'',''admin'',''brand_manager'',''staff'']::member_role_code[]))', t||'_update', t);
    execute format('create policy %I on %I for delete using (has_business_role(business_id,array[''owner'',''admin'']::member_role_code[]))', t||'_delete', t);
  end loop;
end $$;

create policy import_rows_read on import_rows for select using (exists(select 1 from import_batches b where b.id=import_batch_id and is_business_member(b.business_id)));
create policy import_rows_write on import_rows for all using (exists(select 1 from import_batches b where b.id=import_batch_id and has_business_role(b.business_id,array['owner','admin','brand_manager','staff']::member_role_code[]))) with check (exists(select 1 from import_batches b where b.id=import_batch_id and has_business_role(b.business_id,array['owner','admin','brand_manager','staff']::member_role_code[])));

-- Marketplace reference/rules are globally readable to authenticated users; writes should be service-role/admin only.
alter table marketplace_categories enable row level security;
alter table marketplace_fee_rules enable row level security;
create policy categories_auth_read on marketplace_categories for select to authenticated using (true);
create policy fee_rules_auth_read on marketplace_fee_rules for select to authenticated using (status='verified');
