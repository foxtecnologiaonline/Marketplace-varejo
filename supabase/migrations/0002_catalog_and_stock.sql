-- Catálogo (stores/categories/products) + baixa de estoque atômica no pedido.
--
-- Escopo desta migração (decisão deliberada, não todo o catálogo foi movido):
-- só o caminho de checkout (src/lib/catalog.ts + a RPC abaixo) passa a usar estas
-- tabelas quando o Supabase está configurado. As páginas de vitrine (home, listagem,
-- loja) continuam lendo src/lib/data.ts por ora — exibem o mesmo catálogo de
-- demonstração de qualquer forma, então convertê-las agora não mudava nenhum
-- comportamento visível, só risco. O que realmente importava corrigir (e que esta
-- migração resolve) é: hoje o checkout valida "quantidade <= stock" contra um número
-- estático que nunca é decrementado — dois pedidos simultâneos do último item em
-- estoque passariam os dois. A função create_order_with_items() abaixo resolve isso
-- de verdade: todo o pedido (inserir a ordem, decrementar estoque de cada item,
-- inserir os itens) roda em UMA transação — se o estoque de qualquer item não for
-- suficiente, a função inteira falha e nada é gravado.

create table if not exists stores (
  slug text primary key,
  name text not null,
  logo text not null,
  description text not null default ''
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  image text not null
);

create table if not exists products (
  id text primary key,
  slug text unique not null,
  name text not null,
  store_slug text not null references stores (slug),
  category_slug text not null references categories (slug),
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  installments_count int not null default 1 check (installments_count >= 1),
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  colors jsonb not null default '[]',
  description text not null default '',
  highlights text[] not null default '{}',
  stock int not null default 0 check (stock >= 0),
  free_shipping boolean not null default false,
  tags text[] not null default '{}',
  rating numeric(2, 1) not null default 0,
  reviews_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_store_slug_idx on products (store_slug);
create index if not exists products_category_slug_idx on products (category_slug);

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at(); -- criada em 0001_orders_checkout.sql

alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;

-- Catálogo é público por natureza (é uma vitrine): leitura liberada pra qualquer
-- um (anon incluso); escrita só pela service role (sem política de insert/update/delete).
create policy "Leitura pública de stores" on stores for select using (true);
create policy "Leitura pública de categories" on categories for select using (true);
create policy "Leitura pública de products" on products for select using (true);

-- Seed: mesmo catálogo de demonstração hoje em src/lib/data.ts, pra quem ligar o
-- banco não ver a loja esvaziada. Trocar/ampliar os produtos depois é trabalho normal
-- de CRUD, não desta migração.
insert into stores (slug, name, logo, description) values
  ('colegio-marista', 'Colégio Marista', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop', 'Uniformes oficiais do Infantil ao Médio'),
  ('colegio-positivo', 'Colégio Positivo', 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=200&auto=format&fit=crop', 'Linha completa de uniforme e educação física'),
  ('vila-olimpia', 'Vila Olímpia', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=200&auto=format&fit=crop', 'Uniformes esportivos e escolares'),
  ('uniformes-personalizados', 'Personalizados', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop', 'Coletes, bandeirões e kits sob encomenda')
on conflict (slug) do nothing;

insert into categories (slug, name, image) values
  ('camisetas', 'Camisetas', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=600&auto=format&fit=crop'),
  ('calcas', 'Calças', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop'),
  ('bermudas', 'Bermudas', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop'),
  ('agasalhos', 'Agasalhos', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop'),
  ('kit-maternidade', 'Kit Maternidade', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop')
on conflict (slug) do nothing;

insert into products (
  id, slug, name, store_slug, category_slug, price, compare_at_price, installments_count,
  images, sizes, colors, description, highlights, stock, free_shipping, tags, rating, reviews_count
) values
  ('p1', 'camiseta-manga-curta-marista', 'Camiseta Manga Curta Marista', 'colegio-marista', 'camisetas', 69.90, 84.90, 3,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p1a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p1b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Camiseta oficial em malha fria, com logotipo bordado e gola careca reforçada.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 42, true, array['escolar','uniforme'], 4.6, 38),
  ('p2', 'calca-moletom-positivo', 'Calça Moletom Positivo', 'colegio-positivo', 'calcas', 99.90, null, 4,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p2a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p2b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Calça de moletom flanelado com punho e cordão de ajuste na cintura.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 25, true, array['escolar','uniforme'], 4.6, 38),
  ('p3', 'bermuda-esportiva-vila-olimpia', 'Bermuda Esportiva Vila Olímpia', 'vila-olimpia', 'bermudas', 59.90, null, 2,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p3a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p3b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Bermuda em tactel com elástico e bolso lateral, ideal para educação física.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 60, false, array['escolar','uniforme'], 4.6, 38),
  ('p4', 'agasalho-conjunto-marista', 'Conjunto Agasalho Marista', 'colegio-marista', 'agasalhos', 148.90, 169.90, 6,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p4a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p4b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Conjunto blusão e calça em moletom com forro, gola alta e zíper frontal.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 18, true, array['escolar','uniforme'], 4.6, 38),
  ('p5', 'colete-personalizado-time', 'Colete Personalizado para Time', 'uniformes-personalizados', 'camisetas', 45.90, null, 2,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p5a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p5b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Colete esportivo em dry-fit, personalização de número e nome sob consulta.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 100, false, array['escolar','uniforme'], 4.6, 38),
  ('p6', 'body-kit-maternidade', 'Kit Body Maternidade (3 peças)', 'uniformes-personalizados', 'kit-maternidade', 89.90, null, 3,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p6a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p6b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Kit com 3 bodies em algodão egípcio, gola de abertura total e etiqueta sem costura.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 30, true, array['escolar','uniforme'], 4.6, 38),
  ('p7', 'camiseta-manga-longa-positivo', 'Camiseta Manga Longa Positivo', 'colegio-positivo', 'camisetas', 74.90, null, 3,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p7a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p7b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Camiseta manga longa em malha peletizada, ideal para o inverno.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 33, true, array['escolar','uniforme'], 4.6, 38),
  ('p8', 'calca-sarja-vila-olimpia', 'Calça Sarja Vila Olímpia', 'vila-olimpia', 'calcas', 109.90, null, 4,
   array['https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop&sig=p8a','https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop&sig=p8b'],
   array['2','4','6','8','10','12'],
   '[{"name":"Azul Marinho","hex":"#1b3670"},{"name":"Branco","hex":"#ffffff"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
   'Calça em sarja com elastano, cintura ajustável e bolsos reforçados.',
   array['Tecido antipilling','Reforço nas costuras','Secagem rápida'], 20, false, array['escolar','uniforme'], 4.6, 38)
on conflict (id) do nothing;

-- Cria o pedido inteiro (ordem + baixa de estoque + itens) numa única transação.
-- p_items: jsonb array de {product_id, name, size, color, quantity, unit_price}.
-- Se o estoque de QUALQUER item for insuficiente, a função inteira falha (exceção)
-- e o Postgres desfaz tudo — nenhum pedido "fantasma" fica gravado sem itens, e
-- nenhum estoque é decrementado para um pedido que não vai se completar.
create or replace function create_order_with_items(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_shipping_cost numeric,
  p_subtotal numeric,
  p_total numeric,
  p_store_slug text,
  p_items jsonb
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
    shipping_address, shipping_cost, subtotal, total
  ) values (
    'site', p_store_slug, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_cost, p_subtotal, p_total
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
      -- Prefixo "estoque_insuficiente:" é reconhecido por src/lib/catalog.ts para
      -- virar mensagem amigável; qualquer outra exceção vira erro genérico.
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

-- A função roda como security definer (precisa escrever em orders/order_items, que
-- não têm política pública de insert) — só a service role deve poder chamá-la.
revoke execute on function create_order_with_items from public, anon, authenticated;
