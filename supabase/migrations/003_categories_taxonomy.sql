create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  parent_id uuid references public.categories(id) on delete restrict,
  path text,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_parent_slug_key unique (parent_id, slug)
);

create table if not exists public.product_categories (
  product_id text not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (product_id, category_id)
);

create index if not exists categories_parent_id_idx
on public.categories(parent_id);

create index if not exists categories_path_idx
on public.categories(path);

create index if not exists categories_is_active_idx
on public.categories(is_active);

create unique index if not exists categories_root_slug_idx
on public.categories(slug)
where parent_id is null;

create unique index if not exists categories_path_unique_idx
on public.categories(path)
where path is not null;

create index if not exists product_categories_product_id_idx
on public.product_categories(product_id);

create index if not exists product_categories_category_id_idx
on public.product_categories(category_id);

create unique index if not exists product_categories_one_primary_per_product_idx
on public.product_categories(product_id)
where is_primary = true;

create or replace function public.rebuild_category_paths()
returns void
language plpgsql
as $$
begin
  with recursive category_tree as (
    select
      category.id,
      category.parent_id,
      category.slug::text as path
    from public.categories category
    where category.parent_id is null

    union all

    select
      category.id,
      category.parent_id,
      (category_tree.path || '/' || category.slug)::text as path
    from public.categories category
    inner join category_tree on category.parent_id = category_tree.id
  )
  update public.categories category
  set path = category_tree.path
  from category_tree
  where category.id = category_tree.id
    and category.path is distinct from category_tree.path;
end;
$$;

create or replace function public.handle_category_path_change()
returns trigger
language plpgsql
as $$
begin
  perform public.rebuild_category_paths();
  return null;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists categories_rebuild_paths on public.categories;
create trigger categories_rebuild_paths
after insert or update of slug, parent_id or delete on public.categories
for each statement execute function public.handle_category_path_change();

alter table public.categories enable row level security;
alter table public.product_categories enable row level security;

create policy "categories_public_read_active"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "categories_admin_manage"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_categories_public_read_active_links"
on public.product_categories
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products product
    where product.id = product_categories.product_id
      and product.status = 'Active'
      and product.stock > 0
  )
  and exists (
    select 1
    from public.categories category
    where category.id = product_categories.category_id
      and category.is_active = true
  )
);

create policy "product_categories_admin_manage"
on public.product_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

select public.rebuild_category_paths();
