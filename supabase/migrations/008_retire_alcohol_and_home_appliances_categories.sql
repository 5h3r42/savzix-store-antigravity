-- Retire categories removed from the storefront taxonomy without deleting history.
-- The two affected products are gift sets and already retain their Gift Sets parent link.

with retired_alcohol as (
  select category.id
  from public.categories category
  join public.categories parent on parent.id = category.parent_id
  where category.slug = 'alcohol'
    and parent.slug = 'gift-sets'
),
affected_products as (
  delete from public.product_categories link
  using retired_alcohol category
  where link.category_id = category.id
  returning link.product_id
)
update public.product_categories link
set is_primary = true
where link.product_id in (select product_id from affected_products)
  and link.category_id = (
    select id
    from public.categories
    where slug = 'gift-sets'
      and parent_id is null
  );

update public.categories category
set is_active = false
where (category.slug = 'alcohol' and exists (
  select 1
  from public.categories parent
  where parent.id = category.parent_id
    and parent.slug = 'gift-sets'
))
or (category.slug = 'home-appliances' and exists (
  select 1
  from public.categories parent
  where parent.id = category.parent_id
    and parent.slug = 'electrical'
));
