-- Cupom real (lote G, sugestão 10): antes "BEMVINDO10" era só uma promessa no
-- texto da newsletter, sem nenhuma validação por trás (ver src/lib/coupons.ts).
-- Agora o pedido grava QUAL cupom foi usado e QUANTO foi descontado, pra
-- conferência comercial e para o valor cobrado no Mercado Pago ser sempre
-- rastreável até o motivo do desconto.

alter table orders
  add column if not exists coupon_code text,
  add column if not exists discount numeric(10, 2) not null default 0 check (discount >= 0);

-- Mesma função de 0002_catalog_and_stock.sql, só com os dois parâmetros novos
-- (com default, pra não quebrar quem já chamava a assinatura antiga). O cupom
-- em si já foi validado no servidor (src/lib/coupons.ts) antes de chegar aqui —
-- a função só grava o resultado, não recalcula o desconto.
create or replace function create_order_with_items(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_shipping_cost numeric,
  p_subtotal numeric,
  p_total numeric,
  p_store_slug text,
  p_items jsonb,
  p_coupon_code text default null,
  p_discount numeric default 0
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_id text;
  v_quantity int;
  v_updated int;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'pedido_sem_itens';
  end if;

  insert into public.orders (
    origin, store_slug, customer_name, customer_email, customer_phone,
    shipping_address, shipping_cost, subtotal, total, coupon_code, discount
  ) values (
    'site', p_store_slug, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_cost, p_subtotal, p_total, p_coupon_code, p_discount
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := v_item ->> 'product_id';
    v_quantity := (v_item ->> 'quantity')::int;

    update public.products
    set stock = stock - v_quantity
    where id = v_product_id
      and stock >= v_quantity;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'estoque_insuficiente:%', v_product_id;
    end if;

    insert into public.order_items (order_id, product_id, name, size, color, quantity, unit_price)
    values (
      v_order_id, v_product_id, v_item ->> 'name', v_item ->> 'size', v_item ->> 'color',
      v_quantity, (v_item ->> 'unit_price')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;

revoke execute on function create_order_with_items from public, anon, authenticated;
