alter table public.products
add column if not exists ean_barcodes text[] not null default '{}';

comment on column public.products.ean_barcodes is
  'Verified 13-digit EANs captured from the exact product source row.';
