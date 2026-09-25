alter table public.products
add column if not exists reserved_quantity integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_reserved_quantity_check'
  ) then
    alter table public.products
      add constraint products_reserved_quantity_check
      check (reserved_quantity >= 0);
  end if;
end $$;

alter table public.orders
add column if not exists reservation_expires_at timestamptz,
add column if not exists reservation_released_at timestamptz;

create index if not exists orders_open_reservation_expiry_idx
on public.orders(reservation_expires_at)
where payment_status = 'unpaid'
  and status = 'Pending'
  and reservation_released_at is null;

create or replace function public.release_order_stock_reservation(
  p_order_id text,
  p_payment_status text default null,
  p_status text default null,
  p_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders%rowtype;
  item_record record;
begin
  select *
  into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found: %', p_order_id;
  end if;

  if current_order.payment_status = 'paid' or current_order.status = 'Confirmed' then
    return false;
  end if;

  if current_order.reservation_released_at is not null then
    return false;
  end if;

  -- Release the reserved quantity back into the available pool without changing
  -- the physical stock count. `stock` remains on-hand inventory; only
  -- `reserved_quantity` is reduced here.
  for item_record in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    update public.products
    set reserved_quantity = greatest(reserved_quantity - item_record.quantity, 0)
    where id = item_record.product_id;
  end loop;

  update public.orders
  set
    payment_status = coalesce(p_payment_status, payment_status),
    status = coalesce(p_status, status),
    stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
    reservation_expires_at = null,
    reservation_released_at = coalesce(reservation_released_at, timezone('utc', now()))
  where id = p_order_id;

  return true;
end;
$$;

create or replace function public.release_expired_order_reservations(
  p_reference_time timestamptz default timezone('utc', now())
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_order record;
  released_count integer := 0;
begin
  for expired_order in
    select id
    from public.orders
    where payment_status = 'unpaid'
      and status = 'Pending'
      and reservation_released_at is null
      and reservation_expires_at is not null
      and reservation_expires_at <= p_reference_time
    order by reservation_expires_at
    for update skip locked
  loop
    if public.release_order_stock_reservation(
      expired_order.id,
      'expired',
      'Cancelled'
    ) then
      released_count := released_count + 1;
    end if;
  end loop;

  return released_count;
end;
$$;

create or replace function public.create_order_with_stock_reservation(
  p_order_id text,
  p_user_id uuid,
  p_customer_email text,
  p_customer_first_name text,
  p_customer_last_name text,
  p_customer_phone text,
  p_shipping_address_line1 text,
  p_shipping_city text,
  p_shipping_postal_code text,
  p_shipping_country text,
  p_notes text,
  p_currency text,
  p_payment_provider text,
  p_subtotal numeric,
  p_shipping numeric,
  p_total numeric,
  p_reservation_expires_at timestamptz,
  p_items jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_product record;
  expected_product_count integer := 0;
  locked_product_count integer := 0;
begin
  if p_reservation_expires_at is null or p_reservation_expires_at <= timezone('utc', now()) then
    raise exception 'Reservation expiry must be in the future.';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item.';
  end if;

  perform public.release_expired_order_reservations(timezone('utc', now()));

  select count(*)
  into expected_product_count
  from (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      quantity integer,
      unit_price numeric
    )
  ) requested_products;

  -- Lock every requested product row before checking availability. This keeps
  -- reservation math atomic and prevents two concurrent checkouts from
  -- claiming the same final unit.
  for locked_product in
    with requested_items as (
      select
        item.product_id,
        sum(item.quantity) as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        quantity integer,
        unit_price numeric
      )
      group by item.product_id
    )
    select
      product.id as product_id,
      product.status,
      product.stock,
      product.reserved_quantity,
      requested_items.quantity
    from public.products as product
    join requested_items on requested_items.product_id = product.id
    order by product.id
    for update
  loop
    locked_product_count := locked_product_count + 1;

    if locked_product.status <> 'Active' then
      raise exception 'Product unavailable: %', locked_product.product_id;
    end if;

    if locked_product.stock - locked_product.reserved_quantity < locked_product.quantity then
      raise exception 'Insufficient stock for product %', locked_product.product_id;
    end if;
  end loop;

  if locked_product_count <> expected_product_count then
    raise exception 'One or more products could not be reserved.';
  end if;

  insert into public.orders (
    id,
    user_id,
    customer_email,
    customer_first_name,
    customer_last_name,
    customer_phone,
    shipping_address_line1,
    shipping_city,
    shipping_postal_code,
    shipping_country,
    notes,
    currency,
    payment_provider,
    payment_status,
    subtotal,
    shipping,
    total,
    status,
    reservation_expires_at
  ) values (
    p_order_id,
    p_user_id,
    nullif(p_customer_email, ''),
    nullif(p_customer_first_name, ''),
    nullif(p_customer_last_name, ''),
    nullif(p_customer_phone, ''),
    nullif(p_shipping_address_line1, ''),
    nullif(p_shipping_city, ''),
    nullif(p_shipping_postal_code, ''),
    nullif(p_shipping_country, ''),
    nullif(p_notes, ''),
    p_currency,
    p_payment_provider,
    'unpaid',
    p_subtotal,
    p_shipping,
    p_total,
    'Pending',
    p_reservation_expires_at
  );

  insert into public.order_items (order_id, product_id, quantity, unit_price)
  select
    p_order_id,
    item.product_id,
    sum(item.quantity) as quantity,
    max(item.unit_price) as unit_price
  from jsonb_to_recordset(p_items) as item(
    product_id text,
    quantity integer,
    unit_price numeric
  )
  group by item.product_id;

  update public.products
  set reserved_quantity = public.products.reserved_quantity + requested_items.quantity
  from (
    select
      item.product_id,
      sum(item.quantity) as quantity
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      quantity integer,
      unit_price numeric
    )
    group by item.product_id
  ) as requested_items
  where public.products.id = requested_items.product_id;

  return true;
end;
$$;

create or replace function public.confirm_paid_order(
  p_order_id text,
  p_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  item_record record;
  current_order public.orders%rowtype;
begin
  select *
  into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found: %', p_order_id;
  end if;

  if current_order.payment_status = 'paid' or current_order.status = 'Confirmed' then
    return false;
  end if;

  if current_order.reservation_released_at is not null then
    return false;
  end if;

  -- Convert reserved stock into sold stock. This decrements physical on-hand
  -- inventory and removes the matching reservation in the same locked update.
  for item_record in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    update public.products
    set
      stock = stock - item_record.quantity,
      reserved_quantity = reserved_quantity - item_record.quantity
    where id = item_record.product_id
      and status = 'Active'
      and stock >= item_record.quantity
      and reserved_quantity >= item_record.quantity;

    if not found then
      raise exception 'Reserved stock could not be confirmed for product %', item_record.product_id;
    end if;
  end loop;

  update public.orders
  set
    status = 'Confirmed',
    payment_status = 'paid',
    stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
    paid_at = coalesce(paid_at, timezone('utc', now())),
    reservation_expires_at = null
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.release_order_stock_reservation(text, text, text, text)
from public, anon, authenticated;
grant execute on function public.release_order_stock_reservation(text, text, text, text)
to service_role;

revoke all on function public.release_expired_order_reservations(timestamptz)
from public, anon, authenticated;
grant execute on function public.release_expired_order_reservations(timestamptz)
to service_role;

revoke all on function public.create_order_with_stock_reservation(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  timestamptz,
  jsonb
)
from public, anon, authenticated;
grant execute on function public.create_order_with_stock_reservation(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  timestamptz,
  jsonb
)
to service_role;

revoke all on function public.confirm_paid_order(text, text) from public, anon, authenticated;
grant execute on function public.confirm_paid_order(text, text) to service_role;
