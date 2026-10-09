-- Esquema de pedidos/pagamentos do MVP de checkout.
-- Catálogo (stores/categories/products) continua em src/lib/data.ts por ora;
-- este esquema cobre apenas o que precisa de persistência durável: pedidos e pagamentos.
-- Mesmo formato de Order/OrderItem/Payment já desenhado para a Fase 3 (ERP), ver docs/ESCOPO-FASE2.md.

create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  origin text not null default 'site' check (origin in ('site', 'manual', 'institucional')),
  store_slug text,
  status text not null default 'novo'
    check (status in ('novo', 'confirmado', 'em_producao', 'produzido', 'expedido', 'entregue', 'cancelado')),
  payment_status text not null default 'pendente'
    check (payment_status in ('pendente', 'pago', 'falhou', 'reembolsado')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  total numeric(10, 2) not null check (total >= 0),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  size text,
  color text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  gateway text not null default 'mercadopago',
  gateway_payment_id text not null,
  gross_amount numeric(10, 2),
  fee_amount numeric(10, 2),
  net_amount numeric(10, 2),
  status text not null,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists payments_order_id_idx on payments (order_id);
create index if not exists orders_mp_payment_id_idx on orders (mp_payment_id);

-- Um mesmo pagamento do gateway nunca é registrado duas vezes (defesa em
-- profundidade contra webhooks repetidos/concorrentes, além da checagem no código).
create unique index if not exists payments_gateway_payment_uidx
  on payments (gateway, gateway_payment_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = '';

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;

-- Sem políticas públicas: apenas a service role (usada nas Server Actions/webhook,
-- nunca exposta ao navegador) pode ler/escrever pedidos, itens e pagamentos.
