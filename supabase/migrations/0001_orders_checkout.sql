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
  shipping_cost numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
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
  unit_price numeric(10, 2) not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  gateway text not null default 'mercadopago',
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

alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;

-- Sem políticas públicas: apenas a service role (usada nas Server Actions/webhook,
-- nunca exposta ao navegador) pode ler/escrever pedidos, itens e pagamentos.
