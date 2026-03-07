alter table public.orders
add column if not exists customer_email text,
add column if not exists customer_first_name text,
add column if not exists customer_last_name text,
add column if not exists customer_phone text,
add column if not exists shipping_address_line1 text,
add column if not exists shipping_city text,
add column if not exists shipping_postal_code text,
add column if not exists shipping_country text,
add column if not exists notes text,
add column if not exists currency text not null default 'GBP',
add column if not exists payment_provider text not null default 'stripe',
add column if not exists payment_status text not null default 'unpaid',
add column if not exists stripe_checkout_session_id text,
add column if not exists stripe_payment_intent_id text,
add column if not exists paid_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_currency_check'
  ) then
    alter table public.orders
      add constraint orders_currency_check
      check (currency = 'GBP');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_provider_check'
  ) then
    alter table public.orders
      add constraint orders_payment_provider_check
      check (payment_provider = 'stripe');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('unpaid', 'paid', 'failed', 'expired', 'refunded'));
  end if;
end $$;

create index if not exists orders_payment_status_idx
on public.orders(payment_status);

create index if not exists orders_status_payment_status_idx
on public.orders(status, payment_status);

create unique index if not exists orders_stripe_checkout_session_id_idx
on public.orders(stripe_checkout_session_id)
where stripe_checkout_session_id is not null;

create unique index if not exists orders_stripe_payment_intent_id_idx
on public.orders(stripe_payment_intent_id)
where stripe_payment_intent_id is not null;

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

  for item_record in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    update public.products
    set stock = stock - item_record.quantity
    where id = item_record.product_id
      and status = 'Active'
      and stock >= item_record.quantity;

    if not found then
      raise exception 'Insufficient stock for product %', item_record.product_id;
    end if;
  end loop;

  update public.orders
  set
    status = 'Confirmed',
    payment_status = 'paid',
    stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
    paid_at = coalesce(paid_at, timezone('utc', now()))
  where id = p_order_id;

  return true;
end;
$$;
