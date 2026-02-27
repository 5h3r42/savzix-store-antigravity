alter table public.products
add column if not exists brand text not null default 'Brand';

create index if not exists products_brand_idx
on public.products(brand);
