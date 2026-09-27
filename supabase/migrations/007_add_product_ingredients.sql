-- Store only ingredient lists verified against manufacturer information or product packaging.
-- Nullable so existing catalogue records remain valid until their ingredients are verified.
alter table public.products
  add column if not exists ingredients text;

comment on column public.products.ingredients is
  'Verified product ingredient list, preserved in its manufacturer or packaging order.';
