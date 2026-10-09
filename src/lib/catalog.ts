import "server-only";
import { getSupabaseAdmin, isDatabaseConfigured } from "./supabase-server";
import { products as mockProducts } from "./data";
import { createOrder, type CreateOrderInput, type Order } from "./orders";
import type { Product } from "./types";

/**
 * Busca um produto para o servidor validar o checkout (preço, estoque, tamanho,
 * cor). Consulta o Supabase quando configurado; senão usa o catálogo mock
 * (src/lib/data.ts) — mesma fonte que as páginas de vitrine usam hoje. As páginas
 * de vitrine (home, listagem, loja) continuam lendo data.ts diretamente por ora
 * (ver comentário no topo de supabase/migrations/0002_catalog_and_stock.sql);
 * só o caminho de checkout, onde preço/estoque errado custa dinheiro de verdade,
 * precisa ser DB-aware agora.
 */
export async function getProductByIdFromCatalog(id: string): Promise<Product | null> {
  if (!isDatabaseConfigured()) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(`Falha ao buscar produto ${id} no catálogo: ${error.message}`);
  }
  if (!data) return null;

  const price = Number(data.price);
  const installmentsCount = data.installments_count ?? 1;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    storeSlug: data.store_slug,
    categorySlug: data.category_slug,
    price,
    compareAtPrice: data.compare_at_price != null ? Number(data.compare_at_price) : undefined,
    installments: {
      count: installmentsCount,
      value: Math.round((price / installmentsCount) * 100) / 100,
      interestFree: true
    },
    images: data.images ?? [],
    sizes: data.sizes ?? [],
    colors: data.colors ?? [],
    description: data.description ?? "",
    highlights: data.highlights ?? [],
    stock: data.stock,
    freeShipping: data.free_shipping,
    tags: data.tags ?? [],
    rating: Number(data.rating ?? 0),
    reviewsCount: data.reviews_count ?? 0
  };
}

const INSUFFICIENT_STOCK_PATTERN = /estoque_insuficiente:(.+)/;

export type CreateOrderResult = { success: true; order: Order } | { success: false; error: string };

/**
 * Cria o pedido. Com Supabase configurado, chama a RPC create_order_with_items
 * (supabase/migrations/0002_catalog_and_stock.sql): pedido + baixa de estoque de
 * cada item + itens, tudo em UMA transação — se o estoque de qualquer item não
 * for suficiente no exato momento da gravação (ex.: corrida com outro pedido
 * simultâneo), a transação inteira é desfeita e nada fica gravado pela metade.
 * Sem Supabase configurado, cai no createOrder() de sempre (sem baixa de estoque —
 * coerente com o catálogo mock ser estático).
 */
export async function createOrderWithStockCheck(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!isDatabaseConfigured()) {
    const order = await createOrder(input);
    return { success: true, order };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone ?? null,
    p_shipping_address: input.shippingAddress,
    p_shipping_cost: input.shippingCost,
    p_subtotal: input.subtotal,
    p_total: input.total,
    p_store_slug: input.storeSlug ?? null,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }))
  });

  if (error) {
    const match = error.message.match(INSUFFICIENT_STOCK_PATTERN);
    if (match) {
      const product = input.items.find((item) => item.productId === match[1]?.trim());
      return {
        success: false,
        error: `Estoque insuficiente para ${product?.name ?? "um dos itens"} no momento da compra.`
      };
    }
    throw new Error(`Falha ao criar pedido (create_order_with_items): ${error.message}`);
  }

  return {
    success: true,
    order: { ...input, id: data as string, status: "novo", paymentStatus: "pendente", persisted: true }
  };
}
